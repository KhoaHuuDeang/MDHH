'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { csrAxiosClient } from '@/utils/axiosClient';

interface Classification {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
  description?: string;
  level_id: string;
  classification_levels?: Classification;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const load = async () => {
      try {
        const [tagsRes, classRes] = await Promise.all([
          csrAxiosClient.get('/tags'),
          csrAxiosClient.get('/classification-levels'),
        ]);
        setTags(tagsRes.data);
        setClassifications(classRes.data);
      } catch (err) {
        console.error(err);
        alert(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  const create = async () => {
    if (!name.trim() || !selectedLevel) {
      alert('Name and level required');
      return;
    }
    try {
      await csrAxiosClient.post('/tags', { name, description, levelId: selectedLevel });
      setName('');
      setDescription('');
      setSelectedLevel('');
      const res = await csrAxiosClient.get('/tags');
      setTags(res.data);
      alert('Created');
    } catch (err: any) {
      alert(err.response?.data?.message || t('common.error'));
    }
  };

  const update = async (id: string, newName: string, newDesc: string) => {
    try {
      await csrAxiosClient.put(`/tags/${id}`, { name: newName, description: newDesc });
      const res = await csrAxiosClient.get('/tags');
      setTags(res.data);
      alert('Updated');
    } catch (err: any) {
      alert(err.response?.data?.message || t('common.error'));
    }
  };

  const deleteTag = async (id: string) => {
    if (!confirm('Delete?')) return;
    try {
      await csrAxiosClient.delete(`/tags/${id}`);
      const res = await csrAxiosClient.get('/tags');
      setTags(res.data);
      alert('Deleted');
    } catch (err: any) {
      alert(err.response?.data?.message || t('common.error'));
    }
  };

  if (loading) return <div className="p-8">{t('common.loading')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tags</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New</h2>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          >
            <option value="">Select Classification Level</option>
            {classifications.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
          {tags.map((tag) => (
            <div key={tag.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{tag.name}</h3>
                <p className="text-sm text-gray-600">{tag.description}</p>
                <p className="text-xs text-gray-400">
                  Level: {tag.classification_levels?.name || 'Unknown'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newName = prompt('New name:', tag.name);
                    const newDesc = prompt('New description:', tag.description || '');
                    if (newName) update(tag.id, newName, newDesc || '');
                  }}
                  className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTag(tag.id)}
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
