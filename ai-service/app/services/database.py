import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

logger = logging.getLogger("vidai.db")

# Cap on vendors fed to the LLM — llama3.2:3b runs a 4096-token context,
# an unbounded dump silently truncates or breaks every prompt.
MAX_VENDORS = 40
MAX_SERVICES_PER_VENDOR = 10


class DatabaseClient:
    def __init__(self):
        self.client: AsyncIOMotorClient | None = None
        self.db = None

    def connect(self):
        if self.db is not None:
            return
        try:
            self.client = AsyncIOMotorClient(settings.MONGODB_URI)
            self.db = self.client[settings.DB_NAME]
            host = settings.MONGODB_URI.split("@")[-1] if "@" in settings.MONGODB_URI else "localhost"
            logger.info("Connected to MongoDB at %s - DB: %s", host, settings.DB_NAME)
        except Exception as e:
            logger.error("Failed to connect to MongoDB: %s", e)

    def close(self):
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            logger.info("MongoDB connection closed")

    async def get_all_vendors(self, limit: int = MAX_VENDORS):
        """Fetch approved vendors with their services, capped for prompt context."""
        self.connect()
        if self.db is None:
            return []
        try:
            # Vendors live in 'users' with role='vendor'; services reference them by _id
            vendors = await self.db.users.find(
                {"role": "vendor", "isApproved": True}
            ).to_list(length=limit)

            services_by_vendor: dict = {}
            if vendors:
                ids = [v["_id"] for v in vendors]
                cursor = self.db.services.find({"vendor": {"$in": ids}})
                async for s in cursor:
                    services_by_vendor.setdefault(s["vendor"], []).append(s)

            return [
                {
                    "id": str(v["_id"]),
                    "businessName": v.get("businessName", v.get("name")),
                    "city": v.get("city"),
                    "servicesOffered": v.get("servicesOffered", []),
                    "services": [
                        {
                            "id": str(s.get("_id")),
                            "title": s.get("title"),
                            "description": s.get("description"),
                            "price": s.get("price"),
                            "priceUnit": s.get("priceUnit"),
                            "category": s.get("category"),
                            "city": s.get("city"),
                        }
                        for s in services_by_vendor.get(v["_id"], [])[:MAX_SERVICES_PER_VENDOR]
                    ],
                }
                for v in vendors
            ]
        except Exception as e:
            logger.error("Database error fetching vendors: %s", e)
            return []


db_client = DatabaseClient()
