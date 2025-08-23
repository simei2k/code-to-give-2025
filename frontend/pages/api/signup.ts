// /pages/api/signup.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Signup API called with method:", req.method);

  if (req.method === "POST") {
    try {
      // Check if Firebase is properly initialized
      if (!firebaseApp) {
        console.error("Firebase app not initialized");
        return res.status(500).json({ error: "Firebase configuration error" });
      }

      const auth = getAuth(firebaseApp);
      const db = getFirestore(firebaseApp);
      const { displayName, email, password } = req.body;

      console.log("Received signup request:", { 
        displayName: displayName ? "provided" : "missing",
        email: email ? "provided" : "missing", 
        password: password ? "provided" : "missing" 
      });

      // Validate required fields
      if (!email || !password || !displayName) {
        console.log("Error: Missing required fields");
        return res.status(400).json({ error: "Display name, email, and password are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      // Validate display name
      if (displayName.trim().length < 2) {
        return res.status(400).json({ error: "Display name must be at least 2 characters long" });
      }

      try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile with display name
        await updateProfile(user, {
          displayName: displayName.trim(),
        });

        console.log("User created in Firebase Authentication:", user.uid);

        // Create user document in Firestore
        const userRef = doc(db, "donors", user.uid);
        await setDoc(userRef, {
          displayName: displayName.trim(),
          email: user.email,
          badges: [],
          totalDonated: 0,
          createdAt: new Date(),
          lastLogin: new Date(),
        });

        console.log("User document created in Firestore");

        // Get user token
        const token = await user.getIdToken();

        return res.status(201).json({
          uid: user.uid,
          email: user.email,
          token,
          displayName: user.displayName,
          message: "Account created successfully"
        });

      } catch (firebaseError: any) {
        console.error("Firebase error during signup:", firebaseError.message);

        // Handle specific Firebase auth errors
        if (firebaseError.code === "auth/email-already-in-use") {
          return res.status(409).json({ error: "An account with this email already exists" });
        } else if (firebaseError.code === "auth/weak-password") {
          return res.status(400).json({ error: "Password is too weak. Please choose a stronger password." });
        } else if (firebaseError.code === "auth/invalid-email") {
          return res.status(400).json({ error: "Invalid email address format" });
        } else if (firebaseError.code === "auth/operation-not-allowed") {
          return res.status(503).json({ error: "Email/password accounts are not enabled. Please contact support." });
        } else {
          console.error("Unexpected Firebase error:", firebaseError);
          return res.status(500).json({ error: "Account creation failed. Please try again." });
        }
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Signup error:", error.message);
        return res.status(500).json({ error: "Account creation failed. Please try again." });
      } else {
        console.error("Unknown error during signup:", error);
        return res.status(500).json({ error: "An unexpected error occurred" });
      }
    }
  } else {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
