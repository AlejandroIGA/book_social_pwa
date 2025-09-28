// app/api/user/avatar/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { query } from "@/lib/db";
import path from "path";
import { writeFile } from "fs/promises";

const AVATARS_PATH = "/uploads/avatars";

export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const image = formData.get("avatar");

    if (!image) {
      return NextResponse.json({ message: "No se encontró ninguna imagen." }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const filename = `user-${session.userId}-${Date.now()}.jpg`;
    const savePath = path.join(process.cwd(), `public${AVATARS_PATH}`, filename);
    
    await writeFile(savePath, buffer);
    
    const imageUrl = `${AVATARS_PATH}/${filename}`;

    await query({
      query: "UPDATE User SET avatar_url = ? WHERE id = ?",
      values: [imageUrl, session.userId],
    });

    return NextResponse.json({ message: "Avatar actualizado.", imageUrl }, { status: 200 });

  } catch (error) {
    console.error("Error al subir el avatar:", error);
    return NextResponse.json({ message: "Error en el servidor.", error: error.message }, { status: 500 });
  }
}