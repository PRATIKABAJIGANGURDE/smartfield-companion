from pydantic_settings import BaseSettings

class RoverConfig(BaseSettings):
    # Motor Driver (PWM + DIR type)
    MOTOR_PWM: int = 12   # PWM pin
    MOTOR_DIR: int = 16   # Direction pin

    # Motor Settings
    PWM_FREQ_MOTOR: int = 1000
    MAX_SPEED: int = 100       # Full Speed allowed
    WATCHDOG_TIMEOUT: float = 1.0
    
    # Servo Settings
    # Assumed layout: Front-Left, Front-Right, Rear-Left, Rear-Right
    SERVO_PIN_FL: int = 23
    SERVO_PIN_FR: int = 24
    SERVO_PIN_RL: int = 25
    SERVO_PIN_RR: int = 8
    
    PWM_FREQ_SERVO: int = 50
    
    # Motion Tuning
    JOYSTICK_DEADZONE: int = 5

config = RoverConfig()
