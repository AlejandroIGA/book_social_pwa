import { getSession } from "@/lib/session";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { subscription, authorId } = await req.json();
    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    await query({
      query: `
        INSERT INTO AuthorSubscription (id_user, id_author, endpoint, p256dh, auth)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE endpoint = VALUES(endpoint), p256dh = VALUES(p256dh), auth = VALUES(auth)
      `,
      values: [session.userId, authorId, endpoint, p256dh, auth],
    });

    return NextResponse.json({ message: "Suscripción guardada con éxito." }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "Error al guardar la suscripción.", error: error.message }, { status: 500 });
  }
}