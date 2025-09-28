import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";
import webPush from "web-push";

async function sendAuthorNotifications(authorId, bookName, authorName) {
  try {
    const subscriptions = await query({
      query: "SELECT endpoint, p256dh, auth FROM AuthorSubscription WHERE id_author = ?",
      values: [authorId],
    });

    if (subscriptions.length === 0) return;

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
        console.error(`Error enviando notificación:`, error.statusCode);
      });
    });
    
    await Promise.all(promises);
  } catch (pushError) {
    console.error("Error en el proceso de enviar notificaciones:", pushError);
  }
}

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { name, authorId, genre, editorial, editorial_review } = await req.json();

    if (!name || !authorId || !authorName) {
      return NextResponse.json({ message: "Faltan datos requeridos." }, { status: 400 });
    }

    const result = await query({
  query: `
    INSERT INTO Book (name, id_author, genre, editorial, editorial_review) 
    VALUES (?, ?, ?, ?, ?)
  `,
  values: [name, authorId, genre, editorial, editorial_review],
});

    sendAuthorNotifications(authorId, name, authorName);

    return NextResponse.json(
      { message: "Libro añadido con éxito.", bookId: result.insertId },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error al añadir el libro:", error);
    return NextResponse.json({ message: "Error en el servidor.", error: error.message }, { status: 500 });
  }
}