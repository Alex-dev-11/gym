import { useState, useEffect, useCallback } from "react";
import { usersApi } from "../api/users";
import type { UserResponseDto } from "../types";

export function useUsers() {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError("Не удалось загрузить список пользователей");
      console.error("Error reloading users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await usersApi.getAll();
        if (isMounted) {
          setUsers(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Не удалось загрузить список пользователей");
          console.error("Error loading users:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    users,
    loading,
    error,
    reload,
  };
}
