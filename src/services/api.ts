// Automatically use the hostname from the browser (e.g. 192.168.x.x or localhost)
const BASE_URL = `http://${window.location.hostname}:8000/api`;

import { DEMO_SENSORS, DEMO_SUGGESTIONS, DEMO_STATUS } from '@/data/demo';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

            const response = await fetch(`${BASE_URL}/sensors`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (error) {
            console.warn('Backend unreachable, using demo data');
            return DEMO_SENSORS;
        }
    },

    getSuggestions: async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(`${BASE_URL}/suggestions`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (error) {
            return DEMO_SUGGESTIONS;
        }
    },

    getStatus: async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(`${BASE_URL}/status`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (error) {
            return DEMO_STATUS;
        }
    },
};
