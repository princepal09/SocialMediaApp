import axios, {
} from "axios";
import { BACKEND_URL } from "../utils/constants";

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";

    return Promise.reject({
      status: error?.response?.status,
      message,
      errors: error?.response?.data?.errors || [],
    });
  }
);

export default api;