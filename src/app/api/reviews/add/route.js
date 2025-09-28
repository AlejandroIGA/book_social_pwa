// app/api/reviews/add/route.js
import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: "Necesitas iniciar sesión para dejar una reseña." }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { bookId, reviewText } = await req.json();
    if (!bookId || !reviewText) {
      return NextResponse.json({ message: "Faltan datos para crear la reseña." }, { status: 400 });
    }

    const result = await query({
      query: "INSERT INTO Review (id_book, id_user, review) VALUES (?, ?, ?)",
      values: [bookId, userId, reviewText],
    });

    return NextResponse.json({ message: "Reseña añadida con éxito.", reviewId: result.insertId }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "Error en el servidor.", error: error.message }, { status: 500 });
  }
}