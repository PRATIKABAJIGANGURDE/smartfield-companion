import logging
import sys
from pi_agent.config import config

# Mock RPi.GPIO if not running on Raspberry Pi
try:
    import RPi.GPIO as GPIO
except (ImportError, RuntimeError):
    # Dummy GPIO for Windows/Testing
    class GPIO:
        BCM = "BCM"
        OUT = "OUT"
        HIGH = 1
        LOW = 0
        @staticmethod
        def setmode(mode): pass
        @staticmethod
        def setup(pin, mode): pass
        @staticmethod
        def output(pin, state): pass
        @staticmethod
        def cleanup(): pass
        class PWM:
            def __init__(self, pin, freq): pass
            def start(self, duty): pass
            def ChangeDutyCycle(self, duty): pass
            def stop(self): pass
    logging.warning("RPi.GPIO not found. Using mock GPIO driver.")

class MotorDriver:
    """
    Motor Driver for PWM + DIR Control (Unified Drive).
    """
    def __init__(self):
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(config.MOTOR_PWM, GPIO.OUT)
        GPIO.setup(config.MOTOR_DIR, GPIO.OUT)

        self.pwm = GPIO.PWM(config.MOTOR_PWM, config.PWM_FREQ_MOTOR)
        self.pwm.start(0)

        GPIO.output(config.MOTOR_DIR, GPIO.LOW)
        logging.info("MotorDriver (PWM+DIR) initialized.")

    def drive(self, speed: int):
        """
        speed: -100 to +100
        """
        speed = max(-config.MAX_SPEED, min(config.MAX_SPEED, speed))

        if speed >= 0:
            GPIO.output(config.MOTOR_DIR, GPIO.HIGH)
            self.pwm.ChangeDutyCycle(speed)
        else:
            GPIO.output(config.MOTOR_DIR, GPIO.LOW)
            self.pwm.ChangeDutyCycle(abs(speed))

    def stop(self):
        self.pwm.ChangeDutyCycle(0)
        logging.info("🛑 [MOTORS] Stopped.")

    def cleanup(self):
        self.stop()
        GPIO.cleanup()

