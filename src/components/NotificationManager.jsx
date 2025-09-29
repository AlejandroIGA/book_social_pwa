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

export default function NotificationManager() {
  const [currentState, setCurrentState] = useState('loading'); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setCurrentState('unsupported');
        return;
      }
      
      if (Notification.permission === 'denied') {
        setCurrentState('denied');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        setCurrentState('enabled');
      } else {
        setCurrentState('disabled');
      }
    };

    checkSubscriptionStatus();
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });

      await fetch('/api/subscriptions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }), 
      });

      setCurrentState('enabled');
    } catch (error) {
      console.error('Error al suscribirse:', error);
      if (Notification.permission === 'denied') {
        setCurrentState('denied');
      }
    }
    setLoading(false);
  };
  
  const handleDisable = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await fetch('/api/subscriptions/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setCurrentState('disabled');
    } catch (error) {
      console.error('Error al desuscribirse:', error);
    }
    setLoading(false);
  };

  switch (currentState) {
    case 'loading':
      return <p className="text-sm text-gray-500">Comprobando estado...</p>;
    case 'enabled':
      return (
        <div>
          <p className="text-green-600 mb-2">✅ Las notificaciones están activadas en este dispositivo.</p>
          <button onClick={handleDisable} disabled={loading} className="text-sm text-red-500 hover:underline">
            {loading ? 'Procesando...' : 'Desactivar'}
          </button>
        </div>
      );
    case 'denied':
      return <p className="text-red-600 text-sm">Has bloqueado las notificaciones. Debes activarlas en los ajustes de tu navegador.</p>;
    case 'unsupported':
        return <p className="text-gray-500 text-sm">Este navegador no es compatible con notificaciones push.</p>;
    case 'disabled':
    default:
      return (
        <div>
           <p className="text-gray-600 mb-2">Recibe alertas cuando tus autores favoritos publiquen nuevos libros.</p>
          <button onClick={handleEnable} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
             {loading ? 'Procesando...' : 'Activar Notificaciones'}
          </button>
        </div>
      );
  }
}