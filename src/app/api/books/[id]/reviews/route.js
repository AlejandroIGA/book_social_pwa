// app/api/books/[id]/reviews/route.js
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  const { id } = context.params;

  try {
    const reviews = await query({
      query: `
        SELECT r.id, r.review, u.name as user_name
        FROM Review r
        JOIN User u ON r.id_user = u.id
        WHERE r.id_book = ?
        ORDER BY r.id DESC
      `,
      values: [id],
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener las reseñas.", error: error.message },
      { status: 500 }
    );
  }
}