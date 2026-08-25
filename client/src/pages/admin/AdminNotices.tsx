import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Send } from 'lucide-react';
import api from '../../api/client';

export const AdminNotices: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    targetRole: 'all',
  });

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/notices', newNotice);
      if (res.data.success) {
        alert('Notice published to the system bulletin!');
        setShowModal(false);
        setNewNotice({ title: '', content: '', targetRole: 'all' });
        fetchNotices();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create notice');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
    } catch (err) {
      alert('Failed to delete notice');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            System Bulletins & Announcements
          </h1>
          <p className="text-sm text-slate-400">
            Publish academic notices and emergency broadcasts with role-targeted routing.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notices.map((n) => (
          <div
            key={n._id}
            className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Target: {n.targetRole}
                </span>
                <button
                  onClick={() => handleDelete(n._id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="font-bold text-base text-white mt-3">{n.title}</h3>
              <p className="text-xs text-slate-400 mt-2 whitespace-pre-wrap">{n.content}</p>
            </div>

            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>Published by {n.postedBy?.name || 'Administrator'}</span>
              <span>{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Announcement</h3>
            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-term Exam Schedule"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Target Audience
                </label>
                <select
                  value={newNotice.targetRole}
                  onChange={(e) => setNewNotice({ ...newNotice, targetRole: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                >
                  <option value="all">Everyone (All Roles)</option>
                  <option value="student">Students Only</option>
                  <option value="teacher">Faculty Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Notice Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write the bulletin message here..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-600/20"
                >
                  Publish Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
