import { useState, useEffect } from 'react';
import { Typography, Table, Button, Space, Tag, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMemberships } from '../hooks/useMemberships';
import { clientsApi } from '../api/clients';
import { MembershipFormModal } from '../components/memberships/MembershipFormModal';
import type { MembershipResponseDto, ClientResponseDto, MembershipStatus, MembershipType } from '../types';
import { MEMBERSHIP_TYPES, MEMBERSHIP_STATUSES } from '../types';
import { tablePagination } from '../utils/tableConfig';

const { Title } = Typography;

export function MembershipsPage() {
  const { memberships, loading, reload, updateFilter } = useMemberships();
  
  const [clients, setClients] = useState<ClientResponseDto[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [clientFilter, setClientFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    clientsApi.getAll().then(response => {
      setClients(response.data);
    });
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Клиент',
      dataIndex: 'clientFullName',
      key: 'clientFullName',
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: MembershipType) => {
        const config = MEMBERSHIP_TYPES[type];
        if (!config) return <Tag>{type}</Tag>;
        return <Tag color={config.color}>{config.tableLabel}</Tag>;
      },
    },
    {
      title: 'Дата начала',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (text: string) => new Date(text).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Дата окончания',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text: string) => new Date(text).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Посещения',
      key: 'visits',
      render: (_: unknown, record: MembershipResponseDto) => {
        if (record.totalVisits === 0) {
          return <Tag color="blue">Безлимит</Tag>;
        }
        return `${record.usedVisits} / ${record.totalVisits}`;
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: MembershipStatus) => {
        const config = MEMBERSHIP_STATUSES[status];
        if (!config) return <Tag>{status}</Tag>;
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
  ];

  const handleClientChange = (value: number | undefined) => {
    setClientFilter(value);
    updateFilter({ clientId: value, status: statusFilter });
  };

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(value);
    updateFilter({ clientId: clientFilter, status: value });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Абонементы</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Создать абонемент
        </Button>
      </div>

      <Space className="flex flex-wrap w-full mb-4" size="middle">
        <Select
          placeholder="Фильтр по клиенту"
          allowClear
          showSearch
          optionFilterProp="label"
          className="w-full sm:w-[250px]"
          onChange={handleClientChange}
          options={clients.map(c => ({
            value: c.id,
            label: `${c.lastName} ${c.firstName}`,
          }))}
        />
        <Select
          placeholder="Фильтр по статусу"
          allowClear
          className="w-full sm:w-[200px]"
          onChange={handleStatusChange}
          options={Object.entries(MEMBERSHIP_STATUSES).map(([value, { label }]) => ({
            value,
            label,
          }))}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={memberships}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={tablePagination}
      />

      <MembershipFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={reload}
      />
    </div>
  );
}