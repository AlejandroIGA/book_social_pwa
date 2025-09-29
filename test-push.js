// test-push.js

// Carga las variables de entorno de tu archivo .env.local
require('dotenv').config({ path: './.env.local' });

const webPush = require('web-push');

// ------------------------------------------------------------------
// PEGA AQUÍ EL OBJETO DE LA SUSCRIPCIÓN DE LA CONSOLA DE TU NAVEGADOR
const a_subscription_object = {"endpoint":"https://fcm.googleapis.com/fcm/send/dhag3Olf_qw:APA91bGFmLlDLr8K_tDyBoX-3bN_1h92jixGsDhLe5OkDIKwv24GHIaQkGmTfEVazk37-9Isz1lUCvi28pfNx9eJDQrbjp38WW2BaE6USEDtVzkYpJUHp8ZFvqqumjkO8Oh7B_ptpsDs","expirationTime":null,"keys":{"p256dh":"BMmiSSeZ4VN4QZLQEHrIOO0Fq5ZdVXmJllNY1z1q1n6RoLRK6ULqSLNnvxkUK--0lkIWGt2YoaqF_QQBU_6pvTo","auth":"OaaHgBrd6t-P-0eAMtn-fw"}}
// ------------------------------------------------------------------


// Lee tus claves VAPID del archivo .env.local
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error("Error: Asegúrate de que las claves VAPID están en tu archivo .env.local");
  return;
}

webPush.setVapidDetails(
  'mailto:tuemail@dominio.com', // Reemplaza con tu email
  vapidPublicKey,
  vapidPrivateKey
);

console.log("Enviando notificación de prueba...");

const payload = JSON.stringify({
  title: 'Prueba desde Script Local',
  body: 'Si ves esto, ¡la suscripción y las claves funcionan!',
});

webPush.sendNotification(a_subscription_object, payload)
  .then(res => {
    console.log("✅ Notificación enviada con éxito. Código de estado:", res.statusCode);
  })
  .catch(err => {
    console.error("❌ Error al enviar la notificación:", err);
    console.error("Código de estado:", err.statusCode);
    console.error("Cuerpo del error:", err.body);
  });