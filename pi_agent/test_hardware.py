import time
import logging
import sys
import os

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(message)s')

def get_config():
    try:
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from config import config
        return config
    except ImportError:
        print("❌ Could not import config. Make sure you are in the right directory.")
        return None

def test_servo():
    cfg = get_config()
    if not cfg: return

    print("\n🦾 Servo Test (Pin: {})".format(cfg.SERVO_PIN_FL))
    print("---------------------------")
    
    import RPi.GPIO as GPIO
    
    PIN = cfg.SERVO_PIN_FL # Test Front-Left as default
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(PIN, GPIO.OUT)
    
    pwm = GPIO.PWM(PIN, 50)
    pwm.start(0)
    
    try:
        while True:
            val = input("Angle (0-180, 'q' to quit): ").strip()
            if val == 'q': break
            
            try:
                angle = float(val)
                duty = 2 + (angle / 18.0)
                pwm.ChangeDutyCycle(duty)
                print(f"Angle {angle} -> Duty {duty:.1f}")
                time.sleep(0.5) # Allow measure
            except ValueError:
                pass
    finally:
        pwm.stop()
        GPIO.cleanup()

def test_motor():
    cfg = get_config()
    if not cfg: return

    print(f"\n⚙️ Motor Test (PWM={cfg.MOTOR_PWM}, DIR={cfg.MOTOR_DIR})")
    print("---------------------------------------")
    
    import RPi.GPIO as GPIO
    
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    
    GPIO.setup(cfg.MOTOR_PWM, GPIO.OUT)
    GPIO.setup(cfg.MOTOR_DIR, GPIO.OUT)
    
    pwm = GPIO.PWM(cfg.MOTOR_PWM, cfg.PWM_FREQ_MOTOR)
    pwm.start(0)
    
    print("Controls:")
    print("  -100 to 100: Set Speed (Positive=Forward, Negative=Backward)")
    print("  0: Stop")
    print("  q: Quit")
    
    try:
        while True:
            cmd = input("Speed (-100 to 100): ").strip().lower()
            if cmd == 'q': break
            
            try:
                speed = int(cmd)
                speed = max(-100, min(100, speed)) # Clamp
                
                if speed >= 0:
                   GPIO.output(cfg.MOTOR_DIR, GPIO.HIGH)
                   pwm.ChangeDutyCycle(speed)
                   print(f"⬆️ Forward {speed}%")
                else:
                   GPIO.output(cfg.MOTOR_DIR, GPIO.LOW)
                   pwm.ChangeDutyCycle(abs(speed))
                   print(f"⬇️ Backward {abs(speed)}%")
                   
            except ValueError:
                print("❌ Invalid input. Enter a number.")
            
            time.sleep(0.1)
            
    finally:
        pwm.stop()
        GPIO.cleanup()
        print("Cleanup Done.")

def main():
    while True:
        print("\n=== Hardware Tester ===")
        print("1. Test Servos")
        print("2. Test Motors (PWM+DIR)")
        print("q. Quit")
        
        choice = input("Select: ").strip()
        
        if choice == '1': test_servo()
        elif choice == '2': test_motor()
        elif choice == 'q': break

if __name__ == "__main__":
    main()
