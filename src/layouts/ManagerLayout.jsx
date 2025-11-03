import { Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
const { Content} = Layout;
import './AdminLayout.css';
import Notify from '../components/admin/Notify';
import MenuSiderManager from '../components/admin/MenuSiderManager';
import { Outlet } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';
export default function AdminLayout() {
  return (
    <Layout className='layout-default'>
      <header className='header'>
        <div className='header__logo'>
            {/* <img src={logo} width="200px" height="110px" alt="logo" /> */}
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
  )
}
