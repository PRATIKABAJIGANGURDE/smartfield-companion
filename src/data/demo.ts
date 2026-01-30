export const DEMO_SENSORS = {
    soil: {
        moisture: 65,      // Optimal range (60-80%)
        temperature: 24,   // Optimal range (18-28°C)
        ph: 6.8,           // Optimal range (6.0-7.0)
        nitrogen: 140,     // Good range
        phosphorus: 85,    // Good range
        potassium: 90      // Good range
    },
    environment: {
        temperature: 26,
        humidity: 55
    }
};

export const DEMO_SUGGESTIONS = {
    summary: "System running in demo mode. Conditions appear optimal.",
    recommendations: [
        {
            action: "Monitor Moisture",
            reason: "Soil moisture is stable but approaching lower threshold."
        },
        {
            action: "Check Battery",
            reason: "Simulated battery level is healthy."
        },
        {
            action: "Verify Sensors",
            reason: "Demo mode: Displaying simulated data."
        }
    ]
};

export const DEMO_STATUS = {
    connection: "demo",
    battery: 85,
    status: "active"
};
