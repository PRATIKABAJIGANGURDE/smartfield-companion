from typing import Dict, List, Any

class AIRulesEngine:
    @staticmethod
    def analyze(sensors: Dict[str, Any]) -> Dict[str, Any]:
        recommendations = []
        soil = sensors.get("soil", {})
        
        # pH Rules
        ph = soil.get("ph", 7.0)
        if ph < 6.0:
            recommendations.append({
                "action": "Add lime",
                "reason": f"pH is acidic ({ph}). Optimal range is 6.5-7.5."
            })
        elif ph > 7.5:
             recommendations.append({
                "action": "Add sulfur",
                "reason": f"pH is alkaline ({ph}). Optimal range is 6.5-7.5."
            })

        # Nitrogen Rules
        n = soil.get("nitrogen", 0)
        if n < 20:
             recommendations.append({
                "action": "Apply nitrogen fertilizer",
                "reason": f"Nitrogen level is low ({n})."
            })

        # Moisture Rules
        moisture = soil.get("moisture", 0)
        if moisture < 30:
            recommendations.append({
                "action": "Water crops",
                "reason": f"Soil moisture is low ({moisture}%)."
            })

        summary = "Soil is healthy."
        if recommendations:
            summary = "Attention required: " + ", ".join([r["action"] for r in recommendations]) + "."

        return {
            "summary": summary,
            "recommendations": recommendations
        }
