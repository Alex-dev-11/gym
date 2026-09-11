import { useState } from 'react';
import { Typography, Table, Button, Tag } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useEmployees } from '../hooks/useEmployees';
import { EmployeeFormModal } from '../components/employees/EmployeeFormModal';
import { EMPLOYEE_POSITIONS, type EmployeeResponseDto, type EmployeePosition } from '../types';
import { tablePagination } from '../utils/tableConfig';

const { Title } = Typography;

export function EmployeesPage() {
  const { employees, loading, reload } = useEmployees();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeResponseDto | null>(null);

  const handleEdit = (employee: EmployeeResponseDto) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingEmployee(null);
  };

  const columns = [
    {
      title: 'ФИО',
      key: 'fullName',
      render: (_: unknown, record: EmployeeResponseDto) => (
        <span className="font-medium">
          {record.lastName} {record.firstName} {record.patronymic || ''}
        </span>
      ),
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string | null | undefined) => phone || '—',
    },
    {
      title: 'Должность',
      dataIndex: 'position',
      key: 'position',
      width: 150,
      render: (position: EmployeePosition) => {
        const config = EMPLOYEE_POSITIONS[position];
        // Безопасное получение цвета: если в типах его нет, fallback на 'blue'
        const color = (config as any)?.color || 'blue';
        return config ? <Tag color={color}>{config.label}</Tag> : <Tag>{position}</Tag>;
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
      width: 120,
      render: (_: unknown, record: EmployeeResponseDto) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
          size="small"
        >
          Изменить
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Сотрудники</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingEmployee(null);
            setModalOpen(true);
          }}
        >
          Добавить сотрудника
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={tablePagination}
        locale={{ emptyText: 'Сотрудники не найдены' }}
      />

      <EmployeeFormModal
        open={modalOpen}
        employee={editingEmployee}
        onClose={handleModalClose}
        onSuccess={() => {
          reload();
          handleModalClose();
        }}
      />
    </div>
  );
}