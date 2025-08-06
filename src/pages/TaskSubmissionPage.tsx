import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Task, TaskSubmission } from '../types';
import { format } from 'date-fns';
import {
  PaperClipIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const TaskSubmissionPage: React.FC = () => {
  const { userData } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submission, setSubmission] = useState({
    proofText: '',
    proofFiles: [] as File[]
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userData) return;

      try {
        setLoading(true);
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('assignedTo', '==', userData.id),
          where('status', '==', 'assigned')
        );

        const snapshot = await getDocs(tasksQuery);
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          dueDate: doc.data().dueDate?.toDate()
        })) as Task[];

        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setMessage('Error loading tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSubmission(prev => ({
        ...prev,
        proofFiles: [...prev.proofFiles, ...Array.from(e.target.files!)]
      }));
    }
  };

  const removeFile = (index: number) => {
    setSubmission(prev => ({
      ...prev,
      proofFiles: prev.proofFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !userData) return;

    try {
      setSubmitting(true);
      setMessage('');

      // Create submission document
      const submissionData: Omit<TaskSubmission, 'id'> = {
        taskId: selectedTask.id,
        userId: userData.id,
        proofText: submission.proofText,
        proofFiles: [], // In a real app, you'd upload files to storage
        submittedAt: new Date(),
        status: 'submitted'
      };

      await addDoc(collection(db, 'submissions'), submissionData);

      // Update task status
      await updateDoc(doc(db, 'tasks', selectedTask.id), {
        status: 'submitted',
        updatedAt: new Date()
      });

      setMessage('Task submitted successfully!');
      setSelectedTask(null);
      setSubmission({ proofText: '', proofFiles: [] });
      
      // Refresh tasks list
      const updatedTasks = tasks.filter(task => task.id !== selectedTask.id);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error submitting task:', error);
      setMessage('Error submitting task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Submit Task</h1>
        <p className="mt-1 text-sm text-gray-500">
          Submit proof for your completed tasks
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.includes('Error') 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {!selectedTask ? (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Available Tasks</h2>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tasks available for submission.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{task.title}</h3>
                      <p className="text-gray-600 mb-4">{task.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Reward:</span>
                          <span className="ml-1 font-medium text-green-600">₦{task.reward.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Due Date:</span>
                          <span className="ml-1 font-medium">
                            {task.dueDate ? format(task.dueDate, 'MMM dd, yyyy') : 'Not set'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <span className="ml-1 font-medium">
                            {task.createdAt ? format(task.createdAt, 'MMM dd, yyyy') : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="ml-4 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700">
                      Submit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <button
              onClick={() => setSelectedTask(null)}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              ← Back to tasks
            </button>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Task Details</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedTask.title}</h3>
            <p className="text-gray-600 mb-4">{selectedTask.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Reward:</span>
                <span className="ml-1 font-medium text-green-600">₦{selectedTask.reward.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Due Date:</span>
                <span className="ml-1 font-medium">
                  {selectedTask.dueDate ? format(selectedTask.dueDate, 'MMM dd, yyyy') : 'Not set'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-1 font-medium">
                  {selectedTask.createdAt ? format(selectedTask.createdAt, 'MMM dd, yyyy') : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Submit Proof</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="proofText" className="block text-sm font-medium text-gray-700 mb-2">
                  Proof Description
                </label>
                <textarea
                  id="proofText"
                  rows={4}
                  value={submission.proofText}
                  onChange={(e) => setSubmission(prev => ({ ...prev, proofText: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Describe how you completed this task..."
                  required
                />
              </div>

              <div>
                <label htmlFor="proofFiles" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB each</p>
                  </div>
                </div>
              </div>

              {submission.proofFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h3>
                  <div className="space-y-2">
                    {submission.proofFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircleIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Task'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskSubmissionPage; 