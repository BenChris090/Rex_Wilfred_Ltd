import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Task } from "../types"; // define your User type here or inline below
import { getTeamMembers } from "../services/FetchTeamMembers";
import { getTasksByState } from "../services/FetchTasksState";
import { getTasks } from '../services/FetchTasks';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalEarned: 0,
    teamMembers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!userData) return;

      try {
        let tasksQuery;
        let usersQuery; 
        let totalTasks;
        let completedTasks;
        let pendingTasks;
        let totalEarned;

        if (userData.role === 'team_member') {
          // Team member sees only their tasks
          if (userData?.state) {
            tasksQuery = await getTasksByState(userData.state);
          }

        } else if (userData.role === 'state_head') {
          // State head sees tasks in their state
           if (userData?.state) {
            tasksQuery = await getTasksByState(userData.state);
          }
          usersQuery = await getTeamMembers(userData);
        } else {
          // Super admin sees all tasks
          usersQuery = await getTeamMembers(userData);
          tasksQuery = await getTasks();
        }

        let teamMembers = 0;
        if (usersQuery) {
          teamMembers = usersQuery.length;
        }
        if (tasksQuery) {
          const tasks= tasksQuery as Task[];
          totalTasks = tasks.length;
          completedTasks = tasks.filter((task) => task.status === 'verified').length;
          pendingTasks = tasks.filter(task => task.status === 'assigned' || task.status === 'submitted').length;
          totalEarned = tasks.filter(task => task.status === 'verified')?.reduce((sum, task) => sum + task.reward, 0);

          setStats({
            totalTasks,
            completedTasks,
            pendingTasks,
            totalEarned,
            teamMembers          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [userData]);

  const getRoleSpecificContent = () => {
    switch (userData?.role) {
      case 'team_member':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.completedTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Earned</dt>
                      <dd className="text-lg font-medium text-gray-900">₦{stats.totalEarned.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'state_head':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Team Members</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.teamMembers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.completedTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Approval</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'super_admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Members</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.teamMembers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Verified</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.completedTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Verification</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {userData.name}. Here's what's happening with your tasks.
        </p>
      </div>

      {getRoleSpecificContent()}

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userData.role === 'team_member' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Submit Task</h3>
                <p className="text-sm text-gray-500 mb-4">Submit proof for your completed tasks</p>
                <Link to={"/submit-task"}>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700">
                    Submit Task
                  </button>
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">View Payments</h3>
                <p className="text-sm text-gray-500 mb-4">Check your payment summary and earnings</p>
                <Link to={"/payment-summary"}>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                    View Payments
                  </button>
                </Link>
              </div>
            </>
          )}

          {userData.role === 'state_head' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Team</h3>
                <p className="text-sm text-gray-500 mb-4">View and manage your team members</p>
                <Link to={"/team-management"}>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                    Manage Team
                  </button>
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Assign Tasks</h3>
                <p className="text-sm text-gray-500 mb-4">Create and assign new tasks to team members</p>
                <Link to={"/assign-tasks"}>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                    Assign Tasks
                  </button>
                </Link>
              </div>
            </>
          )}

          {userData.role === 'super_admin' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Verify Tasks</h3>
                <p className="text-sm text-gray-500 mb-4">Review and verify completed tasks</p>
                <Link to={"/verification"}>                  
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                    Verify Tasks
                  </button>
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">View All Teams</h3>
                <p className="text-sm text-gray-500 mb-4">Monitor all teams across states</p>
                <Link to={"/all-teams"}>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                    View Teams
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 