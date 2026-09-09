// src/pages/MembershipsPage.tsx
import { useState, useEffect } from 'react';
import { Typography, Table, Button, Space, Tag, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMemberships } from '../hooks/useMemberships';
import { clientsApi } from '../api/clients';
import { MembershipFormModal } from '../components/memberships/MembershipFormModal';
import type { MembershipResponseDto, ClientResponseDto } from '../types';

const { Title } = Typography;

export function MembershipsPage() {
  const { memberships, loading, reload, updateFilter } = useMemberships();
  
  // Состояния нужны только для фильтра по клиенту
  const [clients, setClients] = useState<ClientResponseDto[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [clientFilter, setClientFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Загружаем клиентов ТОЛЬКО для выпадающего списка фильтра
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
      dataIndex: 'clientFullName', // <-- БЕРЁМ НАПРЯМУЮ ИЗ ОТВЕТА!
      key: 'clientFullName',
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const text = type === 'single' ? 'Разовое' : type === 'month' ? 'Месяц' : 'Год';
        return <Tag>{text}</Tag>;
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
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: 'green',
          completed: 'blue',
          expired: 'orange',
          cancelled: 'red',
        };
        const textMap: Record<string, string> = {
          active: 'Активен',
          completed: 'Завершён',
          expired: 'Истёк',
          cancelled: 'Отменён',
        };
        return <Tag color={colorMap[status] || 'default'}>{textMap[status] || status}</Tag>;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Абонементы</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Создать абонемент
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }} size="middle">
        <Select
          placeholder="Фильтр по клиенту"
          allowClear
          showSearch
          optionFilterProp="children"
          style={{ width: 250 }}
          onChange={handleClientChange}
          options={clients.map(c => ({
            value: c.id,
            label: c.clientFullName || `${c.lastName} ${c.firstName}`, // Fallback на случай, если clientFullName вдруг нет
          }))}
        />
        <Select
          placeholder="Фильтр по статусу"
          allowClear
          style={{ width: 200 }}
          onChange={handleStatusChange}
          options={[
            { value: 'active', label: 'Активен' },
            { value: 'completed', label: 'Завершён' },
            { value: 'expired', label: 'Истёк' },
            { value: 'cancelled', label: 'Отменён' },
          ]}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={memberships}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <MembershipFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={reload}
      />
    </div>
  );
}