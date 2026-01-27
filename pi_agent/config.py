from pydantic_settings import BaseSettings

class RoverConfig(BaseSettings):
    # Motor Pins (BCM)
    # NOTE: For a 6-wheel rover, wire all 3 LEFT motors in parallel to these pins.
    #       Wire all 3 RIGHT motors in parallel to the RIGHT pins.
    #       This treats the 6 motors as 2 big "sides" (Differential Drive).
    LEFT_IN1: int = 5
    LEFT_IN2: int = 6
    LEFT_PWM: int = 12
    
    RIGHT_IN1: int = 13
    RIGHT_IN2: int = 19
    RIGHT_PWM: int = 18
    
    # Motor Settings
    PWM_FREQ_MOTOR: int = 1000
    
    # Servo Settings
    # Assumed layout: Front-Left, Front-Right, Rear-Left, Rear-Right
    SERVO_PIN_FL: int = 23
    SERVO_PIN_FR: int = 24
    SERVO_PIN_RL: int = 25
    SERVO_PIN_RR: int = 8
    
    PWM_FREQ_SERVO: int = 50
    
    # Motion Tuning
    MAX_SPEED: int = 100
    WATCHDOG_TIMEOUT: float = 1.0
    JOYSTICK_DEADZONE: int = 5

config = RoverConfig()
