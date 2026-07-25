import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingChat from '../../features/chat/components/FloatingChat';

export default function Layout() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-[#1B2C40] overflow-x-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col w-full relative z-10">
        <Outlet />
      </main>
      <Footer />
      <FloatingChat />
    </div>
  );
}
