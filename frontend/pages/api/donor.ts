// pages/api/donor.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

type DonorDoc = {
  displayName: string;
  email: string;
  totalDonated: number;
  badges: string[];        // array, as requested
  createdAt: Timestamp;
  donorId?: string | null;
};

type DonorAPI = {
  id: string;
  displayName: string;
  email: string;
  totalDonated: number;
  badges: string[];
  createdAt: string;       // ISO
};

function toISO(ts?: Timestamp) {
  return ts ? ts.toDate().toISOString() : new Date(0).toISOString();
}

function normalizeBadges(raw: any): string[] {
  if (Array.isArray(raw)) return raw.filter((x) => typeof x === "string");
  if (raw && typeof raw === "object") return Object.keys(raw).filter((k) => !!raw[k]); // migrate old map
  return [];
}

function coerceToSchema(raw: any): DonorDoc {
  return {
    displayName: typeof raw?.displayName === "string" ? raw.displayName : "init",
    email: typeof raw?.email === "string" ? raw.email : "init",
    totalDonated: Number.isFinite(raw?.totalDonated) ? Number(raw.totalDonated) : 0,
    badges: normalizeBadges(raw?.badges),
    createdAt:
      raw?.createdAt instanceof Timestamp
        ? raw.createdAt
        : Timestamp.fromDate(new Date()),
    donorId: typeof raw?.donorId === "string" ? raw.donorId : raw?.donorId ?? null,
  };
}

function shapeForApi(id: string, d: DonorDoc): DonorAPI {
  return {
    id,
    displayName: d.displayName,
    email: d.email,
    totalDonated: d.totalDonated,
    badges: d.badges,
    createdAt: toISO(d.createdAt),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const id = (req.query.id as string) || undefined;
      const donorId = (req.query.donorId as string) || undefined;
      const email = ((req.query.email as string) || "").trim() || undefined;

      if (!id && !donorId && !email) {
        return res.status(400).json({ error: "Provide one of: id, donorId, email" });
      }

      if (id) {
        const snap = await getDoc(doc(db, "donors", id));
        if (!snap.exists()) return res.status(404).json({ error: "Not found" });
        const data = coerceToSchema(snap.data());
        return res.status(200).json({ donor: shapeForApi(snap.id, data) });
      }

      const donorsRef = collection(db, "donors");
      const q = query(
        donorsRef,
        donorId ? where("donorId", "==", donorId) : where("email", "==", email!),
        limit(1)
      );
      const result = await getDocs(q);
      if (result.empty) return res.status(404).json({ error: "Not found" });

      const docSnap = result.docs[0];
      const data = coerceToSchema(docSnap.data());
      return res.status(200).json({ donor: shapeForApi(docSnap.id, data) });
    }

    if (req.method === "POST") {
      const { displayName, email, totalDonated, donorId } = req.body;

      // Validate required fields
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required and must be a string" });
      }

      if (!displayName || typeof displayName !== "string") {
        return res.status(400).json({ error: "Display name is required and must be a string" });
      }

      if (!totalDonated || !Number.isFinite(Number(totalDonated)) || Number(totalDonated) < 0) {
        return res.status(400).json({ error: "Total donated is required and must be a non-negative number" });
      }

      try {
        // Create new donor record
        const donorData = {
          displayName: displayName.trim(),
          email: email.trim(),
          totalDonated: Number(totalDonated),
          badges: [],
          createdAt: serverTimestamp(),
          donorId: donorId || null
        };

        const docRef = doc(db, "donors", donorId || email);
        await setDoc(docRef, donorData);

        console.log("🔥 New donor created:", donorData);

        return res.status(201).json({
          message: "Donor created successfully",
          donor: shapeForApi(docRef.id, coerceToSchema(donorData))
        });
      } catch (err: any) {
        console.error("Error creating donor:", err);
        return res.status(500).json({ error: err?.message || "Failed to create donor" });
      }
    }

    if (req.method === "PUT") {
      const { email, amount } = req.body;

      // Validate required fields
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required and must be a string" });
      }

      if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ error: "Amount is required and must be a positive number" });
      }

      const donationAmount = Number(amount);

      // Find donor by email
      const donorsRef = collection(db, "donors");
      const q = query(donorsRef, where("email", "==", email.trim()), limit(1));
      const result = await getDocs(q);

      if (result.empty) {
        return res.status(404).json({ error: "Donor not found with this email" });
      }

      const docSnap = result.docs[0];
      const donorData = coerceToSchema(docSnap.data());
      const currentTotal = donorData.totalDonated;
      const newTotal = currentTotal + donationAmount;

      // Update the donor's totalDonated
      await updateDoc(doc(db, "donors", docSnap.id), {
        totalDonated: newTotal,
        updatedAt: serverTimestamp(),
      });

      // Return updated donor data
      const updatedDonor = {
        ...donorData,
        totalDonated: newTotal,
      };

      return res.status(200).json({
        message: "Donation amount updated successfully",
        donor: shapeForApi(docSnap.id, updatedDonor),
        previousTotal: currentTotal,
        newTotal: newTotal,
        amountAdded: donationAmount,
      });
    }

    // Method not allowed
    res.setHeader("Allow", "GET, POST, PUT");
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("[pages/api/donor] error", err);
    return res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
}
