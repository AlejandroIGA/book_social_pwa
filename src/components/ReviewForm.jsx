'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewForm({ bookId }) {
  const [reviewText, setReviewText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const savedDraft = localStorage.getItem(`review-draft-${bookId}`);
    if (savedDraft) {
      setReviewText(savedDraft);
    }
  }, [bookId]);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setReviewText(text);
    localStorage.setItem(`review-draft-${bookId}`, text);
  };

  function saveReviewForSync(review) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('book-pwa-db', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('review-outbox', { autoIncrement: true });
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('review-outbox', 'readwrite');
      tx.objectStore('review-outbox').add(review);
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if ('serviceWorker' in navigator && 'SyncManager' in window && !navigator.onLine) {
      try {
        const sw = await navigator.serviceWorker.ready;
        await saveReviewForSync({ bookId, reviewText });
        await sw.sync.register('sync-new-reviews');

        setMessage('Estás sin conexión. Tu reseña se publicará automáticamente cuando vuelvas a tener internet.');
        localStorage.removeItem(`review-draft-${bookId}`);
        setReviewText('');
      } catch (err) {
        setError('No se pudo guardar la reseña para el envío posterior.');
      } finally {
        setLoading(false);
      }
      return;
    }

    const res = await fetch('/api/reviews/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, reviewText }),
    });

    if (res.ok) {
        localStorage.removeItem(`review-draft-${bookId}`);
        router.refresh();
    } else {
        const data = await res.json();
        setError(data.message || 'No se pudo publicar la reseña.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Comparte tu opinión</h3>
      <textarea
        value={reviewText}
        onChange={handleTextChange} 
        required
        placeholder="Escribe tu reseña aquí..."
        className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
      />
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
      <div className="flex justify-end space-x-4 mt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </form>
  );
}

