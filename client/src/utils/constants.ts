export const BACKEND_URL = import.meta.env.VITE_BASE_URL || (import.meta.env.DEV ? "http://localhost:6001/api/v1" : "/api/v1");
console.log(BACKEND_URL);