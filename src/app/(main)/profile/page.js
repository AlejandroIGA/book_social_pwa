import { getSession } from "@/lib/session";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import Image from 'next/image';
import CameraCapture from "@/components/CameraCapture";

async function getUserProfile() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const results = await query({
    query: "SELECT id, name, email, avatar_url FROM User WHERE id = ?",
    values: [session.userId],
  });

  if (results.length === 0) {
    redirect('/login');
  }

  return results[0];
}

export default async function ProfilePage() {
  const user = await getUserProfile();

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-8">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        
        <div className="relative w-32 h-32 mx-auto mb-4">
          <Image
            src={user.avatar_url || '/default-avatar.png'}
            alt={`Avatar de ${user.name}`}
            fill
            className="rounded-full object-cover border-4 border-gray-200"
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
        <p className="text-md text-gray-500 mb-8">{user.email}</p>

        <div className="mt-6 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Actualizar foto de perfil</h2>
          <CameraCapture />
        </div>
      </div>
    </div>
  );
}