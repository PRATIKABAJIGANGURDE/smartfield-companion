from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.rover.motion import rover
from backend.state.system_state import state

router = APIRouter()

from typing import List, Optional

class DriveCommand(BaseModel):
    x: int = Field(..., ge=-100, le=100, description="Turn value (-100 to 100)")
    y: int = Field(..., ge=-100, le=100, description="Forward/Backward value (-100 to 100)")
    speed: int = Field(..., ge=0, le=100, description="Speed scaling factor (0 to 100)")
    servo_angle: int = Field(None, ge=0, le=180, description="Optional single servo angle (deprecated)")
    servos: Optional[List[int]] = Field(None, description="List of 4 servo angles (0-180)")

@router.post("/drive")
async def drive_rover(cmd: DriveCommand):
    try:
        # Update system state to reflect activity
        state.update_last_command_time()
        
        # Execute motor command via RoverBrain
        rover.process_command(cmd.x, cmd.y, cmd.speed, cmd.servo_angle, cmd.servos)
        
        return {"status": "ok"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
