"use client";

import React from 'react';

export default function ConfirmDialog({ open, title, description, onClose, onConfirm }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded max-w-md w-full p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
        </div>
      </div>
    </div>
  );
}
