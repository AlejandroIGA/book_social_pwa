import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: "No autorizado: Inicia sesión para ver tu librería." }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ message: "No autorizado: Token inválido o expirado." }, { status: 401 });
    }

    const userId = decoded.userId;

    const libraryBooks = await query({
      query: `
        SELECT 
          b.id, b.name, b.author, b.genre, b.editorial,
          l.start_date, l.finish_date 
        FROM Library l
        JOIN Book b ON l.id_book = b.id
        WHERE l.id_user = ?
      `,
      values: [userId],
    });

    return NextResponse.json({ library: libraryBooks });
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener la librería.", error: error.message }, { status: 500 });
  }
}