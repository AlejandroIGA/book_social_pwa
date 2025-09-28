// lib/session.js
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function getSession() {
  const token = cookies().get('token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; 
  } catch (error) {
    return null;
  }
}