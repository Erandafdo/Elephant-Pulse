from fastapi import APIRouter
from app.models import Visitor, Ticket
from app.ml_engine import ml_engine
from datetime import datetime
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
@router.get("/stats")
async def get_dashboard_stats():
    total_visitors = await Visitor.count()
    total_tickets = await Ticket.count()
    cursor = Visitor.get_pymongo_collection().aggregate([
        {"$group": {"_id": "$country", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ])
    country_counts = await cursor.to_list(length=None)
    next_month = (datetime.now().month % 12) + 1
    forecast_val = ml_engine.forecast_attendance(next_month, 0) 
    return {
        "total_visitors_lifetime": total_visitors,
        "total_tickets_sold": total_tickets,
        "top_countries": country_counts,
        "ai_forecast_next_month": forecast_val,
        "ai_forecast_message": f"AI Predicts {forecast_val} visitors next month based on seasonal trends."
    }
@router.get("/schedule-recommendations")
async def get_schedule():
    month = datetime.now().month
    expected_traffic = ml_engine.forecast_attendance(month, 0)
    recommendations = []
    if expected_traffic > 50: 
        recommendations.append({
            "event": "Elephant Bathing",
            "action": "Increase Frequency",
            "reason": "High Visitor Forecast detected by AI."
        })
    return {"month": month, "recommendations": recommendations}
