import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Task, User } from '../types';
import { format } from 'date-fns';

const VerificationPage: React.FC = () => {
  const { userData } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userData || userData.role !== 'super_admin') return;
      setLoading(true);
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('status', 'in', ['submitted', 'approved'])
        );
        const snapshot = await getDocs(tasksQuery);
        setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[]);
      } catch (e) {
        setMessage('Error loading tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [userData]);

  const handleVerify = async (task: Task) => {
    setMessage('');
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: 'verified',
        verifiedBy: userData?.id,
        verifiedAt: new Date(),
        updatedAt: new Date()
      });
      setTasks(prev => prev.filter(t => t.id !== task.id));
      setMessage('Task verified successfully!');
    } catch (e) {
      setMessage('Error verifying task');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Task Verification</h1>
        <p className="mt-1 text-sm text-gray-500">Review and verify completed tasks</p>
      </div>
      {message && (
        <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>{message}</div>
      )}
      {loading ? <div className="py-4">Loading...</div> : tasks.length === 0 ? <div className="py-4 text-gray-500">No tasks to verify.</div> : (
        <ul className="divide-y divide-gray-200">
          {tasks.map(task => (
            <li key={task.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium text-gray-900">{task.title}</div>
                <div className="text-sm text-gray-500">{task.description}</div>
                <div className="text-xs text-gray-400">Assigned to: {task.assignedTo}</div>
                <div className="text-xs text-gray-400">Status: {task.status}</div>
              </div>
              <div className="mt-2 md:mt-0 flex space-x-2">
                <button onClick={() => handleVerify(task)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Mark as Verified</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VerificationPage; 