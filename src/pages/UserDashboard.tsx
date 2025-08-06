import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './Dashboard';

const UserDashboard: React.FC = () => {
  // In the future, you can add more role-based dashboards here
  return <Dashboard />;
};

export default UserDashboard; 