
import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
