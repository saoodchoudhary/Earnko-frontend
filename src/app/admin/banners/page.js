'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, RefreshCw, Save, Trash2, Upload, X } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || '';

const safeJson = async (res) => {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch { return null; }
  }
  const txt = await res.text().catch(() => '');
  return { success: false, message: txt };
};

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

function buildPublicUrl(base, maybeRelative) {
  if (!maybeRelative) return '';
  const u = String(maybeRelative);
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return base ? `${base}${u}` : u;
}

function toDateTimeLocalValue(d) {
  if (!d) return '';
  const x = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

function fromDateTimeLocalValue(v) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

const emptyForm = {
  title: '',
  subtitle: '',
  linkUrl: '',
  buttonText: 'Shop Now',
  platform: '',
  sortOrder: 0,
  isActive: true,
  startsAt: '',
  endsAt: '',
};

export default function AdminBannersPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const envWarned = useRef(false);

  const ensureEnvConfigured = () => {
    if (!API_BASE && !envWarned.current) {
      envWarned.current = true;
      toast.error('Backend URL not configured. Set NEXT_PUBLIC_BACKEND_URL');
    }
  };

  const handleHttpError = async (res) => {
    let message = 'Request failed';
    try {
      const js = await res.clone().json();
      if (js?.message) message = js.message;
    } catch {}
    if (res.status === 401) message = 'Unauthorized. Please login again.';
    if (res.status === 403) message = 'Forbidden. Admin access required.';
    throw new Error(message);
  };

  const load = async (showLoading = true) => {
    try {
      ensureEnvConfigured();
      const token = getToken();
      if (!token) { toast.error('Login required'); return; }

      if (showLoading) setLoading(true);
      setRefreshing(!showLoading);

      const res = await fetch(`${API_BASE}/api/admin/banners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) await handleHttpError(res);
      const js = await safeJson(res);
      const list = Array.isArray(js?.data?.items) ? js.data.items : [];
      setItems(list);
    } catch (err) {
      toast.error(err?.message || 'Failed to load banners');
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(true); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      title: b?.title || '',
      subtitle: b?.subtitle || '',
      linkUrl: b?.linkUrl || '',
      buttonText: b?.buttonText || 'Shop Now',
      platform: b?.platform || '',
      sortOrder: Number(b?.sortOrder || 0),
      isActive: !!b?.isActive,
      startsAt: toDateTimeLocalValue(b?.startsAt),
      endsAt: toDateTimeLocalValue(b?.endsAt),
    });
    setImageFile(null);
    setImagePreview(buildPublicUrl(API_BASE, b?.imageUrl));
    setOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
  };

  const uploadImage = async (bannerId, file) => {
    const token = getToken();
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`${API_BASE}/api/admin/banners/${bannerId}/image`, {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      body: fd
    });
    if (!res.ok) await handleHttpError(res);
    return res.json();
  };

  const save = async () => {
    try {
      ensureEnvConfigured();
      const token = getToken();
      if (!token) { toast.error('Login required'); return; }

      // For create: image is required
      if (!editing?._id && !imageFile) {
        toast.error('Please select a banner image');
        return;
      }

      setSaving(true);

      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        linkUrl: form.linkUrl.trim(),
        buttonText: form.buttonText.trim(),
        platform: form.platform.trim(),
        sortOrder: Number(form.sortOrder || 0),
        isActive: !!form.isActive,
        startsAt: fromDateTimeLocalValue(form.startsAt),
        endsAt: fromDateTimeLocalValue(form.endsAt),
      };

      // Step 1: create/update banner (without uploading file in same request)
      let bannerId = editing?._id;

      if (!bannerId) {
        // create with placeholder imageUrl (backend allows it)
        const res = await fetch(`${API_BASE}/api/admin/banners`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ ...payload, imageUrl: '/uploads/placeholder.png' }),
        });
        if (!res.ok) await handleHttpError(res);
        const js = await safeJson(res);
        bannerId = js?.data?.item?._id;
      } else {
        const res = await fetch(`${API_BASE}/api/admin/banners/${bannerId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) await handleHttpError(res);
        await safeJson(res);
      }

      // Step 2: upload image if selected (create OR edit)
      if (bannerId && imageFile) {
        await uploadImage(bannerId, imageFile);
      }

      toast.success(editing?._id ? 'Banner updated' : 'Banner created');
      closeModal();
      await load(false);
    } catch (err) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (bannerId) => {
    try {
      ensureEnvConfigured();
      const token = getToken();
      if (!token) { toast.error('Login required'); return; }

      if (!confirm('Delete this banner?')) return;

      const res = await fetch(`${API_BASE}/api/admin/banners/${bannerId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) await handleHttpError(res);

      toast.success('Banner deleted');
      await load(false);
    } catch (err) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  const onPickFile = (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      toast.error('Only image files allowed');
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
            <p className="text-gray-600 mt-1">Upload multiple homepage banners (saved in backend /uploads)</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => load(false)}
              disabled={refreshing || loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={openCreate}
              className="px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Banner
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">
            No banners yet. Click <b>Add Banner</b>.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {items.map((b) => (
              <div key={b._id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-full md:w-[260px] h-[90px] rounded-xl overflow-hidden bg-gray-100 border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={buildPublicUrl(API_BASE, b.imageUrl)} alt={b.title || 'banner'} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{b.title || '(No title)'}</div>
                  <div className="text-sm text-gray-600 truncate">{b.subtitle || ''}</div>
                  <div className="text-xs text-gray-500 mt-2 truncate">
                    {b.isActive ? 'Active' : 'Inactive'} • sort: {Number(b.sortOrder || 0)} • platform: {b.platform || '—'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    link: {b.linkUrl || '—'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(b)}
                    className="px-3 py-2 border rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(b._id)}
                    className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 z-[80]">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="font-semibold text-gray-900">
                  {editing?._id ? 'Edit Banner' : 'Create Banner'}
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100" onClick={closeModal}>
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Title">
                  <input className="w-full px-3 py-2 border rounded-lg" value={form.title}
                    onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                  />
                </Field>

                <Field label="Platform (optional)">
                  <input className="w-full px-3 py-2 border rounded-lg" value={form.platform}
                    onChange={(e) => setForm((s) => ({ ...s, platform: e.target.value }))}
                  />
                </Field>

                <Field label="Subtitle" full>
                  <input className="w-full px-3 py-2 border rounded-lg" value={form.subtitle}
                    onChange={(e) => setForm((s) => ({ ...s, subtitle: e.target.value }))}
                  />
                </Field>

                <Field label="Banner Image (upload) *" full>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onPickFile(e.target.files?.[0])}
                      className="w-full"
                    />
                    {imagePreview ? (
                      <div className="w-full h-[160px] rounded-xl overflow-hidden border bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        {editing?._id ? 'Optional: choose file to replace image' : 'Required: choose an image file'}
                      </div>
                    )}
                  </div>
                </Field>

                <Field label="Click Link URL (optional)" full>
                  <input className="w-full px-3 py-2 border rounded-lg" value={form.linkUrl}
                    onChange={(e) => setForm((s) => ({ ...s, linkUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </Field>

                <Field label="Button text">
                  <input className="w-full px-3 py-2 border rounded-lg" value={form.buttonText}
                    onChange={(e) => setForm((s) => ({ ...s, buttonText: e.target.value }))}
                  />
                </Field>

                <Field label="Sort order">
                  <input type="number" className="w-full px-3 py-2 border rounded-lg" value={form.sortOrder}
                    onChange={(e) => setForm((s) => ({ ...s, sortOrder: e.target.value }))}
                  />
                </Field>

                <Field label="Active">
                  <select className="w-full px-3 py-2 border rounded-lg" value={form.isActive ? 'yes' : 'no'}
                    onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.value === 'yes' }))}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </Field>

                <Field label="Starts at">
                  <input type="datetime-local" className="w-full px-3 py-2 border rounded-lg" value={form.startsAt}
                    onChange={(e) => setForm((s) => ({ ...s, startsAt: e.target.value }))}
                  />
                </Field>

                <Field label="Ends at">
                  <input type="datetime-local" className="w-full px-3 py-2 border rounded-lg" value={form.endsAt}
                    onChange={(e) => setForm((s) => ({ ...s, endsAt: e.target.value }))}
                  />
                </Field>
              </div>

              <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black disabled:opacity-60 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!API_BASE && (
          <div className="mt-4 text-xs text-red-600">
            NEXT_PUBLIC_BACKEND_URL not set.
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <label className={`${full ? 'md:col-span-2' : ''}`}>
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      {children}
    </label>
  );
}