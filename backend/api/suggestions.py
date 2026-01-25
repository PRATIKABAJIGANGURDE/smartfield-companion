from fastapi import APIRouter
from backend.state.system_state import state
from backend.ai.rules_engine import AIRulesEngine

router = APIRouter()

@router.get("/suggestions")
async def get_suggestions():
    # Get current sensor state
    current_sensors = state.sensors
    # Analyze and return
    return AIRulesEngine.analyze(current_sensors)
