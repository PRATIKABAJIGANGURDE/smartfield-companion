import logging
from pi_agent.config import config

# Mock RPi.GPIO if not running on Raspberry Pi (Shared mock logic could be extracted, but keeping isolated for now)
try:
    import RPi.GPIO as GPIO
except (ImportError, RuntimeError):
    # Using the same mock assumption as motor_driver.py
    class GPIO:
        BCM = "BCM"
        OUT = "OUT"
        @staticmethod
        def setup(pin, mode): pass
        
        class PWM:
            def __init__(self, pin, freq): pass
            def start(self, duty_cycle): pass
            def ChangeDutyCycle(self, duty_cycle): pass

class ServoController:
    def __init__(self, pin):
        self.pin = pin
        self.last_angle = -1
        try:
            GPIO.setup(self.pin, GPIO.OUT)
            self.pwm = GPIO.PWM(self.pin, config.PWM_FREQ_SERVO)
            self.pwm.start(0)
        except Exception as e:
            logging.error(f"Failed to initialize servo on pin {self.pin}: {e}")

    def set_angle(self, angle):
        """
        Set servo angle (0 to 180 degrees).
        """
        angle = max(0, min(180, angle))
        
        # Anti-Jitter 1: Only update if angle changed significantly (> 1 degree)
        if abs(angle - self.last_angle) < 1.0:
            return

        self.last_angle = angle
        
        # Log the servo movement
        logging.info(f"🦾 [SERVO {self.pin}] Angle: {angle:.1f}")
        
        # Map 0-180 to Duty Cycle
        duty = 2 + (angle / 18)
        self.pwm.ChangeDutyCycle(duty)
        
        # Anti-Jitter 2: "Auto-Relax"
        # Since rpi-lgpio uses software PWM, the timing fluctuates (jitter)
        # The only way to stop buzzing is to STOP sending the signal once moved.
        # We need a non-blocking way to turn it off, but for now, we leave it ON.
        # If the user is stopped (joystick=0), the servo should be detached.
        
    def detach(self):
        """Stop sending PWM signal to eliminate jitter/buzzing when idle."""
        self.pwm.ChangeDutyCycle(0)
