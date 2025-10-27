"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ApplyForm({ jobId }: { jobId: string }) {
  const { data: session } = useSession();
  const [resumeURL, setResumeURL] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!session) {
      // redirect to sign in
      window.location.href = '/api/auth/signin';
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, resumeURL, coverLetter })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to apply');
      } else {
        setMessage('Application submitted successfully');
        setResumeURL('');
        setCoverLetter('');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Apply for this job</h3>
      <label className="block mb-2">
        <span className="text-sm">Resume URL</span>
        <input
          type="url"
          value={resumeURL}
          onChange={(e) => setResumeURL(e.target.value)}
          className="mt-1 block w-full border rounded px-2 py-1"
          placeholder="https://..."
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm">Cover Letter</span>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          className="mt-1 block w-full border rounded px-2 py-1"
          rows={6}
        />
      </label>

      <div className="flex items-center space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Applying...' : 'Apply'}
        </button>
        {message && <div className="text-sm text-gray-700">{message}</div>}
      </div>
    </form>
  );
}
