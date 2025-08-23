// lib/donations.ts
export type Donation = {
  amount: number;
  createdAt: string;           
  displayName: string;
  email: string;
  message: string;
  donorId: string | null;
  district?: string | null;
  school?: string | null;
};

export async function fetchDonations(params: {
  email?: string;
  donorId?: string | null;
}) {
  const qs = new URLSearchParams();
  if (params.email) qs.set("email", params.email);
  if (params.donorId) qs.set("donorId", params.donorId); // add support server-side if you want
  const res = await fetch(`/api/donations?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load donations: ${await res.text()}`);
  return (await res.json()) as { donations: Donation[] };
}
