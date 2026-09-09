// src/hooks/useClients.ts
import { useState, useEffect, useCallback } from "react";
import { clientsApi, type ClientsFilter } from "../api/clients";
import type { ClientResponseDto } from "../types";

export function useClients(initialFilter?: ClientsFilter) {
  const [clients, setClients] = useState<ClientResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ClientsFilter>(initialFilter || {});

  // Функция для ручного обновления
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const response = await clientsApi.getAll(filter);
      setClients(response.data);
      setError(null);
    } catch (err) {
      setError("Не удалось загрузить список клиентов");
      console.error("Error reloading clients:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Эффект для первоначальной загрузки и при изменении фильтра
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const response = await clientsApi.getAll(filter);
        if (isMounted) {
          setClients(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Не удалось загрузить список клиентов");
          console.error("Error loading clients:", err);
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
  }, [filter]); // <-- Перезагружаем данные при изменении фильтра

  // Функция для изменения фильтра (вызывается из компонента)
  const updateFilter = useCallback((newFilter: ClientsFilter) => {
    setFilter(newFilter);
  }, []);

  return {
    clients,
    loading,
    error,
    filter,
    reload,
    updateFilter,
  };
}
