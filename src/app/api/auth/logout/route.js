import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    cookies().set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      expires: new Date(0),
      path: '/',
    });

    return NextResponse.json({ message: 'Cierre de sesión exitoso.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error en el servidor.' }, { status: 500 });
  }
}