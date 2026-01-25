from fastapi import APIRouter
from backend.state.system_state import state

router = APIRouter()

@router.get("/status")
async def get_status():
    return state.get_status()
