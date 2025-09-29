// components/FollowAuthorButton.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FollowAuthorButton({ authorId, isInitiallyFollowing }) {
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFollow = async () => {
    setLoading(true);
    const res = await fetch('/api/authors/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId }),
    });
    // Si el usuario no tiene sesión, lo redirigimos a login
    if (res.status === 401) return router.push('/login');
    if (res.ok) setIsFollowing(true); // Actualizamos el estado a "Siguiendo"
    setLoading(false);
  };

  const handleUnfollow = async () => {
    setLoading(true);
    const res = await fetch('/api/authors/unfollow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId }),
    });
    if (res.status === 401) return router.push('/login');
    if (res.ok) setIsFollowing(false); // Actualizamos el estado a "Seguir"
    setLoading(false);
  };

  // Variables dinámicas para el estilo y la acción del botón
  const buttonText = isFollowing ? '✓ Siguiendo' : '+ Seguir';
  const buttonAction = isFollowing ? handleUnfollow : handleFollow;
  const buttonClass = isFollowing
    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
    : 'bg-blue-600 text-white hover:bg-blue-700';
    
  return (
    <button
      onClick={buttonAction}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm ${buttonClass}`}
    >
      {loading ? '...' : buttonText}
    </button>
  );
}