// app/api/books/add/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import webPush from "web-push";

// --- VERSIÓN FINAL DE LA FUNCIÓN DE NOTIFICACIONES ---
async function sendAuthorNotifications(authorId, bookName) {
  try {
    console.log(`[NOTIFY] Iniciando proceso para autor ID: ${authorId}`);

    // -> 1. Busca todos los USUARIOS que siguen a este autor.
    const followers = await query({
      query: "SELECT id_user FROM UserAuthorFollow WHERE id_author = ?",
      values: [authorId],
    });

    if (followers.length === 0) {
      console.log("[NOTIFY] No hay seguidores para este autor. Proceso finalizado.");
      return;
    }

    // -> 2. Extrae los IDs de los seguidores en un array (ej: [1, 5, 12])
    const followerIds = followers.map(f => f.id_user);
    console.log(`[NOTIFY] IDs de seguidores encontrados: ${followerIds.join(', ')}`);

    const placeholders = followerIds.map(() => '?').join(',');

    const subscriptionsQuery = `
      SELECT endpoint, p256dh, auth 
      FROM devicesubscription 
      WHERE id_user IN (${placeholders})
    `;
      
    // -> 3. Busca todos los DISPOSITIVOS registrados de esos seguidores.
    // La consulta `IN (?)` permite buscar múltiples IDs a la vez.
    const subscriptions = await query({
      query: subscriptionsQuery,
      values: followerIds,
    });

    if (subscriptions.length === 0) {
        console.log("[NOTIFY] Los seguidores no tienen dispositivos registrados. Proceso finalizado.");
        return;
    }
    console.log(`[NOTIFY] Se encontraron ${subscriptions.length} dispositivos para notificar.`);

    // Obtenemos el nombre del autor para el mensaje
    const authorResult = await query({ query: "SELECT name FROM Author WHERE id = ?", values: [authorId] });
    const authorName = authorResult.length > 0 ? authorResult[0].name : 'Autor Desconocido';

    // -> 4. Envía la notificación a cada dispositivo encontrado.
    webPush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const payload = JSON.stringify({
      title: `¡Nuevo libro de ${authorName}!`,
      body: `Ya está disponible "${bookName}", la nueva obra de tu autor favorito.`,
    });

    const promises = subscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      return webPush.sendNotification(pushSubscription, payload).catch(error => {
        console.error(`[NOTIFY] Error enviando notificación:`, error.statusCode);
      });
    });
    
    await Promise.all(promises);
    console.log("[NOTIFY] Proceso de envío de notificaciones finalizado.");

  } catch (pushError) {
    console.error("[NOTIFY] Error CRÍTICO en el proceso de enviar notificaciones:", pushError);
  }
}

// --- API POST (con la llamada correcta) ---
export async function POST(req) {
  try {
    const { name, authorId, genre, editorial, editorial_review } = await req.json();

    if (!name || !authorId) {
      return NextResponse.json({ message: "Faltan datos requeridos (name, authorId)." }, { status: 400 });
    }

    const result = await query({
      query: `
        INSERT INTO Book (name, id_author, genre, editorial, editorial_review) 
        VALUES (?, ?, ?, ?, ?)
      `,
      values: [name, authorId, genre, editorial, editorial_review],
    });

    // La llamada no necesita cambiar, la lógica interna de la función es la que mejoró.
    sendAuthorNotifications(authorId, name);

    return NextResponse.json(
      { message: "Libro añadido con éxito.", bookId: result.insertId },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error al añadir el libro:", error);
    return NextResponse.json({ message: "Error en el servidor.", error: error.message }, { status: 500 });
  }
}