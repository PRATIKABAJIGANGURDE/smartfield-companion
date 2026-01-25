// Automatically use the hostname from the browser (e.g. 192.168.x.x or localhost)
const BASE_URL = `http://${window.location.hostname}:8000/api`;

export const api = {
    drive: async (x: number, y: number, speed: number, servos?: number[]) => {
        try {
            const response = await fetch(`${BASE_URL}/drive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ x, y, speed, servos }),
            });
            return await response.json();
        } catch (error) {
            console.error('Drive API Error:', error);
            return null;
        }
    },

    getSensors: async () => {
        try {
            const response = await fetch(`${BASE_URL}/sensors`);
            return await response.json();
        } catch (error) {
            console.error('Sensor API Error:', error);
            return null;
        }
    },

    getSuggestions: async () => {
        try {
            const response = await fetch(`${BASE_URL}/suggestions`);
            return await response.json();
        } catch (error) {
            console.error('Suggestions API Error:', error);
            return null;
        }
    },

    getStatus: async () => {
        try {
            const response = await fetch(`${BASE_URL}/status`);
            return await response.json();
        } catch (error) {
            console.error('Status API Error:', error);
            return null;
        }
    },
};
