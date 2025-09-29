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
      query: "INSERT INTO UserAuthorFollow (id_user, id_author) VALUES (?, ?)",
      values: [session.userId, authorId],
    });

    return NextResponse.json({ message: "Ahora sigues a este autor." }, { status: 201 });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ message: "Ya sigues a este autor." }, { status: 200 });
    }
    return NextResponse.json({ message: "Error al seguir al autor.", error: error.message }, { status: 500 });
  }
}