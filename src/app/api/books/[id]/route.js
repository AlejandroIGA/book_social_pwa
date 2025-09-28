import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const books = await query({
  query: `
    SELECT 
      b.id, b.name, b.genre, b.editorial, b.editorial_review,
      a.id as authorId, a.name as authorName 
    FROM Book b
    JOIN Author a ON b.id_author = a.id
    WHERE b.id = ?
  `,
  values: [id],
});

    if (books.length === 0) {
      return NextResponse.json({ message: "Libro no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ book: books[0] });
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener el libro.", error: error.message }, { status: 500 });
  }
}