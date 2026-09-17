from pydantic import BaseModel

class ShiftBase(BaseModel):
    shiftName: str
    startTime: str
    endTime: str
    breakHours: str
    gracePeriod: str
    weeklyOffs: str 

class ShiftCreate(ShiftBase):
    pass

class ShiftUpdate(ShiftBase):
    pass

class ShiftResponse(ShiftBase):
    id: int

    class Config:
        from_attributes = True
