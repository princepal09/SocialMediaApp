import axios from "axios";
import { BACKEND_URL } from "../utils/constants";

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  timeout: 20_000,
});

let refreshRequest: Promise<unknown> | undefined;

api.interceptors.request.use((config) => {
  if (!BACKEND_URL) throw new Error("Pixora’s API is currently unavailable.");
  if (config.data instanceof FormData) config.timeout = 120_000;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (request && error.response?.data?.code === "ACCESS_TOKEN_REQUIRED") {
      refreshRequest ??= api.post("/auth/refresh-token").finally(() => {
        refreshRequest = undefined;
      });
      await refreshRequest;
      // Replay once through Axios without this interceptor.
      return axios.request(request).catch((retryError) => Promise.reject(formatError(retryError)));
    }
    throw formatError(error);
  },
);

function formatError(error: unknown) {
  if (axios.isAxiosError(error)) {
    return {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      errors: error.response?.data?.errors || [],
    };
  }
  return error;
}

export default api;
