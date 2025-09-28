import { getSession } from "@/lib/session";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const { bookId } = await req.json();
    if (!bookId) {
      return NextResponse.json({ message: "Falta el ID del libro." }, { status: 400 });
    }

    await query({
      query: "DELETE FROM Library WHERE id_user = ? AND id_book = ?",
      values: [session.userId, bookId],
    });

    return NextResponse.json({ message: "Libro eliminado de tu librería." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error al eliminar el libro.", error: error.message }, { status: 500 });
  }
}