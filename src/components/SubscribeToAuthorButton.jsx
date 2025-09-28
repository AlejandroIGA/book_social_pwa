'use client';

import { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
  

export default function SubscribeToAuthorButton({ authorId, isInitiallySubscribed }) {
  const [isSubscribed, setIsSubscribed] = useState(isInitiallySubscribed);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    setMessage('');
    
    if (permissionStatus === 'denied') {
        setMessage('No se puede suscribir. Permiso de notificaciones denegado.');
        setLoading(false);
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        setMessage('Permiso no concedido.');
        setLoading(false);
        return;
    }
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    });

    await fetch('/api/subscriptions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, authorId }),
    });

    setIsSubscribed(true);
    setLoading(false);
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setMessage('');
    await fetch('/api/subscriptions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId }),
    });
    setIsSubscribed(false);
    setLoading(false);
  };

  const buttonText = isSubscribed ? 'Dejar de seguir' : 'Seguir a este autor';
  const buttonAction = isSubscribed ? handleUnsubscribe : handleSubscribe;
  const buttonClass = isSubscribed ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-600 hover:bg-blue-700";

  return (
    <div>
      <button 
        onClick={buttonAction} 
        disabled={loading || permissionStatus === 'denied'}
        className={`px-4 py-2 text-white rounded transition-colors disabled:opacity-50 ${buttonClass}`}
      >
        {loading ? 'Procesando...' : buttonText}
      </button>
      {message && <p className="text-sm mt-2 text-center">{message}</p>}
    </div>
  );
}