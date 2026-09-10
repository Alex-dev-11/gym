import axios from "axios";
import { message } from "antd";

const apiClient = axios.create({
  baseURL: "http://localhost:5144/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Добавляем токен к каждому запросу
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обрабатываем ответы и ошибки
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Если токен протух или неверен (401)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 👇 ВАЖНО: Перенаправляем на логин ТОЛЬКО если мы там еще не находимся
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      } else {
        // Если мы уже на логине, просто показываем ошибку и даем компоненту обработать её
        message.error("Неверный логин или пароль");
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
