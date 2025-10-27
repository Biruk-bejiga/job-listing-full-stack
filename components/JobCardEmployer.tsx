"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import EditJobModal from './EditJobModal';
import ConfirmDialog from './ConfirmDialog';

export default function JobCardEmployer({ job }: any) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const router = useRouter();

  return (
    <div className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h3 className="text-lg font-semibold">{job.title}</h3>
        <div className="text-sm text-gray-600">{job.company} • {job.location}</div>
        <div className="text-sm text-gray-500 mt-2">Posted {formatDistanceToNow(new Date(job.createdAt))} ago</div>
      </div>
      <div className="mt-4 md:mt-0 flex items-center space-x-2">
        <button onClick={() => setOpenEdit(true)} className="px-3 py-1 bg-yellow-400 text-black rounded">Edit</button>
        <button onClick={() => setOpenConfirm(true)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
      </div>

      <EditJobModal job={job} open={openEdit} onClose={() => setOpenEdit(false)} onUpdated={() => router.refresh()} />
      <ConfirmDialog open={openConfirm} title="Delete job" description="Are you sure you want to delete this job? This action cannot be undone." onClose={() => setOpenConfirm(false)} onConfirm={async () => {
        // Call API to delete and refresh
        try {
          const res = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
          if (res.ok) {
            setOpenConfirm(false);
            router.refresh();
          } else {
            console.error('Failed to delete');
          }
        } catch (e) {
          console.error(e);
        }
      }} />
    </div>
  );
}
