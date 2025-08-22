// /pages/api/signup.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { displayName, email, password } = req.body;

      console.log("Received request body:", req.body);

      if (!email || !password || !displayName) {
        console.log("Error: Missing required fields");
        return res.status(400).json({ error: "DisplayName, email, and password are required" });
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: displayName,
        });

        console.log("User created in Firebase Authentication:", user);

        const userRef = doc(db, "donors", user.uid);
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          badges: [],
          totalDonated: 0,
          createdAt: new Date(),
        });

        const token = await user.getIdToken();

        return res.status(200).json({
          uid: user.uid,
          email: user.email,
          token,
          displayName: user.displayName,
        });
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          console.error("Email is already in use:", error.message);
          return res.status(400).json({ error: "Email is already in use" });
        }

        console.error("Error during signup:", error.message);
        return res.status(500).json({ error: "An unknown error occurred" });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: error.message });
      } else {
        console.error("Unknown error:", error);
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
