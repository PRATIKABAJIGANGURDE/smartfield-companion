from fastapi import APIRouter
from backend.state.system_state import state

router = APIRouter()

@router.get("/sensors")
async def get_sensors():
    return state.get_sensors()
