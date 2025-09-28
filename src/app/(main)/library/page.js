// app/library/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookCard from '@/components/bookCard';
import BookGrid from '@/components/BookGrid';
import Link from 'next/link';

export default function LibraryPage() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLibrary = async () => {
      const res = await fetch('/api/library');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setLibrary(data.library);
      }
      setLoading(false);
    };

    fetchLibrary();
  }, [router]);

  if (loading) {
    return <p className="text-center mt-20">Cargando tu librería...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center my-8">Mi Librería</h1>
      {library.length > 0 ? (
        <BookGrid>
          {library.map((book) => (
             <Link href={`/books/${book.id}`} key={book.id}>
              <BookCard
                name={book.name}
                author={book.author}
                editorial={book.editorial}
                genre={book.genre}
                imageUrl={book.image_url}
              />
            </Link>
          ))}
        </BookGrid>
      ) : (
        <p className="text-center text-gray-500">Aún no tienes libros en tu librería.</p>
      )}
    </div>
  );
}