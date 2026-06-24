const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = IS_LOCAL ? 'http://localhost:5001' : 'https://app-z-makers.vercel.app';
export const BACKEND_URL = `${API_BASE_URL}/api`;
export const SOCKET_URL = API_BASE_URL;
