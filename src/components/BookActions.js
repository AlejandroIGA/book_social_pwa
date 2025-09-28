// components/BookActions.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookActions({ bookId, isInitiallyInLibrary }) {
  // 1. El estado ahora se inicializa con el valor que viene del servidor
  const [isInLibrary, setIsInLibrary] = useState(isInitiallyInLibrary);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 2. Lógica para AÑADIR (ya la tenías)
  const handleAdd = async () => {
    setLoading(true);
    const res = await fetch('/api/library/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId }),
    });
    if (res.status === 401) return router.push('/login');
    if (res.ok) setIsInLibrary(true); // Cambiamos el estado
    setLoading(false);
  };

  // 3. NUEVA lógica para ELIMINAR
  const handleRemove = async () => {
    setLoading(true);
    const res = await fetch('/api/library/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId }),
    });
    if (res.status === 401) return router.push('/login');
    if (res.ok) setIsInLibrary(false); // Cambiamos el estado
    setLoading(false);
  };

  // 4. Variables dinámicas para el botón
  const buttonText = isInLibrary ? '✓ En mi librería' : '+ Añadir a mi Librería';
  const buttonAction = isInLibrary ? handleRemove : handleAdd;
  const buttonClass = isInLibrary
    ? 'bg-green-600 hover:bg-green-700'
    : 'bg-blue-600 hover:bg-blue-700';

  return (
    <div className="mt-6">
      <button
        onClick={buttonAction}
        disabled={loading}
        className={`w-full px-6 py-3 text-white rounded-lg transition-colors disabled:opacity-50 ${buttonClass}`}
      >
        {loading ? 'Procesando...' : buttonText}
      </button>
    </div>
  );
}