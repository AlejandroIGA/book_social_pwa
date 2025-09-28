import BookCard from "@/components/bookCard";
import BookGrid from "@/components/BookGrid";
import Link from 'next/link';

async function getBooks() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books`, {
    next: { revalidate: 3600 } 
  });

  if (!res.ok) {
    throw new Error('Failed to fetch books');
  }
  const data = await res.json();
  console.log(data);
  return data.books;
}

export default async function Home() {
  const books = await getBooks();

  return (
    <div>
      <h1 className="text-3xl font-bold text-center my-8">Descubre Nuevos Libros</h1>
      <BookGrid>
        {books.map((book) => (
          <Link href={`/books/${book.id}`} key={book.id}>
            <BookCard 
              name={book.name}
              author={book.authorName}
              editorial={book.editorial}
              genre={book.genre}
              // Asumimos que la columna en la BD se llama 'image_url'
              imageUrl={book.image_url} 
            />
          </Link>
        ))}
      </BookGrid>
    </div>
  );
}