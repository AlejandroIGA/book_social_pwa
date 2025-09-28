import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const books = await query({
      query: "SELECT * FROM Book",
    });

    return NextResponse.json({ books });
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener los libros.", error: error.message }, { status: 500 });
  }
}