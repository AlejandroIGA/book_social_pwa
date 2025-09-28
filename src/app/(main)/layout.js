import Header from "@/components/Header";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/session"; 

export default async function MainLayout({ children }) {
  const session = await getSession();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Menu session={session} />
      <main className="flex-grow overflow-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
}