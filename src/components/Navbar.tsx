import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { userData } = useAuth();
  return (
    <nav className="w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <span className="ml-2 text-lg font-semibold text-gray-900">Rex Wilfred</span>
      </div>
      <div className="flex items-center space-x-4">
        {userData && (
          <>
            <span className="text-sm text-gray-700 font-medium">{userData.name}</span>
            <span className="text-xs text-gray-500 capitalize">{userData.role.replace('_', ' ')}</span>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 