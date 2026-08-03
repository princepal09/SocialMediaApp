import api from "../lib/axios";
import type { LoginFormData } from "../schemas/loginSchema";

import type { RegisterFormData } from "../schemas/registerSchema";

export const registerUser = async (data: RegisterFormData) => {
  const formData = new FormData();
  formData.append("username", data.username);
  formData.append("email", data.email);
  formData.append("password", data.password);

  if (data.profileImage && data.profileImage.length > 0) {
    formData.append("profileImage", data.profileImage[0]);
  }

  const response = await api.post("/auth/register", formData);

  return response?.data;
};

export const loginUser = async (data: LoginFormData) => {
  const response = await api.post("/auth/login", data);
  return response?.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/users/current-user");
  return response?.data;
};
