import type { NextApiRequest, NextApiResponse } from "next";
import { getFirestore, collection, addDoc } from "firebase/firestore";
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

      const { amount, displayName, email, message } = req.body;

      // Log incoming request for debugging
      console.log("Received donation request:", { 
        amount: amount || "missing", 
        displayName: displayName || "missing",
        email: email || "missing",
        message: message || "missing"
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
        message: message || "-"
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
  } else if (req.method === "GET") {
    // Optional: Add GET method to retrieve donations
    try {
      const { collection: getCollection, getDocs } = await import("firebase/firestore");
      const querySnapshot = await getDocs(getCollection(db, "donations"));
      const donations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return res.status(200).json({ donations });
    } catch (error) {
      console.error("Error fetching donations:", error);
      return res.status(500).json({ error: "Failed to fetch donations" });
    }
  } else {
    console.log("Method not allowed:", req.method);
    res.status(405).json({ error: 'Method Not Allowed' });
  }
} 