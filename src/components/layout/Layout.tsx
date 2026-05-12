import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingChat from '../chat/FloatingChat';

export default function Layout() {
  return (
    <div className="min-h-screen w-full bg-[#FFFBFB] flex flex-col font-sans text-[#1D3557] overflow-x-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col items-center w-full relative">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col flex-1 relative z-10">
          <Outlet />
        </div>
      </main>
      <Footer />
      <FloatingChat />
    </div>
  );
}
