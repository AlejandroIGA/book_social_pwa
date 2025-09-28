// app/api/subscriptions/delete/route.js
import { getSession } from "@/lib/session";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { authorId } = await req.json();
    if (!authorId) {
      return NextResponse.json({ message: "Falta el ID del autor." }, { status: 400 });
    }

    await query({
      query: "DELETE FROM AuthorSubscription WHERE id_user = ? AND id_author = ?",
      values: [session.userId, authorId],
    });

    return NextResponse.json({ message: "Suscripción eliminada." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error al eliminar la suscripción.", error: error.message }, { status: 500 });
  }
}