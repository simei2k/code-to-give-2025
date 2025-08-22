"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-primary hover:bg-brand-dark shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Navigation links aligned to the right */}
          <div className="hidden md:flex space-x-6 ml-auto">
            <Link href="/" className="hover:text-secondary">Home</Link>
            <Link href="/about-us" className="hover:text-secondary">About Us</Link>
            <Link href="/donate" className="hover:text-secondary">Donate</Link>
            <Link href="/login" className="hover:text-secondary">Login/Signup</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
