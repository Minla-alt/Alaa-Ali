import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../api/client';
import { authAPI } from '../api/auth';

const LEVELS = ['Beginner', 'HighSchool', 'University', 'SelfPaced'];
const SUBJECTS = ['Math', 'Science', 'Languages', 'Programming', 'Other'];
const LANGS = ['en', 'ar', 'bilingual'];
const empty = { title: '', author: '', subject: 'Languages', educationLevel: 'Beginner', language: 'en', source: '', sourceUrl: '', order: 999, description: '' };

const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [type, setType] = useState('courses');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    authAPI.getMe().then((r) => setIsAdmin(r.user?.role === 'admin')).catch(() => setIsAdmin(false));
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await apiClient.get(`/api/admin/${type}`);
      setItems(r.data.items || []);
    } catch (e) {
      setMessage(e.response?.data?.message || 'Failed to load');
    }
  }, [type]);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setMessage('');
    const body = { ...form, order: Number(form.order) || 999 };
    if (type === 'courses') delete body.author;
    try {
      if (editingId) await apiClient.put(`/api/admin/${type}/${editingId}`, body);
      else await apiClient.post(`/api/admin/${type}`, body);
      setForm(empty); setEditingId(null); setMessage('Saved'); load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Save failed');
    }
  };

  const edit = (it) => {
    setEditingId(it._id);
    setForm({ ...empty, ...it, order: it.order ?? 999, sourceUrl: it.sourceUrl || '', description: it.description || '', author: it.author || '' });
    window.scrollTo(0, 0);
  };

  const toggle = async (it) => {
    await apiClient.put(`/api/admin/${type}/${it._id}`, { isActive: !it.isActive });
    load();
  };

  const remove = async (it) => {
    if (!window.confirm(`Delete "${it.title}"?`)) return;
    await apiClient.delete(`/api/admin/${type}/${it._id}`);
    load();
  };

  if (isAdmin === null) return <div className="p-8 text-center">Loading...</div>;
  if (!isAdmin) return <div className="p-8 text-center text-secondary-700">Admin access required.</div>;

  const input = 'w-full border border-secondary-300 rounded-lg px-3 py-2';
  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="ltr">
      <h1 className="text-2xl font-bold mb-4">Admin: manage content</h1>
      <div className="flex gap-2 mb-6">
        {['courses', 'books'].map((t) => (
          <button key={t} onClick={() => { setType(t); setEditingId(null); setForm(empty); }}
            className={`px-4 py-2 rounded-lg border ${type === t ? 'bg-primary-600 text-white' : 'bg-white'}`}>{t}</button>
        ))}
      </div>

      <form onSubmit={save} className="bg-white border border-secondary-200 rounded-xl p-4 mb-8 grid gap-3 md:grid-cols-2">
        <input className={input} placeholder="Title" required value={form.title} onChange={change('title')} />
        {type === 'books' && <input className={input} placeholder="Author" value={form.author} onChange={change('author')} />}
        <input className={input} placeholder="Source (e.g. Khan Academy)" required value={form.source} onChange={change('source')} />
        <input className={input} placeholder="Link (https://...)" value={form.sourceUrl} onChange={change('sourceUrl')} />
        <select className={input} value={form.subject} onChange={change('subject')}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select>
        <select className={input} value={form.educationLevel} onChange={change('educationLevel')}>{LEVELS.map((s) => <option key={s}>{s}</option>)}</select>
        <select className={input} value={form.language} onChange={change('language')}>{LANGS.map((s) => <option key={s}>{s}</option>)}</select>
        <input className={input} type="number" placeholder="Order (1 first)" value={form.order} onChange={change('order')} />
        <textarea className={`${input} md:col-span-2`} rows={3} maxLength={1000} placeholder="Description" value={form.description} onChange={change('description')} />
        <div className="md:col-span-2 flex items-center gap-3">
          <button type="submit" className="btn-primary px-6 py-2">{editingId ? 'Update' : 'Add'}</button>
          {editingId && <button type="button" className="px-4 py-2 border rounded-lg" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>}
          <span className="text-sm text-secondary-600">{message}</span>
        </div>
      </form>

      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it._id} className="bg-white border border-secondary-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className={`font-semibold ${it.isActive === false ? 'opacity-50' : ''}`}>{it.order ?? 999}. {it.title}</div>
              <div className="text-sm text-secondary-600">{it.educationLevel} · {it.subject} · {it.source}{it.isActive === false ? ' · hidden' : ''}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded" onClick={() => edit(it)}>Edit</button>
              <button className="px-3 py-1 border rounded" onClick={() => toggle(it)}>{it.isActive === false ? 'Show' : 'Hide'}</button>
              <button className="px-3 py-1 border rounded text-red-600" onClick={() => remove(it)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
