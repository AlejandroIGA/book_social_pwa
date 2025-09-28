// app/api/subscriptions/status/route.js
import { getSession } from "@/lib/session";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ isSubscribed: false, msg: "no session created" });
  }
  
  const { searchParams } = new URL(req.url);
  const authorId = searchParams.get('authorId');

  if (!authorId) {
    return NextResponse.json({ message: "Falta el ID del autor." }, { status: 400 });
  }

  const result = await query({
    query: "SELECT id FROM AuthorSubscription WHERE id_user = ? AND id_author = ?",
    values: [session.userId, authorId],
  });

  return NextResponse.json({ isSubscribed: result.length > 0 });
}