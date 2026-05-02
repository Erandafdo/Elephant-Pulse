from fastapi import APIRouter, Depends
from app.ml_engine import ml_engine
from app.models import EventLog, Ticket, AdminUser
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
from datetime import datetime, timedelta
router = APIRouter(
    prefix="/admin",
    tags=["Admin Analytics"]
)
@router.get("/analytics/suggestions")
async def get_schedule_suggestions():
    next_month = (datetime.now().month % 12) + 1
    suggestions = ml_engine.optimize_schedule(next_month)
    return {
        "status": "success",
        "month": next_month,
        "suggestions": suggestions
    }
@router.get("/analytics/heatmap")
async def get_heatmap_data():
    logs = await EventLog.find(EventLog.action == "check_in").to_list()
    density_map = {} 
    for log in logs:
        hour = log.timestamp.hour
        time_str = f"{hour:02d}:00"
        location = log.event_name
        key = (time_str, location)
        density_map[key] = density_map.get(key, 0) + 1
    heatmap_data = []
    if not density_map:
        return {"status": "success", "data": []}
    max_count = max(density_map.values())
    for (time, location), count in density_map.items():
        intensity = int((count / max_count) * 100)
        heatmap_data.append({
            "time": time,
            "location": location,
            "intensity": intensity
        })
    heatmap_data.sort(key=lambda x: x["time"])
    return {
        "status": "success",
        "data": heatmap_data
    }
@router.get("/analytics/finance")
async def get_finance_data():
    tickets = await Ticket.find_all().to_list()
    total_tickets = 0
    total_revenue_usd = 0.0
    rev_foreign = 0.0
    rev_local = 0.0
    daily_sales_map = {day: 0 for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
    LKR_TO_USD = 0.0033 
    for t in tickets:
        total_tickets += t.tickets_count
        if t.currency == "LKR":
            usd_val = t.total_price * LKR_TO_USD
            rev_local += usd_val
        else:
            usd_val = t.total_price
            rev_foreign += usd_val
        total_revenue_usd += usd_val
        day_name = t.booking_date.strftime("%a")
        if day_name in daily_sales_map:
            daily_sales_map[day_name] += int(usd_val) 
    breakdown = [
        {"category": "Foreign (USD)", "revenue": round(rev_foreign, 2), "percentage": 0},
        {"category": "Local (LKR)", "revenue": round(rev_local, 2), "percentage": 0}
    ]
    if total_revenue_usd > 0:
        breakdown[0]["percentage"] = int((rev_foreign / total_revenue_usd) * 100)
        breakdown[1]["percentage"] = int((rev_local / total_revenue_usd) * 100)
    daily_sales_list = [{"day": k, "value": v} for k, v in daily_sales_map.items()]
    
    # CALCULATE REAL GROWTH (Current Month vs Previous Month)
    now = datetime.now()
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0)
    last_month_end = this_month_start - timedelta(seconds=1)
    last_month_start = last_month_end.replace(day=1, hour=0, minute=0, second=0)

    rev_this_month = sum(t.total_price * (LKR_TO_USD if t.currency=="LKR" else 1.0) for t in tickets if t.booking_date >= this_month_start)
    rev_last_month = sum(t.total_price * (LKR_TO_USD if t.currency=="LKR" else 1.0) for t in tickets if last_month_start <= t.booking_date <= last_month_end)
    
    growth = 0.0
    if rev_last_month > 0:
        growth = round(((rev_this_month - rev_last_month) / rev_last_month) * 100, 1)
    else:
        growth = 100.0 if rev_this_month > 0 else 0.0

    # CALCULATE REAL ACCURACY (Forecast vs Actual logs for today)
    logs_today = await EventLog.find(EventLog.timestamp >= now.replace(hour=0, minute=0)).to_list()
    actual_count = len(logs_today)
    forecast_count = ml_engine.forecast_attendance(now.month, now.weekday())
    
    accuracy = 100.0
    if forecast_count > 0:
        error = abs(actual_count - forecast_count) / forecast_count
        accuracy = round(max(0, (1 - error) * 100), 1)
    elif actual_count > 0:
        accuracy = 0.0 # Huge miss if we expected 0 but got some

    return {
        "status": "success",
        "data": {
            "total_revenue": round(total_revenue_usd, 2),
            "currency": "USD",
            "total_tickets": total_tickets,
            "revenue_growth": growth, 
            "ai_accuracy": accuracy,
            "category_breakdown": breakdown,
            "daily_sales": daily_sales_list
        }
    }
@router.get("/analytics/forecast")
async def get_forecast_data():
    import pandas as pd
    import os
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_PATH = os.path.join(BASE_DIR, "datasets/advanced_hourly/forecast_14_days.csv")
    if not os.path.exists(DATA_PATH):
        return {"status": "error", "message": "Forecast data not found. Retrain model."}
    try:
        df = pd.read_csv(DATA_PATH)
        records = df.to_dict(orient="records")
        return {
            "status": "success",
            "data": records
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

from pydantic import BaseModel

class AdminLoginSchema(BaseModel):
    email: str
    password: str

@router.post("/login")
async def admin_login(data: AdminLoginSchema):
    admin = await AdminUser.find_one(AdminUser.email == data.email)
    if admin and pwd_context.verify(data.password, admin.password_hash):
        initials = "".join([n[0] for n in admin.name.split()])
        return {
            "status": "success",
            "token": "real-db-authenticated-token",
            "user": {
                "name": admin.name,
                "initials": initials,
                "role": admin.role
            }
        }
    return {"status": "error", "message": "Invalid admin credentials"}

@router.get("/profile")
async def admin_profile(email: str = "admin@pinnawala.lk"):
    admin = await AdminUser.find_one(AdminUser.email == email)
    if admin:
        initials = "".join([n[0] for n in admin.name.split()])
        return {
            "status": "success",
            "data": {
                "name": admin.name,
                "initials": initials,
                "role": admin.role
            }
        }
    return {"status": "error", "message": "Admin not found"}

@router.get("/visitors")
async def get_all_visitors():
    from app.models import Visitor
    visitors = await Visitor.find_all().to_list()
    return {"status": "success", "data": visitors}

@router.get("/tickets")
async def get_all_tickets():
    from app.models import Ticket
    tickets = await Ticket.find_all(fetch_links=True).to_list()
    return {"status": "success", "data": tickets}

@router.get("/events")
async def get_all_events():
    from app.models import Event
    events = await Event.find_all().to_list()
    return {"status": "success", "data": events}
