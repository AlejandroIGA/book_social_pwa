import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { bookId } = await req.json();
    if (!bookId) {
      return NextResponse.json({ message: "El ID del libro es requerido." }, { status: 400 });
    }
    
    const result = await query({
        query: "INSERT INTO Library (id_book, id_user, start_date) VALUES (?, ?, CURDATE())",
        values: [bookId, userId],
    });

    return NextResponse.json({ message: "Libro añadido a tu librería.", id: result.insertId }, { status: 201 });
  
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ message: "Este libro ya está en tu librería." }, { status: 409 });
    }
    return NextResponse.json({ message: "Error en el servidor.", error: error.message }, { status: 500 });
  }
}