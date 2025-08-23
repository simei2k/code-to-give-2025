import type { NextApiRequest, NextApiResponse } from "next";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";

const db = getFirestore(firebaseApp);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Donations API called with method:", req.method);
  
  if (req.method === "POST") {
    try {
      // Check if Firebase is properly initialized
      if (!firebaseApp) {
        console.error("Firebase app not initialized");
        return res.status(500).json({ error: "Firebase configuration error" });
      }

      const { amount, displayName, email, message, donorId, district, school } = req.body;

      // Log incoming request for debugging
      console.log("Received donation request:", { 
        amount: amount !== undefined ? amount : "missing", 
        displayName: displayName || "missing",
        email: email || "missing",
        message: message || "missing",
        donorId: donorId || "missing" // for anon donors
      });

      // Check if required fields are provided
      if (amount === undefined || !email) {
        console.log("Error: Missing required fields");
        return res.status(400).json({ error: "Amount and email are required" });
      }

      // Create the donation document
      const donationData = {
        amount: Number(amount),
        createdAt: new Date(),
        displayName: displayName || "-",
        email: email,
        message: message || "-",
        donorId: donorId ?? null,
        district: district,
        school: school,
      };

      // Add the donation to Firestore
      const docRef = await addDoc(collection(db, "donations"), donationData);

      console.log("Donation created with ID:", docRef.id);

      return res.status(200).json({
        id: docRef.id,
        ...donationData,
        message: "Donation created successfully"
      });

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating donation:", error.message);
        return res.status(500).json({ error: "Failed to create donation: " + error.message });
      } else {
        console.error("Unknown error:", error);
        return res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  } if (req.method === "GET") {
    try {
      if (!firebaseApp) {
        console.error("Firebase app not initialized");
        return res.status(500).json({ error: "Firebase configuration error" });
      }

      // Support either donorId or email in the querystring
      const donorIdRaw = req.query.donorId;
      const donorId =
        typeof donorIdRaw === "string"
          ? donorIdRaw.trim()
          : Array.isArray(donorIdRaw)
          ? donorIdRaw[0].trim()
          : "";

      const emailRaw = req.query.email;
      const emailLower =
        typeof emailRaw === "string"
          ? emailRaw.trim().toLowerCase()
          : Array.isArray(emailRaw)
          ? emailRaw[0].trim().toLowerCase()
          : "";

      const donationsRef = collection(db, "donations");
      let qRef;

      if (donorId) {
        // Preferred: look up by donorId (stable)
        qRef = query(donationsRef, where("donorId", "==", donorId), orderBy("createdAt", "desc"));
      } else if (emailLower) {
        // Fallback: look up by normalized email (requires you to store emailLower on writes)
        qRef = query(
          donationsRef,
          where("emailLower", "==", emailLower),
          orderBy("createdAt", "desc")
        );
      } else {
        // No filter → return all (consider restricting in production/admin-only)
        qRef = query(donationsRef, orderBy("createdAt", "desc"));
      }

      const snap = await getDocs(qRef);

      const donations = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      console.log('donations', donations);
      return res.status(200).json({ donations });
    } catch (error: any) {
      console.error("Error fetching donations:", error);
      // Firestore will include a console link for required composite indexes if needed
      return res.status(500).json({ error: "Failed to fetch donations" });
    }
  } else {
    console.log("Method not allowed:", req.method);
    res.status(405).json({ error: 'Method Not Allowed' });
  }
} 