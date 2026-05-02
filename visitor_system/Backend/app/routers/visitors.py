from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models import Visitor, Ticket, EventLog, Tariff
from app.ml_engine import ml_engine
from pydantic import BaseModel, EmailStr
from datetime import datetime
import qrcode
import io
import base64
router = APIRouter(prefix="/visitors", tags=["Visitors"])
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
class VisitorRequest(BaseModel):
    name: str
    age: int
    country: str
    email: EmailStr
    phone: str
    password: str 
    event_preference: str = None 
    booking_date: datetime
    tickets_count: int
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
@router.post("/login")
async def login_visitor(data: LoginRequest):
    visitor = await Visitor.find_one(Visitor.email == data.email)
    if not visitor:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not visitor.password_hash or not pwd_context.verify(data.password, visitor.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "status": "success",
        "visitor_id": str(visitor.id),
        "name": visitor.name,
        "role": "visitor"
    }
@router.post("/register")
async def register_visitor(data: VisitorRequest):
    existing = await Visitor.find_one(Visitor.email == data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    final_event = data.event_preference
    ai_note = "User selected"
    if not final_event:
        final_event = ml_engine.predict_preference(data.age, data.country)
        ai_note = "AI Recommended based on Country/Age Profile"
    hashed_pw = pwd_context.hash(data.password)
    visitor = Visitor(
        name=data.name,
        age=data.age,
        country=data.country,
        email=data.email,
        phone=data.phone,
        password_hash=hashed_pw
    )
    await visitor.insert()
    SAARC_COUNTRIES = ["Afghanistan", "Bangladesh", "Bhutan", "India", "Maldives", "Nepal", "Pakistan", "Sri Lanka"]
    is_adult = data.age > 12
    if data.country.lower() == "sri lanka":
        base_rate = 250 if is_adult else 100
        currency = "LKR"
    elif data.country in SAARC_COUNTRIES:
        base_rate = 10.00 if is_adult else 5.00
        currency = "USD"
    else:
        base_rate = 15.00 if is_adult else 7.50
        currency = "USD"
    vat_multiplier = 1.18
    ticket_price_unit = base_rate * vat_multiplier
    total_price = round(ticket_price_unit * data.tickets_count, 2)
    tickets = Ticket(
        visitor=visitor,
        event_name=final_event,
        booking_date=datetime.now(),
        tickets_count=data.tickets_count,
        total_price=total_price,
        currency=currency
    )
    await tickets.insert()
    return {
        "status": "success",
        "ticket_id": str(tickets.id),
        "visitor_id": str(visitor.id),
        "event": final_event,
        "ai_note": ai_note,
        "qr_code_data": tickets.qr_code_data,
        "price_details": {
            "currency": currency,
            "unit_price_inc_vat": round(ticket_price_unit, 2),
            "total_price": total_price,
        }
    }
@router.get("/")
async def get_all_visitors():
    return await Visitor.find_all().to_list()
@router.get("/{visitor_id}/history")
async def get_visitor_history(visitor_id: str):
    try:
        visitor = await Visitor.get(visitor_id)
        if not visitor:
            raise HTTPException(status_code=404, detail="Visitor not found")
        tickets = await Ticket.find(Ticket.visitor.id == visitor.id).to_list()
        logs = await EventLog.find(EventLog.visitor_id == visitor_id).sort(+EventLog.timestamp).to_list()
        visit_history = []
        open_sessions = {} 
        for log in logs:
            if log.action == "check_in":
                open_sessions[log.event_name] = log.timestamp
            elif log.action == "check_out" and log.event_name in open_sessions:
                start_time = open_sessions.pop(log.event_name)
                duration = log.timestamp - start_time
                minutes_spent = round(duration.total_seconds() / 60, 1)
                visit_history.append({
                    "event_name": log.event_name, 
                    "check_in": start_time.isoformat(),
                    "check_out": log.timestamp.isoformat(),
                    "minutes_spent": minutes_spent
                })
        return {
            "status": "success",
            "visitor": visitor.name,
            "loyalty_points": visitor.loyalty_points,
            "tickets": tickets,
            "journey_history": visit_history,
            "active_sessions": list(open_sessions.keys()) 
        }
    except Exception as e:
        print(f"Error serving history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
class TicketPurchaseRequest(BaseModel):
    booking_date: datetime
    tickets_count: int
    event_preference: str = "General Entry"
@router.post("/{visitor_id}/tickets")
async def purchase_ticket(visitor_id: str, data: TicketPurchaseRequest):
    visitor = await Visitor.get(visitor_id)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    SAARC_COUNTRIES = ["Afghanistan", "Bangladesh", "Bhutan", "India", "Maldives", "Nepal", "Pakistan", "Sri Lanka"]
    is_adult = visitor.age > 12
    if visitor.country.lower() == "sri lanka":
        base_rate = 250 if is_adult else 100
        currency = "LKR"
    elif visitor.country in SAARC_COUNTRIES:
        base_rate = 10.00 if is_adult else 5.00
        currency = "USD"
    else:
        base_rate = 15.00 if is_adult else 7.50
        currency = "USD"
    vat_multiplier = 1.18
    ticket_price_unit = base_rate * vat_multiplier
    total_price = round(ticket_price_unit * data.tickets_count, 2)
    tickets = Ticket(
        visitor=visitor,
        event_name=data.event_preference,
        booking_date=data.booking_date,
        tickets_count=data.tickets_count,
        total_price=total_price,
        currency=currency
    )
    await tickets.insert()
    return {
        "status": "success",
        "ticket_id": str(tickets.id),
        "qr_code_data": tickets.qr_code_data,
        "price_details": {
            "currency": currency,
            "total_price": total_price
        }
    }
@router.get("/park-status")
async def get_park_status():
    now = datetime.now()
    open_time = now.replace(hour=8, minute=30, second=0, microsecond=0)
    close_time = now.replace(hour=17, minute=30, second=0, microsecond=0)
    is_open = open_time <= now < close_time
    if is_open:
        diff = close_time - now
        hours_left = diff.seconds // 3600
        mins_left = (diff.seconds % 3600) // 60
        text = f"Closing in {hours_left}h {mins_left}m"
    else:
        text = "Opens at 8:30 AM"
    is_tomorrow = now.hour >= 17 and now.minute >= 30
    visit_day = "Tomorrow" if is_tomorrow else "Today"
    visit_time = "09:15 AM" if is_tomorrow else "10:30 AM"

    # Predicton Logic via ML
    forecast_month = (now + timedelta(days=1)).month if is_tomorrow else now.month
    forecast_dow = (now + timedelta(days=1)).weekday() if is_tomorrow else now.weekday()
    predicted_count = ml_engine.forecast_attendance(forecast_month, forecast_dow)
    
    # Simple semantic mapping
    if predicted_count < 200:
        crowd_status = "Low Crowds"
    elif predicted_count < 600:
        crowd_status = "Moderate Crowd"
    else:
        crowd_status = "High Capacity"

    return {
        "status": "success",
        "park": {
            "is_open": is_open,
            "status_text": text
        },
        "ai_insight": {
            "day": visit_day,
            "time": visit_time,
            "prediction": crowd_status,
            "event": "Bottle Feeding" if is_tomorrow else "River Bathing"
        }
    }
@router.get("/tickets/config")
async def get_ticket_config():
    tariffs = await Tariff.find_all().to_list()
    return {
        "status": "success",
        "tariffs": tariffs
    }
