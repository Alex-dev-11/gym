import { useState } from 'react';
import { Typography, Table, Button, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useUsers } from '../hooks/useUsers';
import { usersApi } from '../api/users';
import { UserFormModal } from '../components/users/UserFormModal';
import { USER_ROLES, type UserResponseDto, type UserRole } from '../types';
import { tablePagination } from '../utils/tableConfig';

const { Title } = Typography;

export function UsersPage() {
  const { users, loading, reload } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);

  const handleDelete = async (id: number) => {
    try {
      await usersApi.delete(id);
      message.success('Пользователь деактивирован');
      reload();
    } catch {
      message.error('Ошибка при удалении');
    }
  };

  const columns = [
    {
      title: 'Логин',
      dataIndex: 'login',
      key: 'login',
      width: 150,
    },
    {
      title: 'ФИО сотрудника',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (fullName: string, record: UserResponseDto) => {
        // Если fullName совпадает с login, значит сотрудник не привязан
        if (fullName === record.login) {
          return <span className="text-gray-400">—</span>;
        }
        return <span className="font-medium">{fullName}</span>;
      },
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role: UserRole) => {
        const config = USER_ROLES[role];
        return config ? <Tag color={config.color}>{config.label}</Tag> : <Tag>{role}</Tag>;
      },
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Активен' : 'Неактивен'}
        </Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: UserResponseDto) => (
        <Popconfirm
          title="Деактивировать пользователя?"
          onConfirm={() => handleDelete(record.id)}
          okText="Да"
          cancelText="Нет"
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            disabled={!record.isActive}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Пользователи системы</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setModalOpen(true)}
        >
          Добавить пользователя
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users.filter(u => u.isActive)}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={tablePagination}
        locale={{ emptyText: 'Пользователи не найдены' }}
      />

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={reload}
      />
    </div>
  );
}