import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Select,
  Tag,
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
  MembershipType,
} from "../types";
import { MEMBERSHIP_TYPES } from "../types";
import { tablePagination } from "../utils/tableConfig";

const { Title } = Typography;

export const VisitsPage: React.FC = () => {
  const { visits, loading, reload, filter, updateFilter } = useVisits();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [allMemberships, setAllMemberships] = useState<MembershipResponseDto[]>([]);
  const [membershipsLoading, setMembershipsLoading] = useState(false);

  useEffect(() => {
    const loadMemberships = async () => {
      setMembershipsLoading(true);
      try {
        const data = await membershipsApi.getAll();
        setAllMemberships(data || []);
      } catch {
        message.error("Не удалось загрузить список абонементов");
      } finally {
        setMembershipsLoading(false);
      }
    };

    loadMemberships();
  }, []);

  const membershipOptions = useMemo(() => 
    allMemberships.map((m) => ({
      value: m.id,
      label: `${m.clientFullName} — ${MEMBERSHIP_TYPES[m.type as MembershipType]?.shortLabel || m.type}`,
    })),
  [allMemberships]);

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
        render: (type: MembershipType) => {
          const config = MEMBERSHIP_TYPES[type];
          if (!config) return <Tag>{type}</Tag>;
          return <Tag color={config.color}>{config.tableLabel}</Tag>;
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

  const handleMembershipFilterChange = (membershipId: number | undefined) => {
    const newFilter: VisitsFilter = membershipId ? { membershipId } : {};
    updateFilter(newFilter);
  };

  const handleVisitCreated = () => {
    reload();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Посещения
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Зарегистрировать посещение
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={reload}
            loading={loading}
            title="Обновить"
          />
        </Space>
      </div>

      <Space className="flex flex-wrap w-full mb-4" size="middle">
        <Select
          placeholder="Фильтр по абонементу"
          allowClear
          showSearch
          optionFilterProp="label"
          loading={membershipsLoading}
          style={{ width: window.innerWidth < 768 ? '100%' : 300 }}
          value={filter.membershipId}
          onChange={handleMembershipFilterChange}
          options={membershipOptions}
        />
      </Space>

      <Table<VisitResponseDto>
        columns={columns}
        dataSource={visits}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={tablePagination}
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