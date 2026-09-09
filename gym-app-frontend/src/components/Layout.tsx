// src/components/Layout.tsx
import { Layout as AntLayout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  UserOutlined, 
  CreditCardOutlined, 
  CalendarOutlined 
} from '@ant-design/icons';

const { Header, Sider, Content } = AntLayout;

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Пункты меню
  const menuItems = [
    {
      key: '/clients',
      icon: <UserOutlined />,
      label: 'Клиенты',
    },
    {
      key: '/memberships',
      icon: <CreditCardOutlined />,
      label: 'Абонементы',
    },
    {
      key: '/visits',
      icon: <CalendarOutlined />,
      label: 'Посещения',
    },
  ];

  // Обработчик клика по меню
  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* Боковое меню */}
      <Sider theme="light" width={250}>
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: 20,
          fontWeight: 'bold',
          borderBottom: '1px solid #f0f0f0'
        }}>
          🏋️ Gym Management
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      {/* Основной контент */}
      <AntLayout>
        {/* Шапка */}
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            Система управления спортивным залом
          </div>
          <div style={{ color: '#666' }}>
            Оператор: Администратор
          </div>
        </Header>

        {/* Контент страницы */}
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          {/* Outlet — это место, где будет рендериться текущая страница */}
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}