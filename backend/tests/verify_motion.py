import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))


from backend.rover.motion import rover
import logging

def test_motion():
    # Force INFO level even if already configured by imports
    logging.getLogger().setLevel(logging.INFO)
    logging.basicConfig(level=logging.INFO)
    print("Testing Rover Motion Logic...")
    
    # Test cases
    test_cases = [
        {"x": 0, "y": 0, "speed": 100, "desc": "Stop"},
        {"x": 0, "y": 100, "speed": 100, "desc": "Full Forward"},
        {"x": 0, "y": -100, "speed": 100, "desc": "Full Backward"},
        {"x": 100, "y": 0, "speed": 100, "desc": "Hard Right Turn (4WS)"},
        {"x": -50, "y": 50, "speed": 100, "desc": "Gentle Left Turn (4WS)"},
        {"x": 0, "y": 0, "speed": 0, "servos": [90, 45, 135, 0], "desc": "Servo Test (Multi Override)"},
        {"x": 0, "y": 0, "speed": 0, "servo_angle": 90, "desc": "Servo Test (Single Legacy)"},
    ]

    for case in test_cases:
        print(f"\n--- {case['desc']} (x={case['x']}, y={case['y']}) ---")
        rover.process_command(
            case['x'], 
            case['y'], 
            case['speed'], 
            servo_angle=case.get('servo_angle'), 
            servos=case.get('servos')
        )
        
    print("\nCheck logs above for expected motor values.")

if __name__ == "__main__":
    test_motion()
