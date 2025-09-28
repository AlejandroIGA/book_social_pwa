// app/api/auth/register/route.js
import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, psw } = await req.json();

    if (!name || !email || !psw) {
      return NextResponse.json(
        { message: "Todos los campos son requeridos." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(psw, 10);

    const result = await query({
      query: "INSERT INTO User (name, email, psw) VALUES (?, ?, ?)",
      values: [name, email, hashedPassword],
    });

    return NextResponse.json(
      { message: "Usuario registrado con éxito.", userId: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ message: "El email ya está registrado." }, { status: 409 });
    }
    return NextResponse.json(
      { message: "Error al registrar el usuario.", error: error.message },
      { status: 500 }
    );
  }
}