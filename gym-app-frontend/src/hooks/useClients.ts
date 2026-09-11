import { useState, useEffect, useCallback } from "react";
import { clientsApi, type ClientsFilter } from "../api/clients";
import type { ClientResponseDto } from "../types";

export function useClients(initialFilter?: ClientsFilter) {
  const [clients, setClients] = useState<ClientResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ClientsFilter>(initialFilter || {});

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientsApi.getAll(filter);
      setClients(data);
      setError(null);
    } catch (err) {
      setError("Не удалось загрузить список клиентов");
      console.error("Error reloading clients:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await clientsApi.getAll(filter);
        if (isMounted) {
          setClients(data);
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
  }, [filter]);

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
