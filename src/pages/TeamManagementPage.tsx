import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { User, Task } from '../types';
import { format } from 'date-fns';
import {
  UserIcon
} from '@heroicons/react/24/outline';

const TeamManagementPage: React.FC = () => {
  const { userData } = useAuth();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [memberStats, setMemberStats] = useState<Record<string, { totalTasks: number; completedTasks: number; totalEarned: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!userData || userData.role !== 'state_head') return;

      try {
        setLoading(true);

        // Fetch team members in the same state
        const usersQuery = query(
          collection(db, 'users'),
          where('state', '==', userData.state),
          where('role', '==', 'team_member')
        );
        const usersSnapshot = await getDocs(usersQuery);
        const members = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        })) as User[];

        setTeamMembers(members);

        // Fetch stats for each member
        const stats: Record<string, { totalTasks: number; completedTasks: number; totalEarned: number }> = {};
        
        for (const member of members) {
          const tasksQuery = query(
            collection(db, 'tasks'),
            where('assignedTo', '==', member.id)
          );
          const tasksSnapshot = await getDocs(tasksQuery);
          const tasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Task[];

          const totalTasks = tasks.length;
          const completedTasks = tasks.filter(task => task.status === 'verified').length;
          const totalEarned = tasks
            .filter(task => task.status === 'verified')
            .reduce((sum, task) => sum + task.reward, 0);

          stats[member.id] = {
            totalTasks,
            completedTasks,
            totalEarned
          };
        }

        setMemberStats(stats);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [userData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your team members in {userData?.state}
        </p>
      </div>

      {/* Team Overview */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Team Overview</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{teamMembers.length}</div>
              <div className="text-sm text-gray-500">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Object.values(memberStats).reduce((sum, stats) => sum + stats.totalTasks, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Tasks Assigned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Object.values(memberStats).reduce((sum, stats) => sum + stats.completedTasks, 0)}
              </div>
              <div className="text-sm text-gray-500">Completed Tasks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
        </div>
        <div className="overflow-auto">
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
              <p className="mt-1 text-sm text-gray-500">No team members found in your state.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {teamMembers.map((member) => {
                const stats = memberStats[member.id] || { totalTasks: 0, completedTasks: 0, totalEarned: 0 };
                
                return (
                  <div key={member.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-sm">
                              {member.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                          <div className="text-xs text-gray-400">
                            Joined {member.createdAt ? format(member.createdAt, 'MMM dd, yyyy') : 'Unknown'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">{stats.totalTasks}</div>
                          <div className="text-xs text-gray-500">Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-600">{stats.completedTasks}</div>
                          <div className="text-xs text-gray-500">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-blue-600">₦{stats.totalEarned.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Earned</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                          </div>
                          <div className="text-xs text-gray-500">Success Rate</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bank Information */}
                    {member.bankInfo && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Bank:</span>
                            <span className="ml-1 font-medium">{member.bankInfo.bankName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Account:</span>
                            <span className="ml-1 font-medium">{member.bankInfo.accountName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Number:</span>
                            <span className="ml-1 font-medium">{member.bankInfo.accountNumber}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManagementPage; 