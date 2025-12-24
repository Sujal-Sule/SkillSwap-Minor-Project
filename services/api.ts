export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getWebSocketUrl = (path: string) => {
    const url = API_URL.replace(/^http/, 'ws');
    return `${url}${path.startsWith('/') ? '' : '/'}${path}`;
};

async function getAuthHeaders() {
    const token = localStorage.getItem('appToken'); // We might store it here, or get from Firebase
    // If using Firebase ID token as session token:
    // We should ideally refresh it if expired. 
    // For now, let's assume we stored the token from the backend /auth/google response
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export const api = {
    get: async (endpoint: string) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}${endpoint}`, { headers });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    post: async (endpoint: string, body: any) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    put: async (endpoint: string, body: any = {}) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    delete: async (endpoint: string) => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    }
};
