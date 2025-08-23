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

    // Method not allowed
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("[pages/api/donor] error", err);
    return res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
}
