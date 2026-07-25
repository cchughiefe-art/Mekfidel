'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
        },
        success: {
          style: {
            background: '#059669',
            color: 'white',
          },
        },
        error: {
          style: {
            background: '#dc2626',
            color: 'white',
          },
        },
      }}
    />
  );
}

