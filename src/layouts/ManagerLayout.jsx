import { Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
const { Content} = Layout;
import './AdminLayout.css';
import Notify from '../components/admin/Notify';
import MenuSiderManager from '../components/admin/MenuSiderManager';
import { Outlet } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';

import { useTheme } from '../contexts/ThemeContext'; 
import ThemeWrapper from '../ThemeWrapper'; 

export default function AdminLayout() {
  const { theme } = useTheme(); 
  return (
    <ThemeWrapper>
      <Layout className={`layout-default ${theme}`}> 
        <header className='header'>
          <div className='header__logo'>
              Admin Panel
          </div>
          <div className='header__nav'>
              <div className='header__nav-left'>
              <div className='header__collapse'>
              </div>
              <div className='header__search'>
              
              </div>
              </div>
              <div className='header__nav-right' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ThemeToggle />
                  <Notify />
              </div>
          </div>
        </header>
        <Layout>
          <Sider className='sider' theme='light'>
              <MenuSiderManager />
          </Sider>
          <Content className='content'>
            <Outlet />  
          </Content>
        </Layout>
      </Layout>
    </ThemeWrapper>
  )
}