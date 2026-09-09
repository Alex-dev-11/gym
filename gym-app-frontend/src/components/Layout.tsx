import { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  UserOutlined, 
  CreditCardOutlined, 
  CalendarOutlined,
  MenuOutlined // 👈 АДАПТИВНОСТЬ: иконка гамбургера
} from '@ant-design/icons';

const { Header, Sider, Content } = AntLayout;

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // 👈 АДАПТИВНОСТЬ: отслеживание мобильного устройства
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCollapsed(mobile); // На мобильном меню свернуто по умолчанию
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { key: '/clients', icon: <UserOutlined />, label: 'Клиенты' },
    { key: '/memberships', icon: <CreditCardOutlined />, label: 'Абонементы' },
    { key: '/visits', icon: <CalendarOutlined />, label: 'Посещения' },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider 
        theme="light" 
        width={250} 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        breakpoint="md" // 👈 АДАПТИВНОСТЬ: Ant Design сам управляет этим на планшетах
        collapsedWidth={isMobile ? 0 : 80} // 👈 АДАПТИВНОСТЬ: на мобильном меню исчезает полностью
        style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 1000 }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: isMobile ? 0 : 20, // 👈 АДАПТИВНОСТЬ: скрываем текст в свернутом мобильном режиме
          fontWeight: 'bold',
          borderBottom: '1px solid #f0f0f0',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}>
          {!isMobile && '🏋️ Gym Management'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <AntLayout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 250), transition: 'margin-left 0.2s' }}>
        <Header style={{ 
          background: '#fff', 
          padding: isMobile ? '0 16px' : '0 24px', // 👈 АДАПТИВНОСТЬ: меньшие отступы на мобильном
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 999
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* 👈 АДАПТИВНОСТЬ: кнопка гамбургер только на мобильном */}
            {isMobile && (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setCollapsed(!collapsed)} />
            )}
            <div style={{ fontSize: isMobile ? 16 : 16, fontWeight: 500 }}>
              Система управления залом
            </div>
          </div>
          <div style={{ color: '#666', fontSize: 14 }} className="hidden sm:block">
            Оператор: Администратор
          </div>
        </Header>

        <Content style={{ margin: isMobile ? 12 : 24, padding: isMobile ? 12 : 24, background: '#fff', borderRadius: 8, minHeight: 'calc(100vh - 88px)' }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}