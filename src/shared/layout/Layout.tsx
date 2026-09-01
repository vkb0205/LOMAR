import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-[#1B2C40]">
      <Navbar />
      <main className="flex-1 flex flex-col w-full relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
