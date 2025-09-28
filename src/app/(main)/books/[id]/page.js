// app/books/[id]/page.js
import Image from 'next/image';
import { notFound } from 'next/navigation';
import BookActions from '@/components/BookActions';
import ReviewForm from '@/components/ReviewForm';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import SubscribeToAuthorButton from '@/components/SubscribeToAuthorButton';

async function getBookDetails(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books/${id}`);
    if (res.status === 404) notFound();
    if (!res.ok) throw new Error('Failed to fetch book details');
    const data = await res.json();
    return data.book;
}
  
async function getBookReviews(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books/${id}/reviews`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.reviews;
}

export default async function BookDetailsPage({ params }) {
  const { id } = params;
  
  const book = await getBookDetails(id);

  if (!book) {
    notFound();
  }
  
  const [session, reviews, isSubscribed] = await Promise.all([
    getSession(),
    getBookReviews(id),
    getSubscriptionStatus(book.authorId)
  ]);

async function getSubscriptionStatus(authorId) {
  const session = await getSession();
  if (!session) {
    return false;
  }

  const result = await query({
    query: "SELECT id FROM AuthorSubscription WHERE id_user = ? AND id_author = ?",
    values: [session.userId, authorId],
  });

  return result.length > 0;
}

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
            <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
                <Image
                    src="/icon-256.png"
                    alt={`Portada de ${book.name}`}
                    fill
                    className="object-cover"
                />
            </div>
            <BookActions bookId={book.id} />
        </div>

        <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-2">{book.name}</h1>

            <div className="flex items-center gap-4 mb-4">
                <p className="text-xl text-gray-600">por {book.authorName || 'Autor Desconocido'}</p>
                {session && (
                    <SubscribeToAuthorButton 
                        authorId={book.authorId} 
                        isInitiallySubscribed={isSubscribed}
                    />
                )}
            </div>
            
            <div className="space-y-4 text-lg">
                <p><span className="font-semibold">Editorial:</span> {book.editorial}</p>
                <p><span className="font-semibold">Género:</span> {book.genre}</p>
                <div className="pt-4">
                    <h2 className="text-2xl font-semibold border-b pb-2 mb-2">Reseña Editorial</h2>
                    <p className="text-gray-700 leading-relaxed">{book.editorial_review || 'No hay reseña disponible.'}</p>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold border-b pb-3 mb-6">Reseñas de Lectores</h2>
        {session && <ReviewForm bookId={book.id} />}
        <div className="mt-8">
            {reviews.length > 0 ? (
                <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-800">"{review.review}"</p>
                    <p className="text-right text-sm text-gray-500 mt-2">- {review.user_name}</p>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center mt-4">Todavía no hay reseñas para este libro.</p>
            )}
        </div>
      </div>
    </div>
  );
}