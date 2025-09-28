'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Menu({ session }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh(); 
  };

  const navLinks = [
    { name: 'Inicio', href: '/' },
    ...(session ? [{ name: 'Mi Librería', href: '/library' }, { name: 'Mi Perfil', href: '/profile' }] : []),
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex space-x-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-gray-600 hover:text-blue-600 transition-colors ${
                  isActive ? 'font-bold text-blue-600' : ''
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div>
          {session ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}