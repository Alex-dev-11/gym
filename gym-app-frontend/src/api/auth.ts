import apiClient from "./apiClient";
import type { LoginDto, LoginResponseDto } from "../types";

export const authApi = {
  login: async (data: LoginDto): Promise<LoginResponseDto> => {
    const response = await apiClient.post<LoginResponseDto>(
      "/auth/login",
      data,
    );
    return response.data;
  },
};
