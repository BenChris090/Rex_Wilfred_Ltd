import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { User, Task } from '../types';

const TaskAssignmentPage: React.FC = () => {
  const { userData } = useAuth();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    reward: '',
    dueDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!userData) return;
      setLoading(true);
      try {
        // Fetch team members
        const usersQuery = query(
          collection(db, 'users'),
          where('state', '==', userData?.state),
          where('role', '==', 'team_member')
        );
        const usersSnapshot = await getDocs(usersQuery);
        setTeamMembers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[]);
        // Fetch tasks assigned by this head
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('assignedBy', '==', userData.id)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        setTasks(tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[]);
      } catch (e) {
        setMessage('Error loading data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    setSubmitting(true);
    setMessage('');
    try {
      await addDoc(collection(db, 'tasks'), {
        title: form.title,
        description: form.description,
        assignedTo: form.assignedTo,
        assignedBy: userData.id,
        state: userData.state,
        reward: Number(form.reward),
        status: 'assigned',
        dueDate: form.dueDate ? Timestamp.fromDate(new Date(form.dueDate)) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setMessage('Task assigned successfully!');
      setForm({ title: '', description: '', assignedTo: '', reward: '', dueDate: '' });
    } catch (e) {
      setMessage('Error assigning task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Assign Tasks</h1>
        <p className="mt-1 text-sm text-gray-500">Assign new tasks to your team members</p>
      </div>
      {message && (
        <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>{message}</div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
          <select name="assignedTo" value={form.assignedTo} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Select member</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reward (₦)</label>
            <input name="reward" type="number" min="0" value={form.reward} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{submitting ? 'Assigning...' : 'Assign Task'}</button>
        </div>
      </form>
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Assigned Tasks</h2>
        {loading ? <div className="py-4">Loading...</div> : tasks.length === 0 ? <div className="py-4 text-gray-500">No tasks assigned yet.</div> : (
          <ul className="divide-y divide-gray-200">
            {tasks.map(task => (
              <li key={task.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-medium text-gray-900">{task.title}</div>
                  <div className="text-sm text-gray-500">{task.description}</div>
                </div>
                <div className="mt-2 md:mt-0 text-sm text-gray-700">Assigned to: {teamMembers.find(m => m.id === task.assignedTo)?.name || 'Unknown'}</div>
                <div className="mt-2 md:mt-0 text-xs text-gray-500">Status: {task.status}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskAssignmentPage; 