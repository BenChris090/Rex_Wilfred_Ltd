import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Task, PaymentSummary } from '../types';
import { format } from 'date-fns';
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const PaymentSummaryPage: React.FC = () => {
  const { userData } = useAuth();
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    totalEarned: 0,
    totalPaid: 0,
    pendingPayout: 0,
    bankInfo: {
      accountName: '',
      accountNumber: '',
      bankName: ''
    }
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!userData) return;

      try {
        setLoading(true);

        // Fetch user's bank info
        const userDoc = await getDoc(doc(db, 'users', userData.id));
        const userDataFromDb = userDoc.data();
        const bankInfo = userDataFromDb?.bankInfo || {
          accountName: '',
          accountNumber: '',
          bankName: ''
        };

        // Fetch user's tasks
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('assignedTo', '==', userData.id)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasksData = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          verifiedAt: doc.data().verifiedAt?.toDate()
        })) as Task[];

        setTasks(tasksData);

        // Calculate payment summary
        const verifiedTasks = tasksData.filter(task => task.status === 'verified');
        const totalEarned = verifiedTasks.reduce((sum, task) => sum + task.reward, 0);
        const totalPaid = 0; // This would come from payment records in a real app
        const pendingPayout = totalEarned - totalPaid;

        setPaymentSummary({
          totalEarned,
          totalPaid,
          pendingPayout,
          bankInfo
        });
      } catch (error) {
        console.error('Error fetching payment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
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
        <h1 className="text-2xl font-bold text-gray-900">Payment Summary</h1>
        <p className="mt-1 text-sm text-gray-500">
          View your earnings and payment information
        </p>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Earned</dt>
                  <dd className="text-lg font-medium text-gray-900">₦{paymentSummary.totalEarned.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Paid</dt>
                  <dd className="text-lg font-medium text-gray-900">₦{paymentSummary.totalPaid.toLocaleString()}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Payout</dt>
                  <dd className="text-lg font-medium text-gray-900">₦{paymentSummary.pendingPayout.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Information */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Bank Account Information</h2>
        </div>
        <div className="p-6">
          {paymentSummary.bankInfo.accountName ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Name</label>
                <p className="mt-1 text-sm text-gray-900">{paymentSummary.bankInfo.accountName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Number</label>
                <p className="mt-1 text-sm text-gray-900">{paymentSummary.bankInfo.accountNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Bank Name</label>
                <p className="mt-1 text-sm text-gray-900">{paymentSummary.bankInfo.bankName}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bank information</h3>
              <p className="mt-1 text-sm text-gray-500">Please update your bank details in settings.</p>
            </div>
          )}
        </div>
      </div>

      {/* Task History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Task History</h2>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No tasks found
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-500">{task.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'verified' ? 'bg-green-100 text-green-800' :
                        task.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{task.reward.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.verifiedAt ? format(task.verifiedAt, 'MMM dd, yyyy') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummaryPage; 