// src/pages/VisitsPage.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Select,
  Tag,
  Card,
  message,
} from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useVisits } from "../hooks/useVisits";
import { membershipsApi } from "../api/memberships";
import { VisitFormModal } from "../components/visits/VisitFormModal";
import type {
  VisitResponseDto,
  MembershipResponseDto,
  VisitsFilter,
} from "../types";

const { Title } = Typography;

export const VisitsPage: React.FC = () => {
  // Хук для управления посещениями
  const { visits, loading, reload, filter, updateFilter } = useVisits();

  // Состояние модалки
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Список всех абонементов для фильтра
  const [allMemberships, setAllMemberships] = useState<MembershipResponseDto[]>(
    []
  );
  const [membershipsLoading, setMembershipsLoading] = useState(false);

  // Загружаем абонементы для фильтра при монтировании страницы
  useEffect(() => {
    const loadMemberships = async () => {
      setMembershipsLoading(true);
      try {
        const data = await membershipsApi.getAll();
        const list = Array.isArray(data)
          ? data
          : (data as unknown as { data: MembershipResponseDto[] }).data ?? [];
        setAllMemberships(list);
      } catch {
        message.error("Не удалось загрузить список абонементов");
      } finally {
        setMembershipsLoading(false);
      }
    };

    loadMemberships();
  }, []);

  // Колонки таблицы
  const columns: ColumnsType<VisitResponseDto> = useMemo(
    () => [
      {
        title: "Дата и время",
        dataIndex: "visitTime",
        key: "visitTime",
        width: 180,
        render: (value: string) => {
          const date = new Date(value);
          return new Intl.DateTimeFormat("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(date);
        },
      },
      {
        title: "Клиент",
        dataIndex: "clientFullName",
        key: "clientFullName",
        ellipsis: true,
      },
      {
        title: "Тип абонемента",
        dataIndex: "membershipType",
        key: "membershipType",
        width: 150,
        render: (type: string) => {
          const colorMap: Record<string, string> = {
            single: "blue",
            month: "green",
            year: "gold",
          };
          const labelMap: Record<string, string> = {
            single: "Разовый",
            month: "Месяц",
            year: "Год",
          };
          return (
            <Tag color={colorMap[type] ?? "default"}>
              {labelMap[type] ?? type}
            </Tag>
          );
        },
      },
      {
        title: "Тренер",
        dataIndex: "trainerName",
        key: "trainerName",
        width: 200,
        render: (value: string | null | undefined) => value ?? "—",
      },
    ],
    []
  );

  // Обработчик изменения фильтра по абонементу
  const handleMembershipFilterChange = (membershipId: number | undefined) => {
    const newFilter: VisitsFilter = membershipId
      ? { membershipId }
      : {};
    updateFilter(newFilter);
  };

  // Обработчик успешного создания посещения
  const handleVisitCreated = () => {
    reload(); // Перезагружаем таблицу
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Title level={2} className="mb-0">
          Посещения
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={reload}
            loading={loading}
          >
            Обновить
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Зарегистрировать посещение
          </Button>
        </Space>
      </div>

      <Card className="mb-4">
        <Space wrap>
          <span className="font-medium">Фильтр по абонементу:</span>
          <Select
            placeholder="Все абонементы"
            allowClear
            showSearch
            optionFilterProp="label"
            loading={membershipsLoading}
            style={{ minWidth: 300 }}
            value={filter.membershipId}
            onChange={handleMembershipFilterChange}
            options={allMemberships.map((m) => ({
              value: m.id,
              label: `${m.clientFullName} — ${m.type} (ID: ${m.id})`,
            }))}
          />
        </Space>
      </Card>

      <Table<VisitResponseDto>
        columns={columns}
        dataSource={visits}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Всего посещений: ${total}`,
        }}
        locale={{
          emptyText: "Посещения не найдены",
        }}
      />

      <VisitFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleVisitCreated}
      />
    </div>
  );
};