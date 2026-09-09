// src/api/client.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { message } from "antd";
import type { ApiError } from "../types";

// Создаём инстанс axios с базовыми настройками
const apiClient = axios.create({
  baseURL: "http://localhost:5144/api", // URL твоего бэкенда
  headers: {
    "Content-Type": "application/json",
  },
});

// Перехватчик запросов (место для токена авторизации в будущем)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Пока без токенов, но место зарезервировано
    return config;
  },
  (error: unknown): Promise<never> => {
    return Promise.reject(error);
  },
);

// Перехватчик ответов для централизованной обработки ошибок
apiClient.interceptors.response.use(
  (response) => {
    return response; // TypeScript сам выведет тип из контекста
  },
  (error: AxiosError<ApiError>): Promise<never> => {
    // Если бэкенд вернул нашу стандартизированную ошибку из Middleware
    if (error.response?.data?.error) {
      message.error(error.response.data.error);
    } else {
      // Иначе показываем общую ошибку сети или сервера
      message.error("Произошла ошибка сети или сервер недоступен");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
