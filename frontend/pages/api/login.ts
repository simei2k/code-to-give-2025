import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Login API called with method:", req.method);
  
  if (req.method === "POST") {
    try {
      // Check if Firebase is properly initialized
      if (!firebaseApp) {
        console.error("Firebase app not initialized");
        return res.status(500).json({ error: "Firebase configuration error" });
      }

      const auth = getAuth(firebaseApp);
      const { email, password } = req.body;

      // Log incoming request for debugging
      console.log("Received login request:", { email: email ? "provided" : "missing", password: password ? "provided" : "missing" });

      // Check if email and password are provided
      if (!email || !password) {
        console.log("Error: Missing required fields");
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Sign in the user using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Log the user data for debugging
      console.log("User logged in:", user.uid);

      // Return the user data and JWT token
      const token = await user.getIdToken();

      return res.status(200).json({
        uid: user.uid,
        email: user.email,
        token,
        displayName: user.displayName, // Include displayName in the response
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error message:", error.message);

        if (error.message.includes("auth/invalid-credential")) {
          return res.status(404).json({ error: "Incorrect login information" });
        } else {
          return res.status(500).json({ error: "An unknown error occurred" });
        }
      } else {
        // In case the error is not an instance of Error (e.g., network issues)
        console.error("Unknown error:", error);
        return res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  } else {
    console.log("Method not allowed:", req.method);
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}