import { CLIENT_STATUSES, type ClientStatus, type ClientResponseDto } from '../types';
import { useState } from 'react';
import { Typography, Table, Button, Space, Tag, Popconfirm, message, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
import { useClients } from '../hooks/useClients';
import { clientsApi } from '../api/clients';
import { ClientFormModal } from '../components/clients/ClientFormModal';

const { Title } = Typography;
const { Search } = Input;

export function ClientsPage() {
  const { clients, loading, reload, updateFilter } = useClients();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientResponseDto | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const columns = [
    {
      title: 'Клиент',
      key: 'clientName',
      render: (_: unknown, record: ClientResponseDto) => (
        <div>
          <div className="font-medium">{record.lastName} {record.firstName}</div>
          {/* 👈 АДАПТИВНОСТЬ: на мобильном телефон показываем сразу под именем */}
          <div className="text-xs text-gray-500 md:hidden">{record.phone}</div>
        </div>
      )
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
      className: 'hidden md:table-cell', // 👈 АДАПТИВНОСТЬ: скрыт на мобильном
    },
    {
      title: 'Отчество',
      dataIndex: 'patronymic',
      key: 'patronymic',
      render: (text: string) => text || '—',
      className: 'hidden lg:table-cell', // 👈 АДАПТИВНОСТЬ: скрыт на мобильном и планшете
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => text || '—',
      className: 'hidden lg:table-cell',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: ClientStatus, record: ClientResponseDto) => {
        if (record.isDeleted) return <Tag color="default" className="line-through">В архиве</Tag>;
        const config = CLIENT_STATUSES[status];
        return config ? <Tag color={config.color}>{config.label}</Tag> : <Tag>{status}</Tag>;
      }
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: ClientResponseDto) => (
        <Space size="small">
          {record.isDeleted ? (
            <Button type="link" icon={<UndoOutlined />} onClick={() => handleRestore(record)} title="Восстановить" />
          ) : (
            <>
              <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} title="Изменить" />
              <Popconfirm title="Удалить?" onConfirm={() => handleDelete(record.id)} okText="Да" cancelText="Нет">
                <Button type="link" danger icon={<DeleteOutlined />} title="Удалить" />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
    updateFilter({ search: value, status: statusFilter });
  };

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(value);
    updateFilter({ search: searchText, status: value });
  };

  const handleEdit = (client: ClientResponseDto) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await clientsApi.delete(id);
      message.success('Клиент удалён');
      reload();
    } catch (err) {
      message.error('Ошибка при удалении');
    }
  };

  const handleRestore = async (client: ClientResponseDto) => {
    try {
      await clientsApi.update(client.id, { isDeleted: false, status: 'active' });
      message.success('Клиент восстановлен');
      reload();
    } catch (err) {
      message.error('Ошибка при восстановлении');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <Title level={2} className="mb-0">Клиенты</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingClient(null); setModalOpen(true); }}>
          Добавить
        </Button>
      </div>

      <Space className="flex flex-wrap w-full mb-4" size="middle">
        <Search
          placeholder="Поиск по имени или телефону"
          allowClear
          enterButton={<SearchOutlined />}
          className="w-full sm:w-[300px]" // 👈 АДАПТИВНОСТЬ: полная ширина на мобильном
          onSearch={handleSearch}
        />
        <Select
          placeholder="Фильтр по статусу"
          allowClear
          className="w-full sm:w-[200px]" // 👈 АДАПТИВНОСТЬ: полная ширина на мобильном
          onChange={handleStatusChange}
          // 👈 ИСПРАВЛЕНО: ключи должны совпадать с CLIENT_STATUSES ('blacklist', а не 'blacklisted')
          options={[
            { value: 'active', label: 'Активен' },
            { value: 'inactive', label: 'Неактивен' },
            { value: 'blacklist', label: 'Чёрный список' },
          ]}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={clients}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }} // 👈 АДАПТИВНОСТЬ: критически важно для мобильных!
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <ClientFormModal
        open={modalOpen}
        editingClient={editingClient}
        onClose={() => { setModalOpen(false); setEditingClient(null); }}
        onSuccess={reload}
      />
    </div>
  );
}