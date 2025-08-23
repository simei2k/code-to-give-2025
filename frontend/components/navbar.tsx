"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { FaInstagram, FaTiktok, FaFacebook } from "react-icons/fa6";
import NewButton from "./NewButton";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo + Social Media */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <img
                  src="/projectreach.png"
                  alt="Project REACH"
                  className="h-10 w-auto"
                />
              </Link>

              {/* Social Media Icons */}
              <div className="flex space-x-6 ml-8 text-gray-600">
                <Link
                  href="#"
                  aria-label="Instagram"
                  className="hover:text-pink-600 transition-colors"
                >
                  <FaInstagram size={28} />
                </Link>
                <Link
                  href="#"
                  aria-label="TikTok"
                  className="hover:text-black transition-colors"
                >
                  <FaTiktok size={28} />
                </Link>
                <Link
                  href="#"
                  aria-label="Facebook"
                  className="hover:text-blue-600 transition-colors"
                >
                  <FaFacebook size={28} />
                </Link>
              </div>
            </div>
            
            {/* Navigation links */}
            <div className="hidden md:flex space-x-8 md:items-center">
              {user && (
                <Link href="/donor-home" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                  Profile
                </Link>
              )}
              <Link href="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Home
              </Link>
              <Link href="/about-us" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                About Us
              </Link>
              <Link href="/stories" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Stories
              </Link>
              <Link href="/donate" className="text-gray-700 hover:text-green-600 font-medium transition-colors mb-1">
                <NewButton>
                  Donate
                </NewButton>
              </Link>
              {!user ? (
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  Login/Signup
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer"
                >
                  Logout
                </button>
              )}
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