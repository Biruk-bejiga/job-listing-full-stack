"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditJobModal({ job, open, onClose, onUpdated }: any) {
  const [title, setTitle] = useState(job?.title || '');
  const [company, setCompany] = useState(job?.company || '');
  const [location, setLocation] = useState(job?.location || '');
  const [description, setDescription] = useState(job?.description || '');
  const [salary, setSalary] = useState(job?.salary || '');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setTitle(job?.title || '');
    setCompany(job?.company || '');
    setLocation(job?.location || '');
    setDescription(job?.description || '');
    setSalary(job?.salary || '');
  }, [job]);

  if (!open) return null;

  const router = useRouter();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company, location, description, salary })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdated && onUpdated(data);
        onClose();
        // refresh the page so the updated job shows
        router.refresh();
      } else {
        const err = await res.json();
        console.error(err);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded max-w-xl w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Edit Job</h3>
        <form onSubmit={handleSave} className="space-y-3">
          <input className="w-full border px-2 py-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <input className="w-full border px-2 py-1" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" />
          <input className="w-full border px-2 py-1" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
          <textarea className="w-full border px-2 py-1" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={6} />
          <input className="w-full border px-2 py-1" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Salary" />

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
