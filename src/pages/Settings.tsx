import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { userData } = useAuth();

  if (!userData) {
    return <div>Loading...</div>;
  }

  const [form, setForm] = useState({
    name: userData.name || '',
    email: userData.email || '',
    bankName: userData.bankInfo?.bankName || '',
    accountName: userData.bankInfo?.accountName || '',
    accountNumber: userData.bankInfo?.accountNumber || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const userRef = doc(db, 'users', userData.id);
      await updateDoc(userRef, {
        name: form.name,
        email: form.email,
        bankInfo: {
          bankName: form.bankName,
          accountName: form.accountName,
          accountNumber: form.accountNumber,
        },
      });
      setSuccess('Profile updated!');// If your AuthContext supports refreshing user data
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="mt-1 block w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="mt-1 block w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bank Name</label>
          <input name="bankName" value={form.bankName} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Account Name</label>
          <input name="accountName" value={form.accountName} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Account Number</label>
          <input name="accountNumber" value={form.accountNumber} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        {success && <div className="text-green-600">{success}</div>}
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Settings;