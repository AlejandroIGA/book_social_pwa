// app/api/auth/login/route.js
import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { email, psw } = await req.json();

    if (!email || !psw) {
      return NextResponse.json({ message: "Email y contraseña requeridos." }, { status: 400 });
    }

    const users = await query({
      query: "SELECT id, name, email, psw FROM User WHERE email = ?",
      values: [email],
    });

    if (users.length === 0) {
      return NextResponse.json({ message: "Credenciales inválidas." }, { status: 401 });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(psw, user.psw);
    if (!passwordMatch) {
      return NextResponse.json({ message: "Credenciales inválidas." }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    cookies().set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60, // 1 hora
        path: '/',
    });

    return NextResponse.json({ message: "Login exitoso.", user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return NextResponse.json({ message: "Error en el servidor.", error: error.message }, { status: 500 });
  }
}