"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export default function DonorHomePage() {
  const [user] = useAuthState(auth);

  console.log({user});

  return (
    <>
      <main className="pt-20">
        <h1 className="text-3xl font-bold text-center">DONOR HOME</h1>
      </main>
    </>
  );
}
