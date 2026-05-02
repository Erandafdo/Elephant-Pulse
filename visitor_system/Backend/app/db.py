import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models import Visitor, Ticket, Event, AnalyticsReport, ScheduleRecommendation, EventLog, AdminUser, Tariff
async def init_db():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_uri)
    await init_beanie(database=client.elephant_research_db, document_models=[
        Visitor,
        Ticket,
        AnalyticsReport,
        ScheduleRecommendation,
        Event,
        EventLog,
        AdminUser,
        Tariff
    ])
