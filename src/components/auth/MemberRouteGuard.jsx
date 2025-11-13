import { Navigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext'; 
import MemberLayout from '../../layouts/MemberLayout'; 
import { Spin } from 'antd';

const MemberRouteGuard = () => {
  const { user, isAuthenticated, loading } = useUser();

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.roles.includes("STAFF")) {
    return <Navigate to="/staff" replace />;
  }
  if (user.roles.includes("MANAGER")) {
    return <Navigate to="/manager" replace />;
  }

  if (user.roles && user.roles.includes("STAFF")) {
    return <Navigate to="/staff" replace />;
  }

  if (user.roles && user.roles.includes("MANAGER")) {
    return <Navigate to="/manager" replace />;
  }

  return <MemberLayout />;
};

export default MemberRouteGuard;