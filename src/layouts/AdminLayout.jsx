import { Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
const { Content} = Layout;
import './AdminLayout.css';
import Notify from '../components/admin/Notify';
import MenuSider from '../components/admin/MenuSider';
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
            <div className='header__nav-right'>
              <ThemeToggle />
                <Notify />
            </div>
        </div>
      </header>
      <Layout>
        <Sider className='sider'>
            <MenuSider />
        </Sider>
        <Content className='content'>
          <Outlet />  
        </Content>
      </Layout>
    </Layout>
  )
}
