'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { csrAxiosClient } from '@/utils/axiosClient';

interface Classification {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export default function ClassificationsPage() {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    fetchClassifications();
  }, []);

  const fetchClassifications = async () => {
    try {
      const res = await csrAxiosClient.get('/classification-levels');
      setClassifications(res.data);
    } catch (err) {
      console.error(err);
      alert(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    if (!name.trim()) {
      alert('Name required');
      return;
    }
    try {
      await csrAxiosClient.post('/classification-levels', { name, description });
      setName('');
      setDescription('');
      await fetchClassifications();
      alert('Created');
    } catch (err: any) {
      alert(err.response?.data?.message || t('common.error'));
    }
  };

  const update = async (id: string, newName: string, newDesc: string) => {
    try {
      await csrAxiosClient.put(`/classification-levels/${id}`, { name: newName, description: newDesc });
      await fetchClassifications();
      alert('Updated');
    } catch (err: any) {
      alert(err.response?.data?.message || t('common.error'));
    }
  };

  const deleteClass = async (id: string) => {
    if (!confirm('Delete?')) return;
    try {
      await csrAxiosClient.delete(`/classification-levels/${id}`);
      await fetchClassifications();
      alert('Deleted');
    } catch (err: any) {
      alert(err.response?.data?.message || t('common.error'));
    }
  };

  if (loading) return <div className="p-8">{t('common.loading')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Classifications</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New</h2>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            rows={3}
          />
          <button
            onClick={create}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Create
          </button>
        </div>

        <div className="space-y-2">
          {classifications.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-gray-600">{c.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newName = prompt('New name:', c.name);
                    const newDesc = prompt('New description:', c.description || '');
                    if (newName) update(c.id, newName, newDesc || '');
                  }}
                  className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteClass(c.id)}
                  className="bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
