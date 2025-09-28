// components/BookCard.js
import Image from 'next/image';

export default function BookCard({ name, author, editorial, genre, imageUrl }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden w-full flex flex-col">
      <div className="relative w-full h-56 bg-gray-100">
        <Image
          src={imageUrl || "/icon-256.png"} 
          alt={`Portada de ${name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight">
          {name}
        </h3>
        <p className="text-gray-600 text-sm mb-1">
          por <span className="font-medium">{author}</span>
        </p>
        <p className="text-gray-500 text-sm mb-4">
          <span className="font-medium">Editorial:</span> {editorial}
        </p>
        <div className="mt-auto pt-2">
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
            {genre}
          </span>
        </div>
      </div>
    </div>
  );
}