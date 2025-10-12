import React from 'react'
import CardItem from '../../components/admin/CardItem'
import { Row, Col } from 'antd';
import { CarOutlined, UserAddOutlined, ShoppingOutlined, WarningOutlined  } from '@ant-design/icons';
import LineChart from '../../components/admin/LineChart';
import PieChart from '../../components/admin/PieChart';
import { Link } from "react-router-dom";
import { revenueData, newUserData, carStatusData, transactionStatusData } from '../../dataAdmin';
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb';


export default function Dashboard() {
  return (
    <>
    <AdminBreadcrumb />
    <Row gutter={[20, 20]}>
        <Col xxl={6} xl={6} lg={6} md={12} sm={24} xs={24}>
        <Link to="/admin/posts">
        <CardItem title="Bài đăng chờ duyệt" value={5} icon={<CarOutlined style={{ color: 'red' }} />} />
        </Link>
        </Col>
        <Col xxl={6} xl={6} lg={6} md={12} sm={24} xs={24}>
         <Link to="/admin/users">
        <CardItem title="Người dùng mới trong tháng" value={10} icon={<UserAddOutlined style={{ color: 'green' }} />} />
        </Link>
        </Col>
        <Col xxl={6} xl={6} lg={6} md={12} sm={24} xs={24}>
        <Link to="/admin/transactions">
        <CardItem title="Giao dịch đang xử lý" value={3} icon={<ShoppingOutlined style={{ color: 'blue' }} />}  />
        </Link>
        </Col>
        <Col xxl={6} xl={6} lg={6} md={12} sm={24} xs={24}>
        <Link to="/admin/disputes">
        <CardItem title="Khiếu nại cần xử lý" value={1} icon={<WarningOutlined style={{ color: 'orange' }} />} />
        </Link>
        </Col>
    </Row>

    <Row gutter={[20, 20]} className='mt-20'>
        <Col xxl={16} xl={16} lg={16} md={24} sm={24} xs={24}>
        <CardItem title="Doanh thu theo tháng" style={{ height: '400px' }} >
        <LineChart data={revenueData} />
        </CardItem>
        </Col>
        <Col xxl={8} xl={8} lg={8} md={24} sm={24} xs={24}>
        <CardItem title="Số lượng xe đăng bán theo trạng thái" style={{ height: '400px' }} >
        <PieChart data={carStatusData} />
        </CardItem>
        </Col>
    </Row>
    <Row gutter={[20, 20]} className='mt-20'>
        <Col xxl={8} xl={8} lg={8} md={24} sm={24} xs={24}>
        <CardItem title="Số lượng giao dịch theo trạng thái" style={{ height: '400px' }} >
          <PieChart data={transactionStatusData} />
        </CardItem>
        </Col>
        <Col xxl={16} xl={16} lg={16} md={24} sm={24} xs={24}>
        <CardItem title="Người dùng mới theo thời gian" style={{ height: '400px' }} >
        <LineChart data={newUserData} />
        </CardItem>
        </Col>
    </Row>
    {/* <Row gutter={[20, 20]} className='mt-20'>
        <Col xxl={8} xl={8} lg={8} md={24} sm={24} xs={24}>
        <CardItem title="Box 9" style={{ height: '400px' }} />
        </Col>
        <Col xxl={8} xl={8} lg={8} md={24} sm={24} xs={24}>
        <CardItem title="Box 10" style={{ height: '400px' }} />
        </Col>
        <Col xxl={8} xl={8} lg={8} md={24} sm={24} xs={24}>
        <CardItem title="Box 11" style={{ height: '400px' }} />
        </Col>
    </Row> */}
    </>
  )
}
