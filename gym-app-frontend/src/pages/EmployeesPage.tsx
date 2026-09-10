import { useState, useEffect } from 'react';
import { Typography, Table, Button, Tag, Popconfirm, message, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UndoOutlined } from '@ant-design/icons';
import { employeesApi } from '../api/employees';
import { EmployeeFormModal } from '../components/employees/EmployeeFormModal';
import { EMPLOYEE_POSITIONS, type EmployeeResponseDto, type EmployeePosition } from '../types';
import { tablePagination } from '../utils/tableConfig';

const { Title } = Typography;

export function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeResponseDto | null>(null);


  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await employeesApi.getAll();
        if (isMounted) {
          setEmployees(data);
        }
      } catch {
        if (isMounted) {
          message.error('Не удалось загрузить список сотрудников');
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
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await employeesApi.delete(id);
      message.success('Сотрудник деактивирован');
      // Перезагружаем данные тем же безопасным способом
      const data = await employeesApi.getAll();
      setEmployees(data);
    } catch {
      message.error('Ошибка при удалении');
    }
  };

  const handleRestore = async (employee: EmployeeResponseDto) => {
    try {
      await employeesApi.update(employee.id, { isActive: true });
      message.success('Сотрудник восстановлен');
      const data = await employeesApi.getAll();
      setEmployees(data);
    } catch {
      message.error('Ошибка при восстановлении');
    }
  };

  const columns = [
    {
      title: 'ФИО',
      key: 'fullName',
      render: (_: unknown, record: EmployeeResponseDto) => (
        <div className={record.isActive ? 'font-medium' : 'line-through text-gray-400'}>
          {record.lastName} {record.firstName} {record.patronymic}
        </div>
      ),
    },
    { 
      title: 'Телефон', 
      dataIndex: 'phone', 
      key: 'phone',
      render: (text: string) => text || '—', // 👈 Показываем "—", если телефон не указан
    },
    {
      title: 'Должность',
      dataIndex: 'position',
      key: 'position',
      render: (pos: EmployeePosition) => <Tag>{EMPLOYEE_POSITIONS[pos]?.label || pos}</Tag>,
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Работает' : 'Уволен'}</Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: EmployeeResponseDto) => (
        <Space size="small">
          {record.isActive ? (
            <>
              <Button 
                type="link" 
                icon={<EditOutlined />} 
                onClick={() => { setEditingEmployee(record); setModalOpen(true); }} 
                title="Редактировать"
              />
              <Popconfirm title="Деактивировать?" onConfirm={() => handleDelete(record.id)} okText="Да" cancelText="Нет">
                <Button type="link" danger icon={<DeleteOutlined />} title="Деактивировать" />
              </Popconfirm>
            </>
          ) : (
            <Button 
              type="link" 
              icon={<UndoOutlined />} 
              onClick={() => handleRestore(record)} 
              title="Восстановить" 
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2} className="mb-0">Сотрудники зала</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => { setEditingEmployee(null); setModalOpen(true); }}
        >
          Добавить сотрудника
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={tablePagination}
        locale={{ emptyText: 'Сотрудники не найдены' }}
      />

      <EmployeeFormModal
        open={modalOpen}
        employee={editingEmployee}
        onClose={() => { setModalOpen(false); setEditingEmployee(null); }}
        onSuccess={() => {
          // Безопасное обновление после модалки
          employeesApi.getAll().then(setEmployees).catch(() => message.error('Ошибка обновления'));
        }}
      />
    </div>
  );
}