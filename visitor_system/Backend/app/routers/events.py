from fastapi import APIRouter, HTTPException
from app.models import Event, EventLog
from typing import Optional
from pydantic import BaseModel
class CheckInRequest(BaseModel):
    visitor_id: Optional[str] = None
router = APIRouter(prefix="/events", tags=["Events"])
@router.get("/")
async def get_all_events():
    events = await Event.find_all().to_list()
    daily_schedule = [e for e in events if e.category in ["Observation", "Interaction"]]
    special_events = [e for e in events if e.category in ["Cultural", "Special"]]
    return {
        "status": "success",
        "daily_timetable": daily_schedule,
        "special_events": special_events
    }
@router.post("/{event_id}/checkin")
async def check_in(event_id: str, data: CheckInRequest):
    from app.models import Visitor
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.current_count += 1
    await event.save()
    
    if data.visitor_id:
        v = await Visitor.get(data.visitor_id)
        if v:
            v.loyalty_points += 50 
            await v.save()

    log = EventLog(
        event_id=str(event.id),
        event_name=event.event_name,
        visitor_id=data.visitor_id,
        action="check_in"
    )
    await log.insert()
    return {"status": "checked_in", "event": event.event_name, "current_count": event.current_count}
@router.post("/{event_id}/checkout")
async def check_out(event_id: str, data: CheckInRequest):
    from app.models import Visitor
    from datetime import datetime
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if data.visitor_id:
        last_log = await EventLog.find(
            EventLog.event_id == event_id,
            EventLog.visitor_id == data.visitor_id,
            EventLog.action == "check_in"
        ).sort(-EventLog.timestamp).first_or_none()
        
        if last_log:
            mins = (datetime.now() - last_log.timestamp).total_seconds() / 60
            v = await Visitor.get(data.visitor_id)
            if v:
                v.loyalty_points += int(max(0, mins))
                await v.save()

    if event.current_count > 0:
        event.current_count -= 1
        await event.save()
    log = EventLog(
        event_id=str(event.id),
        event_name=event.event_name,
        visitor_id=data.visitor_id,
        action="check_out"
    )
    await log.insert()
    return {"status": "checked_out", "event": event.event_name, "current_count": event.current_count}
