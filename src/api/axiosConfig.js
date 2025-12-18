import axios from "axios";

// URL base del backend
const API_URL = "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request: agrega token + log
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("➡️ Request", config.url, "Auth?", !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response: maneja 401 (token inválido/expirado)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // opcional: log para 403 (solo para debug)
    if (status === 403) {
      console.warn("⛔ 403 Forbidden en", error.config?.url);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;