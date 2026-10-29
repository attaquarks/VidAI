"""
VidAI AI Service — API Router
Three endpoints matching the backend proxy contract:
  POST /api/v1/chat
  POST /api/v1/recommendations
  POST /api/v1/budget-plan
"""

import logging
import json

from fastapi import APIRouter, HTTPException
import httpx

from app.config import settings
from app.models.schemas import (
    BudgetAllocation,
    BudgetPlanRequest,
    BudgetPlanResponse,
    BudgetPlanResponseData,
    ChatMessage,
    ChatRequest,
    ChatResponse,
    ChatResponseData,
    RecommendationItem,
    RecommendationRequest,
    RecommendationResponse,
    RecommendationResponseData,
)
from app.services.ollama_service import ollama_service
from app.services.gemini_service import gemini_service
from app.services.database import db_client
from app.services.prompts import (
    build_budget_prompt,
    build_chat_messages,
    build_recommendation_prompt,
)

logger = logging.getLogger("vidai.router")

router = APIRouter(prefix="/api/v1", tags=["AI"])


async def _vendors_context() -> str:
    """Real vendor data appended to prompts; empty string when the DB is unreachable."""
    try:
        vendors = await db_client.get_all_vendors()
        return json.dumps(vendors, indent=2) if vendors else ""
    except Exception as e:
        logger.error("Failed to fetch vendors context: %r", e)
        return ""


def _llm():
    """
    The engine that answers chat/recommendations/budget-plan: Gemini when
    configured for cloud use, Ollama otherwise. Invitations always use Gemini.
    """
    if settings.LLM_PROVIDER == "gemini" and gemini_service.model:
        return gemini_service
    return ollama_service


def _unavailable(exc: Exception) -> HTTPException:
    """Log the real error, hand the client a generic message."""
    logger.error("%s", repr(exc))
    return HTTPException(
        status_code=503,
        detail="AI service is unavailable right now. Please try again in a moment.",
    )


# ── Chat Endpoint ────────────────────────────────────────────────────


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Chat with the VidAI wedding planning assistant.
    Sends conversation to Ollama and returns the assistant's reply.
    """
    try:
        history_dicts = [
            {"role": msg.role, "content": msg.content}
            for msg in request.conversationHistory
        ]
        messages = build_chat_messages(
            request.message,
            history_dicts,
            vendors_context=await _vendors_context(),
        )

        ai_reply = await _llm().chat(messages)

        updated_history = list(request.conversationHistory) + [
            ChatMessage(role="user", content=request.message),
            ChatMessage(role="assistant", content=ai_reply),
        ]

        return ChatResponse(
            data=ChatResponseData(
                response=ai_reply,
                conversationHistory=updated_history,
            )
        )

    except Exception as exc:
        raise _unavailable(exc) from exc


# ── Recommendations Endpoint ─────────────────────────────────────────


@router.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Get AI-powered vendor recommendations for a Pakistani wedding.
    Returns structured JSON with recommendations, costs, and tips.
    """
    try:
        messages = build_recommendation_prompt(
            preferences=request.preferences,
            budget=request.budget,
            city=request.city,
            category=request.category,
            vendors_context=await _vendors_context(),
        )

        result = await _llm().generate_json(messages)

        recommendations = [
            RecommendationItem(
                category=rec.get("category", request.category or "general"),
                suggestion=rec.get("suggestion", ""),
                estimatedCost=rec.get("estimatedCost", "Contact for pricing"),
                reasoning=rec.get("reasoning", ""),
                tips=rec.get("tips", []),
            )
            for rec in result.get("recommendations", [])
        ]

        return RecommendationResponse(
            data=RecommendationResponseData(
                recommendations=recommendations,
                summary=result.get("summary", ""),
                city=request.city,
                budget=request.budget,
            )
        )

    except ValueError as exc:
        # Model produced non-JSON output — user-facing, no retry loop
        logger.warning("Recommendation JSON parse error: %s", exc)
        return RecommendationResponse(
            data=RecommendationResponseData(
                recommendations=[],
                summary="Could not parse AI response. Please try again.",
                city=request.city,
                budget=request.budget,
            )
        )

    except httpx.TransportError as exc:
        # Ollama down or slow — degrade to an empty result instead of a 503
        logger.warning("Recommendations transport error: %r", exc)
        return RecommendationResponse(
            data=RecommendationResponseData(
                recommendations=[],
                summary="AI is not responding right now. Please try again shortly.",
                city=request.city,
                budget=request.budget,
            )
        )

    except Exception as exc:
        raise _unavailable(exc) from exc


# ── Budget Plan Endpoint ─────────────────────────────────────────────


@router.post("/budget-plan", response_model=BudgetPlanResponse)
async def get_budget_plan(request: BudgetPlanRequest):
    """
    Generate an AI-powered budget allocation plan for a Pakistani wedding.
    Returns structured allocations matching the Budget model's aiPlan schema.
    """
    try:
        messages = build_budget_prompt(
            total_budget=request.totalBudget,
            event_type=request.eventType,
            preferences=request.preferences,
            vendors_context=await _vendors_context(),
        )

        result = await _llm().generate_json(messages)

        raw_allocations = result.get("allocations", [])
        allocations = []
        total_percentage = 0.0

        for alloc in raw_allocations:
            pct = float(alloc.get("percentage", 0))
            # Recalculate amount from percentage to ensure consistency
            amount = round(request.totalBudget * pct / 100, 2)
            total_percentage += pct

            allocations.append(
                BudgetAllocation(
                    category=alloc.get("category", "other"),
                    percentage=pct,
                    amount=amount,
                    explanation=alloc.get("explanation", ""),
                )
            )

        # Normalize percentages if they don't sum to 100
        if allocations and abs(total_percentage - 100) > 0.5:
            logger.warning(
                "AI allocations sum to %.1f%%, normalizing to 100%%",
                total_percentage,
            )
            factor = 100.0 / total_percentage if total_percentage > 0 else 1.0
            for alloc in allocations:
                alloc.percentage = round(alloc.percentage * factor, 1)
                alloc.amount = round(request.totalBudget * alloc.percentage / 100, 2)

        return BudgetPlanResponse(
            data=BudgetPlanResponseData(
                allocations=allocations,
                summary=result.get("summary", ""),
                tips=result.get("tips", []),
                totalBudget=request.totalBudget,
                eventType=request.eventType,
                currency="PKR",
            )
        )

    except ValueError as exc:
        logger.warning("Budget plan JSON parse error: %s", exc)
        return _build_fallback_budget(request.totalBudget, request.eventType)

    except httpx.TransportError as exc:
        # Ollama down or slow — a static plan beats no plan
        logger.warning("Budget plan transport error, returning fallback: %r", exc)
        return _build_fallback_budget(request.totalBudget, request.eventType)

    except Exception as exc:
        raise _unavailable(exc) from exc


# ── Fallback Budget Plan ─────────────────────────────────────────────


def _build_fallback_budget(
    total_budget: float,
    event_type: str,
) -> BudgetPlanResponse:
    """Return a sensible static budget plan when AI fails to produce valid JSON."""

    # Default Pakistani wedding budget breakdown
    breakdown = {
        "full_wedding": [
            ("venue", 25),
            ("catering", 25),
            ("photography", 8),
            ("videography", 7),
            ("decoration", 10),
            ("bridal_wear", 8),
            ("makeup_artist", 4),
            ("invitation_cards", 3),
            ("transport", 3),
            ("dj_music", 3),
            ("other", 4),
        ],
        "walima": [
            ("venue", 30),
            ("catering", 35),
            ("decoration", 10),
            ("photography", 10),
            ("groom_wear", 5),
            ("invitation_cards", 3),
            ("transport", 3),
            ("other", 4),
        ],
        "mehndi": [
            ("venue", 20),
            ("catering", 20),
            ("mehndi_artist", 15),
            ("decoration", 15),
            ("dj_music", 10),
            ("photography", 8),
            ("bridal_wear", 7),
            ("other", 5),
        ],
        "nikkah": [
            ("venue", 30),
            ("catering", 25),
            ("photography", 10),
            ("bridal_wear", 10),
            ("decoration", 8),
            ("invitation_cards", 5),
            ("makeup_artist", 5),
            ("transport", 3),
            ("other", 4),
        ],
    }

    items = breakdown.get(event_type, breakdown["full_wedding"])

    allocations = [
        BudgetAllocation(
            category=cat,
            percentage=float(pct),
            amount=round(total_budget * pct / 100, 2),
            explanation=f"Standard {pct}% allocation for {cat.replace('_', ' ')}",
        )
        for cat, pct in items
    ]

    return BudgetPlanResponse(
        data=BudgetPlanResponseData(
            allocations=allocations,
            summary=(
                f"Standard budget plan for a Pakistani {event_type.replace('_', ' ')} "
                f"with a total budget of PKR {total_budget:,.0f}. "
                f"This is a fallback plan — try again for AI-personalized allocations."
            ),
            tips=[
                "Book venues during off-peak season (January-March) for 20-30% discounts",
                "Negotiate package deals when hiring photographer + videographer together",
                "Consider local designers instead of big brands for bridal wear to save 40-50%",
            ],
            totalBudget=total_budget,
            eventType=event_type,
            currency="PKR",
        )
    )
