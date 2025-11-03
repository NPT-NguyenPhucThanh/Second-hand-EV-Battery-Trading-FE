// src/components/auth/AdminRouteGuard.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext'; 
import { Spin } from 'antd';

const AdminRouteGuard = ({ LayoutComponent, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useUser();

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  const hasPermission = user.roles && user.roles.some(role => allowedRoles.includes(role));

  if (hasPermission) {
    return <LayoutComponent />;
  } else {
    return <Navigate to="/" replace />;
  }
};

export default AdminRouteGuard;