"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <>
      {/* Main Navigation */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <span className="text-xl font-bold text-green-800">Code to Give</span>
            </div>
            
            {/* Navigation links */}
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Home
              </Link>
              <Link href="/about-us" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                About Us
              </Link>
              <Link href="/donate" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Donate
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Login/Signup
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-700 hover:text-green-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
