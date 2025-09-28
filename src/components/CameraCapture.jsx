'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function CameraCapture() {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [message, setMessage] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const openCamera = useCallback(async () => {
    setMessage('');
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream); 
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setMessage("No se pudo acceder a la cámara. Revisa los permisos.");
    }
  }, []);

  const closeCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const takePicture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob(blob => {
        setCapturedImage(blob);
        closeCamera();
      }, 'image/jpeg');
    }
  };

  const uploadImage = async () => {
    if (!capturedImage) return;
    setMessage('Subiendo imagen...');
    
    const formData = new FormData();
    formData.append('avatar', capturedImage, 'avatar.jpg');

    const res = await fetch('/api/user/avatar', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('¡Foto de perfil actualizada!');
      window.location.reload(); 
    } else {
      setMessage(`Error: ${data.message}`);
    }
  };
  
  if (capturedImage) {
    return (
      <div className="text-center">
        <h3 className="font-semibold mb-2">Vista Previa</h3>
        <Image src={URL.createObjectURL(capturedImage)} alt="Captura" width={320} height={240} className="rounded-lg mx-auto" />
        <div className="flex justify-center gap-4 mt-4">
          <button onClick={uploadImage} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Subir Foto</button>
          <button onClick={openCamera} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Tomar Otra</button>
        </div>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>
    );
  }

  if (stream) {
    return (
      <div className="text-center">
        <video ref={videoRef} autoPlay playsInline muted className="rounded-lg w-full max-w-sm mx-auto"></video>
        <div className="flex justify-center gap-4 mt-4">
          
          <button 
            onClick={takePicture} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Capturar
          </button>
          
          <button onClick={closeCamera} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <button onClick={openCamera} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Cambiar Foto de Perfil
      </button>
      {message && <p className="mt-2 text-sm text-red-500">{message}</p>}
    </div>
  );
}