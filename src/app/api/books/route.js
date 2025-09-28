// app/api/books/route.js
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const books = await query({
      query: `
        SELECT 
          b.id, b.name, b.genre, b.editorial, b.editorial_review,
          a.id as authorId, 
          a.name as authorName 
        FROM Book b
        LEFT JOIN Author a ON b.id_author = a.id
      `
    });

    return NextResponse.json({ books });
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener los libros.", error: error.message }, { status: 500 });
  }
}