import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import webPush from "web-push";

async function sendAuthorNotifications(authorId, bookName) {
  try {
    console.log(`[NOTIFY] Iniciando proceso para autor ID: ${authorId}`);

    const followers = await query({
      query: "SELECT id_user FROM UserAuthorFollow WHERE id_author = ?",
      values: [authorId],
    });

    if (followers.length === 0) {
      console.log("[NOTIFY] No hay seguidores para este autor. Proceso finalizado.");
      return;
    }

    const followerIds = followers.map(f => f.id_user);
    console.log(`[NOTIFY] IDs de seguidores encontrados: ${followerIds.join(', ')}`);

    const placeholders = followerIds.map(() => '?').join(',');

    const subscriptionsQuery = `
      SELECT endpoint, p256dh, auth 
      FROM devicesubscription 
      WHERE id_user IN (${placeholders})
    `;
      
    const subscriptions = await query({
      query: subscriptionsQuery,
      values: followerIds,
    });

    if (subscriptions.length === 0) {
        console.log("[NOTIFY] Los seguidores no tienen dispositivos registrados. Proceso finalizado.");
        return;
    }
    console.log(`[NOTIFY] Se encontraron ${subscriptions.length} dispositivos para notificar.`);

    const authorResult = await query({ query: "SELECT name FROM Author WHERE id = ?", values: [authorId] });
    const authorName = authorResult.length > 0 ? authorResult[0].name : 'Autor Desconocido';

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