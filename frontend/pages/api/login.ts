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
      console.log("Received login request:", { 
        email: email ? "provided" : "missing", 
        password: password ? "provided" : "missing" 
      });

      if (!email || !password) {
        console.log("Error: Missing required fields");
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Log the user data for debugging
      console.log("User logged in successfully:", user.uid);

      const token = await user.getIdToken();

      return res.status(200).json({
        uid: user.uid,
        email: user.email,
        token,
        displayName: user.displayName,
        message: "Login successful"
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Login error:", error.message);

        // Handle different Firebase auth errors
        if (error.message.includes("auth/invalid-credential") || 
            error.message.includes("auth/wrong-password") ||
            error.message.includes("auth/user-not-found")) {
          return res.status(401).json({ error: "Invalid email or password" });
        } else if (error.message.includes("auth/too-many-requests")) {
          return res.status(429).json({ error: "Too many failed attempts. Please try again later." });
        } else if (error.message.includes("auth/user-disabled")) {
          return res.status(403).json({ error: "This account has been disabled" });
        } else {
          return res.status(500).json({ error: "Login failed. Please try again." });
        }
      } else {
        console.error("Unknown error:", error);
        return res.status(500).json({ error: "An unexpected error occurred" });
      }
    }
  } else {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}