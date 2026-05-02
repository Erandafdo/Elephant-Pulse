import asyncio
from datetime import datetime, timedelta
import random
from passlib.context import CryptContext
from app.db import init_db
from app.models import Event, Visitor, Ticket, EventLog, AdminUser, Tariff
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
async def seed_full_db():
    print("--- STARTING DATABASE SEED (DEMO MODE) ---")
    await init_db()
    print("Clean slate: Deleting old records...")
    await Event.find_all().delete()
    await Visitor.find_all().delete()
    await Ticket.find_all().delete()
    await EventLog.find_all().delete()
    await AdminUser.find_all().delete()
    await Tariff.find_all().delete()
    daily_events = [
        {"event_name": "Bottle Feeding (Morning)", "category": "Interaction", "capacity": 50},
        {"event_name": "River Bathing (Morning)", "category": "Observation", "capacity": 200},
        {"event_name": "Fruit Feeding", "category": "Interaction", "capacity": 100},
        {"event_name": "Museum Visit", "category": "Observation", "capacity": 80},
        {"event_name": "River Bathing (Afternoon)", "category": "Observation", "capacity": 200},
        {"event_name": "Mahout Talk", "category": "Special", "capacity": 40}
    ]
    event_objs = []
    print(f"Creating {len(daily_events)} Events...")
    for ev in daily_events:
        e = Event(**ev)
        await e.insert()
        event_objs.append(e)
    print("Creating Admin User...")
    admin = AdminUser(
        email="admin@pinnawala.lk",
        password_hash=pwd_context.hash("admin123"),
        name="System Admin",
        role="Administrator"
    )
    await admin.insert()
    print("Seeding Tariffs...")
    tariffs = [
        {
            "category": "Sri Lankan Residents",
            "price": "LKR 250",
            "price_value": 250.0,
            "currency": "LKR",
            "child_price": "LKR 100",
            "features": ["Valid NID Required", "Children (3-12): LKR 100", "Full Access"],
            "popular": False
        },
        {
            "category": "International Visitor",
            "price": "$15.00",
            "price_value": 15.00,
            "currency": "USD",
            "child_price": "$7.50",
            "features": ["Fast Track Entry", "Children (3-12): $7.50", "Free Guide Map"],
            "popular": True
        },
        {
            "category": "SAARC Region",
            "price": "$10.00",
            "price_value": 10.00,
            "currency": "USD",
            "child_price": "$5.00",
            "features": ["Passport Verify Req.", "Children (3-12): $5.00", "SAARC Member Rate"],
            "popular": False
        }
    ]
    for t_data in tariffs:
        await Tariff(**t_data).insert()
    print("Generating 50 Visitors...")
    countries = ["Sri Lanka"] * 10 + ["United Kingdom", "Germany", "India", "China", "USA"] * 8
    visitors = []
    pw_hash = pwd_context.hash("password123")
    for i in range(50):
        country = random.choice(countries)
        v = Visitor(
            name=f"Visitor {i+1}",
            age=random.randint(20, 65),
            country=country,
            email=f"user{i+1}@test.com",
            phone=f"+9477{random.randint(1000000, 9999999)}",
            password_hash=pw_hash
        )
        await v.insert()
        visitors.append(v)
    print("Generating 200 Tickets...")
    for _ in range(200):
        visitor = random.choice(visitors)
        days_ago = random.randint(0, 6)
        booking_date = datetime.now() - timedelta(days=days_ago)
        is_adult = visitor.age > 12
        if visitor.country == "Sri Lanka":
            currency = "LKR"
            price = 500.0 if is_adult else 250.0
        else:
            currency = "USD"
            price = 15.0 if is_adult else 8.0
        t = Ticket(
            visitor=visitor,
            event_name="General Entry",
            booking_date=booking_date,
            tickets_count=random.randint(1, 4),
            total_price=price * random.randint(1, 4),
            currency=currency,
            status="CONFIRMED"
        )
        await t.insert()
    print("Generating 500 Entry Logs for Heatmap...")
    today_start = datetime.now().replace(hour=8, minute=0, second=0)
    for _ in range(500):
        event = random.choice(daily_events)
        ev_name = event["event_name"]
        rand_val = random.random()
        if "Bathing" in ev_name:
            hour_offset = random.choice([2, 3, 6, 7]) 
        elif "Morning" in ev_name:
            hour_offset = random.randint(1, 4) 
        else:
            hour_offset = random.randint(1, 9) 
        log_time = today_start + timedelta(hours=hour_offset, minutes=random.randint(0, 59))
        log = EventLog(
            event_id="seeded_id",
            event_name=ev_name,
            action="check_in",
            timestamp=log_time
        )
        await log.insert()
    print("--- SEED COMPLETE: Admin Dashboard is now populated! ---")
if __name__ == "__main__":
    asyncio.run(seed_full_db())
