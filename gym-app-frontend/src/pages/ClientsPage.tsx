// src/pages/ClientsPage.tsx
import { useState } from 'react';
import { Typography, Table, Button, Space, Tag, Popconfirm, message, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useClients } from '../hooks/useClients';
import { clientsApi } from '../api/clients';
import { ClientFormModal } from '../components/clients/ClientFormModal';
import type { ClientResponseDto } from '../types';

const { Title } = Typography;
const { Search } = Input;

export function ClientsPage() {
  const { clients, loading, reload, updateFilter } = useClients();
  
  // Состояния для модального окна
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientResponseDto | null>(null);

  // Состояния для поиска и фильтрации
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Фамилия',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Имя',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Отчество',
      dataIndex: 'patronymic',
      key: 'patronymic',
      render: (text: string) => text || '—',
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => text || '—',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'green' : status === 'inactive' ? 'orange' : 'red';
        const text = status === 'active' ? 'Активен' : status === 'inactive' ? 'Неактивен' : 'Чёрный список';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      render: (text: string) => new Date(text).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: ClientResponseDto) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Удалить клиента?"
            description="Это действие нельзя отменить"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Обработчик поиска
  const handleSearch = (value: string) => {
    setSearchText(value);
    updateFilter({ search: value, status: statusFilter });
  };

  // Обработчик изменения фильтра по статусу
  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(value);
    updateFilter({ search: searchText, status: value });
  };

  // Открыть окно для создания
  const handleCreate = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  // Открыть окно для редактирования
  const handleEdit = (client: ClientResponseDto) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  // Закрыть окно
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingClient(null);
  };

  // Удаление клиента
  const handleDelete = async (id: number) => {
    try {
      await clientsApi.delete(id);
      message.success('Клиент удалён');
      reload();
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Клиенты</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Добавить клиента
        </Button>
      </div>

      {/* Панель поиска и фильтрации */}
      <Space style={{ marginBottom: 16, width: '100%' }} size="middle">
        <Search
          placeholder="Поиск по имени или телефону"
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          style={{ width: 300 }}
          onSearch={handleSearch}
        />
        <Select
          placeholder="Фильтр по статусу"
          allowClear
          style={{ width: 200 }}
          onChange={handleStatusChange}
          options={[
            { value: 'active', label: 'Активен' },
            { value: 'inactive', label: 'Неактивен' },
            { value: 'blacklisted', label: 'Чёрный список' },
          ]}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={clients}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <ClientFormModal
        open={modalOpen}
        editingClient={editingClient}
        onClose={handleCloseModal}
        onSuccess={reload}
      />
    </div>
  );
}