// app/(main)/books/[id]/loading.js

export default function BookDetailsLoading() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Columna de la Imagen y Acciones (Esqueleto) */}
        <div className="md:col-span-1 animate-pulse">
          <div className="relative w-full h-96 rounded-lg bg-gray-300"></div>
          <div className="mt-6 h-12 w-full rounded-lg bg-gray-300"></div>
        </div>

        {/* Columna de Detalles (Esqueleto) */}
        <div className="md:col-span-2 animate-pulse">
          <div className="h-10 w-3/4 rounded-lg bg-gray-300 mb-2"></div>
          <div className="h-6 w-1/2 rounded-lg bg-gray-300 mb-8"></div>
          
          <div className="space-y-4 text-lg">
             <div className="h-5 w-1/3 rounded-lg bg-gray-300"></div>
             <div className="h-5 w-1/4 rounded-lg bg-gray-300"></div>
             <div className="pt-4 mt-4 border-t">
              <div className="h-8 w-1/2 rounded-lg bg-gray-300 mb-4"></div>
              <div className="h-5 w-full rounded-lg bg-gray-300 mb-2"></div>
              <div className="h-5 w-full rounded-lg bg-gray-300 mb-2"></div>
              <div className="h-5 w-5/6 rounded-lg bg-gray-300"></div>
             </div>
          </div>
        </div>
      </div>

       {/* Sección de Reseñas (Esqueleto) */}
       <div className="mt-12 animate-pulse">
        <div className="h-9 w-1/3 rounded-lg bg-gray-300 mb-6"></div>
        <div className="space-y-6">
          <div className="h-24 w-full rounded-lg bg-gray-300"></div>
          <div className="h-24 w-full rounded-lg bg-gray-300"></div>
        </div>
       </div>
    </div>
  );
}