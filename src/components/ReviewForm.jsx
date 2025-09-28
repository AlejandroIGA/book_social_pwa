// components/ReviewForm.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewForm({ bookId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const res = await fetch('/api/reviews/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, reviewText }),
    });

    if (res.status === 401) {
      router.push('/login');
      return;
    }

    const data = await res.json();

    if (res.ok) {
      setMessage('¡Reseña publicada! Refrescando la página...');
      setReviewText('');
      setIsOpen(false);
      router.refresh(); 
    } else {
      setError(data.message || 'No se pudo publicar la reseña.');
    }
    setLoading(false);
  };

  return (
    <div className="mt-8">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          Escribir una Reseña
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Comparte tu opinión</h3>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            placeholder="Escribe tu reseña aquí..."
            className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          />
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}