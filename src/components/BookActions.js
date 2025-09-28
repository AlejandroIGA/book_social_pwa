// components/BookActions.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookActions({ bookId }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddClick = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    const res = await fetch('/api/library/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId }),
    });

    if (res.status === 401) {
      router.push('/login');
      return;
    }

    const data = await res.json();

    if (res.ok) {
      setMessage(data.message);
    } else {
      setError(data.message || 'No se pudo añadir el libro.');
    }
    setLoading(false);
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleAddClick}
        disabled={loading}
        className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
      >
        {loading ? 'Añadiendo...' : 'Añadir a mi Librería'}
      </button>
      {message && <p className="text-green-600 text-sm mt-2 text-center">{message}</p>}
      {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
    </div>
  );
}