"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FaInstagram, FaTiktok, FaFacebook } from "react-icons/fa6";
import NewButton from "./NewButton";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function validateEmail(value: string) {
    return /^(?:[a-zA-Z0-9_'^&\/+-])+(?:\.(?:[a-zA-Z0-9_'^&\/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(
      value
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const nick = (formData.get("nickname") as string) || ""; // honeypot
    const emailVal = (formData.get("email") as string) || "";

    if (!nick && validateEmail(emailVal)) {
      console.log("Contact form submitted:", { email: emailVal }); // swap for API later
      setStatus("success");
      setMessage("Thanks! We'll be in touch shortly.");
      setEmail("");
      form.reset();
    } else {
      setStatus("error");
      setMessage(nick ? "Submission received." : "Please enter a valid email.");
    }
  }

  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700">
      {/* Signup bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 md:grid-cols-3 items-center rounded-2xl bg-green-50 p-6 sm:p-8 border border-green-100">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Have any questions?
              </h2>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              We'll love to get in touch!
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate aria-label="Contact form" className="w-full md:justify-self-end">
            {/* Honeypot */}
            <input
              type="text"
              name="nickname"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.org"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
                aria-invalid={status === "error" && !validateEmail(email)}
                aria-describedby="email-help"
              />
              <NewButton
              >
                Join
              </NewButton>
            </div>
            <p id="email-help" className="mt-2 text-xs text-gray-500">
              We only email about Project REACH. Unsubscribe anytime.
            </p>
            {status !== "idle" && (
              <div
                role={status === "error" ? "alert" : undefined}
                className={`mt-3 text-sm ${status === "success" ? "text-green-700" : "text-red-600"}`}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand & social to mirror Navbar */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <img src="/projectreach.png" alt="Project REACH" className="h-10 w-auto" />
              <span className="sr-only">Project REACH</span>
            </Link>
            <p className="mt-3 text-sm text-gray-600 max-w-xs">
            Closing the academic gap for underserved kindergarten students in Hong Kong
            </p>
            {/* Socials — same icons & sizing as Navbar for cohesion */}
            <div className="mt-4 flex space-x-6 text-gray-600">
              <Link href="#" aria-label="Instagram" className="hover:text-pink-600 transition-colors">
                <FaInstagram size={28} />
              </Link>
              <Link href="#" aria-label="TikTok" className="hover:text-black transition-colors">
                <FaTiktok size={28} />
              </Link>
              <Link href="#" aria-label="Facebook" className="hover:text-blue-600 transition-colors">
                <FaFacebook size={28} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Organization</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link className="hover:text-green-600" href="/about-us">About Us</Link></li>
              <li><Link className="hover:text-green-600" href="/stories">Our Stories</Link></li>
              <li><Link className="hover:text-green-600" href="/impact">Impact</Link></li>
              <li><Link className="hover:text-green-600" href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Get Involved</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link className="hover:text-green-600" href="/donate">Donate</Link></li>
              <li><Link className="hover:text-green-600" href="/volunteer">Volunteer</Link></li>
              <li><Link className="hover:text-green-600" href="/partners">Partners</Link></li>
              <li><Link className="hover:text-green-600" href="/events">Events</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link className="hover:text-green-600" href="/privacy">Privacy Policy</Link></li>
              <li><Link className="hover:text-green-600" href="/terms">Terms of Use</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Project REACH. All rights reserved.</p>
          <div className="text-xs text-gray-500">
            <span>Built with ❤️ for education.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
