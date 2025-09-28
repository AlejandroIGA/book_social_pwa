export default function BookGrid({children}){
    return(
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 auto-rows-fr">
            {children}
        </div>
    )
}