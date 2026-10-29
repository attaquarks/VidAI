import asyncio
import json
import logging

from google import genai
from google.genai import types

from app.config import settings

logger = logging.getLogger("vidai.gemini")


class GeminiService:
    def __init__(self):
        self.model_name = settings.GEMINI_MODEL
        if settings.GOOGLE_API_KEY:
            self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        else:
            self.client = None

    async def _generate(self, contents, system_instruction=None, json_mode=False):
        """Run one Gemini call off the event loop."""
        def _call():
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json" if json_mode else None,
            )
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=config,
            )
            return response
        response = await asyncio.to_thread(_call)
        return response.text

    async def chat(self, messages: list[dict]) -> str:
        """
        Hosted chat completion. `messages` is the Ollama-shaped array the
        prompt builders produce: [{role: system|user|assistant, content}].
        Raises RuntimeError when no API key is configured so the caller can
        fall back to Ollama.
        """
        if not self.client:
            raise RuntimeError("GOOGLE_API_KEY is not configured")
        system_chunks = [m["content"] for m in messages if m.get("role") == "system"]
        contents = [
            types.Content(
                role="model" if m.get("role") == "assistant" else "user",
                parts=[types.Part(text=m["content"])],
            )
            for m in messages
            if m.get("role") != "system"
        ]
        text = await self._generate(
            contents,
            system_instruction="\n\n".join(system_chunks) or None,
        )
        return text or ""

    async def generate_json(self, messages: list[dict]) -> dict:
        """
        Hosted structured output. Same contract as OllamaService.generate_json:
        returns a parsed dict or raises ValueError (handled as a fallback
        trigger by the routers).
        """
        import json as _json

        if not self.client:
            raise RuntimeError("GOOGLE_API_KEY is not configured")
        system_chunks = [m["content"] for m in messages if m.get("role") == "system"]
        contents = [
            types.Content(
                role="model" if m.get("role") == "assistant" else "user",
                parts=[types.Part(text=m["content"])],
            )
            for m in messages
            if m.get("role") != "system"
        ]
        text = await self._generate(
            contents,
            system_instruction="\n\n".join(system_chunks) or None,
            json_mode=True,
        )
        try:
            return _json.loads(text.strip())
        except _json.JSONDecodeError as e:
            logger.error("Gemini returned invalid JSON: %s\nRaw: %s", e, (text or "")[:300])
            raise ValueError("Gemini returned invalid JSON") from e

    async def generate_invitation_content(self, essentials: dict, style: dict, tone: str):
        if not self.client:
            return self._fallback(essentials)

        prompt = f"""
        You are an expert wedding invitation card writer.
        Generate the text content for a digital wedding invitation card based on the following details:

        Essentials:
        - Names: {essentials.get('names')}
        - Date: {essentials.get('date')}
        - Time: {essentials.get('time')}
        - Venue: {essentials.get('venueName')}, {essentials.get('venueCity')}

        Style & Vibe:
        - Theme: {style.get('theme')}
        - Color Palette: {style.get('colorPalette')}
        - Orientation: {style.get('orientation')}
        - Imagery/Motifs: {style.get('imagery')}

        Tone: {tone}

        Please provide the response in a structured JSON format with the following keys:
        - headline: A catchy or formal opening (e.g., "The Wedding of...", "Join us...")
        - bodyText: The main invitation text including names and invitation message.
        - footerText: A closing message or quote.
        - rsvpInfo: A brief RSVP instruction.

        Keep the text elegant and evocative according to the chosen tone and theme.
        Ensure the output is ONLY valid JSON.
        """

        try:
            # The Google SDK is synchronous — keep it off the event loop
            result = await self.generate_json(
                [{"role": "user", "content": prompt}]
            )
            return result
        except Exception as e:
            logger.warning("Gemini generation failed, using fallback: %s", e)
            return self._fallback(essentials)

    @staticmethod
    def _fallback(essentials: dict) -> dict:
        return {
            "headline": f"Celebrating the Love of {essentials.get('names')}",
            "bodyText": (
                f"We invite you to share in our joy as we exchange vows on "
                f"{essentials.get('date')} at {essentials.get('time')}. "
                f"Ceremony to be held at {essentials.get('venueName')}, {essentials.get('venueCity')}."
            ),
            "footerText": "Your presence means the world to us.",
            "rsvpInfo": "Kindly respond by visiting our website.",
        }


gemini_service = GeminiService()
