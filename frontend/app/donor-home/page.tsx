"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useDonations } from "@/hooks/useDonations";

import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Avatar,
  Stack,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { CheckCircle2, Gift, Calendar, Target } from "lucide-react";
import { GlassCard, StyledContainer } from "../donate/page";
import { useEffect, useState } from "react";
import { Tooltip as MuiTooltip, tooltipClasses } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Skeleton, CircularProgress } from "@mui/material";

type DonorProfile = {
  id: string;
  displayName: string;
  email: string;
  totalDonated: number;
  badges: string[]; 
  createdAt: string;
};

const BadgeTooltip = styled(({ className, ...props }: any) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#fffcec",
    color: "#0F6E35",
    border: "1px solid #0F6E35",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: "0.85rem",
    boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
  },
  [`& .${tooltipClasses.arrow}`]: { color: "#fffcec" },
}));

// ---------- helpers ----------
function currency(v: number) {
  return v.toLocaleString("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  });
}

// parse Firestore Timestamp OR ISO string
function parseDate(input: any): Date {
  if (!input) return new Date(NaN);
  if (typeof input === "string") return new Date(input);
  if (typeof input === "object" && "seconds" in input) {
    return new Date((input.seconds as number) * 1000);
  }
  return new Date(input);
}

// ---------- atoms ----------
const Card = (p: any) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      bgcolor: "#ffffff",
      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    }}
    {...p}
  />
);

// Loading placeholder components
const KpiLoadingPlaceholder = () => (
  <Card>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Skeleton variant="circular" width={40} height={40} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
    </Box>
  </Card>
);

const ChartLoadingPlaceholder = () => (
  <Card>
    <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: '#0F6E35' }} />
    </Box>
  </Card>
);

const BadgesLoadingPlaceholder = () => (
  <Card>
    <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} variant="rounded" width={120} height={40} />
      ))}
    </Box>
  </Card>
);

function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          sx={{ bgcolor: "#E8F5EC", color: "#0F6E35", width: 48, height: 48 }}
          variant="rounded"
        >
          {icon}
        </Avatar>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

// helpers (put near the component)
const compactCurrency = (n: number) =>
  n >= 1_000_000
    ? `\$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `\$${(n / 1_000).toFixed(1)}k`
    : `\$${Math.round(n)}`;

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const cum = payload.find((p) => p.dataKey === "cumulative")?.value ?? 0;
  const month = payload.find((p) => p.dataKey === "total")?.value ?? 0;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        padding: "8px 10px",
        borderRadius: 8,
        boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Month: {label}</div>
      <div>Cumulative: <strong>{currency(Number(cum))}</strong></div>
    </div>
  );
}


const allBadges = [
  {
    id: "planting-seeds",
    label: "🌱 Planting Seeds",
    description: "You earned this badge for making your very first donation — planting the seed of change.",
    condition: (stats: any) => stats.numberOfDonations >= 1,
  },
  {
    id: "bright-future-builder",
    label: "🌞 Bright Future Builder",
    description: "You earned this badge for making your second donation — building momentum for brighter futures.",
    condition: (stats: any) => stats.numberOfDonations >= 2,
  },
  {
    id: "rule-of-3",
    label: "🔺 Rule of 3",
    description: "You earned this badge for making 3 donations — proving good things come in threes.",
    condition: (stats: any) => stats.numberOfDonations >= 3,
  },
  {
    id: "high-five-hero",
    label: "🖐 High Five Hero",
    description: "Make 5 donations — high five to your generosity!",
    condition: (stats: any) => stats.numberOfDonations >= 5,
  },
  {
    id: "perfect-10",
    label: "💯 Perfect 10",
    description: "Make 10 donations — a perfect score in kindness.",
    condition: (stats: any) => stats.numberOfDonations >= 10,
  },
  {
    id: "harbour-light",
    label: "🌃 Harbour Light",
    description: "Donate over $500 in total — your generosity shines like the harbour lights.",
    condition: (stats: any) => stats.totalDonated > 500,
  },
  {
    id: "dream-unlocker",
    label: "🔓 Dream Unlocker",
    description: "Donate over $1000 in total — unlocking dreams for children in need.",
    condition: (stats: any) => stats.totalDonated > 1000,
  },
  {
    id: "smiles-creator",
    label: "😁 Smiles Creator",
    description: "Make a single donation of over $500 — creating countless smiles.",
    condition: (stats: any) => stats.largestDonation > 500,
  },
  {
    id: "future-builder",
    label: "🏗 Bright Future Builder",
    description: "Make a single donation of over $800 — helping build brighter futures.",
    condition: (stats: any) => stats.largestDonation > 800,
  },
  {
    id: "scholarship-builder",
    label: "🎓 Scholarship Builder",
    description: "Make a single donation of over $1200 — paving the way for scholarships.",
    condition: (stats: any) => stats.largestDonation > 1200,
  },
  {
    id: "full-attendance",
    label: "📅 Full Attendance",
    description: "Donating every month for a year — showing up like a star student.",
    condition: (stats: any) => stats.monthlyStreak >= 12,
  },
  {
    id: "shum-shui-po",
    label: "📍 Shum Shui Po",
    description: "You earn this badge by making a donation to Shum Shui Po.",
    condition: () => false,
  },
  {
    id: "kwai-tsing",
    label: "📍 Kwai Tsing",
    description: "You earn this badge by making a donation to Kwai Tsing.",
    condition: () => false,
  },
  {
    id: "kwun-tong",
    label: "📍 Kwun Tong",
    description: "You earn this badge by making a donation to Kwai Tsing.",
    condition: () => false,      
  },
  {
    id: "secret-1",
    label: "❓ Secret Badge 1",
    description: "This is a hidden badge… keep donating and you may unlock it!",
    condition: () => false,
    secret: true,
  },
  {
    id: "secret-2",
    label: "❓ Secret Badge 2",
    description: "Another hidden badge… only the most generous donors will see this unlocked.",
    condition: () => false,
    secret: true,
  },
];

// nice green palette for charts
const GREEN = "#0F6E35";
const GREENS = ["#0F6E35", "#3FA35E", "#7BC99B", "#B7E3C9", "#DFF3E7"];

export default function Dashboard() {
  const [user, loadingAuth] = useAuthState(auth);
  const email = user?.email ?? undefined;
  const donorId = user?.uid ?? null;
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [badgesLoading, setBadgesLoading] = useState(true);

  useEffect(() => {
    if (!donorId && !email) return;
    let mounted = true;
    setBadgesLoading(true);
    const qs = new URLSearchParams(donorId ? { id: donorId } : { email: email! }).toString();
    fetch(`/api/donor?${qs}`, { cache: "no-store" })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.text())))
      .then((json) => { if (mounted) setDonorProfile(json.donor as DonorProfile); })
      .catch(() => { if (mounted) setDonorProfile(null); })
      .finally(() => mounted && setBadgesLoading(false));
    return () => { mounted = false; };
  }, [donorId, email]);

  const { loading, error, donations, stats } = useDonations(email);

  if (loadingAuth) return null;
  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  // milestone ring math
  const nextMilestone = Math.max(500, Math.ceil(stats.total / 500) * 500 || 500);
  const pct = Math.min(100, (stats.total / nextMilestone) * 100);

  // chart data (safe default)
  const areaData =
    stats.byMonth.length > 0
      ? stats.byMonth
      : [{ label: "—", total: 0, cumulative: 0 }];

  // pie data for region and school charts
  const regionData = stats.byRegion.length
    ? stats.byRegion
    : [{ region: "—", total: 1, count: 0 }];

  const schoolData = stats.bySchool.length
    ? stats.bySchool
    : [{ school: "—", total: 1, count: 0 }];


  return (
    <StyledContainer>
      <GlassCard>
    <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      {/* header */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Chip
          label="💚 Donor Dashboard"
          sx={{
            bgcolor: "#E8F5EC",
            color: GREEN,
            fontWeight: 700,
            borderRadius: "999px",
          }}
        />
        <Typography
          variant="h3"
          sx={{ mt: 2, fontWeight: 900, color: GREEN, lineHeight: 1.1 }}
        >
          Your Giving Summary
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mt: 0.5 }}>
          Thank you, {user.displayName || user.email}! Here’s your impact at a
          glance.
        </Typography>
      </Box>

      <Box sx={{ py: 4, px: 2 }}>
        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="center"
        >
          {loading ? (
            // Loading placeholders for KPI cards
            <>
              <Grid item xs={12} md={3}>
                <KpiLoadingPlaceholder />
              </Grid>
              <Grid item xs={12} md={3}>
                <KpiLoadingPlaceholder />
              </Grid>
              <Grid item xs={12} md={3}>
                <KpiLoadingPlaceholder />
              </Grid>
            </>
          ) : (
            // Actual KPI cards
            <>
              <Grid item xs={12} md={3}>
                <Kpi
                  icon={<CheckCircle2 />}
                  label="Total Donated"
                  value={currency(stats.total)}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Kpi
                  icon={<Gift />}
                  label="Donations"
                  value={String(stats.count)}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Kpi
                  icon={<Target />}
                  label="Largest Single Gift"
                  value={currency(stats.largest)}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Box>

      
      <Grid>
        {/* Area chart */}
        <Grid item xs={12} md={8} sx={{ mb: 3 }}>
          {loading ? (
            <ChartLoadingPlaceholder />
          ) : (
            <Card>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>
                Cumulative Over Time
              </Typography>
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart
                    data={areaData} // expects { label, total, cumulative }
                    margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
                  >
                    <defs>
                      {/* cumulative fill */}
                      <linearGradient id="gCum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={GREEN} stopOpacity={0.04} />
                      </linearGradient>
                      {/* monthly total fill (lighter) */}
                      <linearGradient id="gMon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GREEN} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="#e5e7eb" strokeOpacity={0.6} />
                    <XAxis
                      dataKey="label"
                      tickMargin={8}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => compactCurrency(Number(v))}
                      width={56}
                      tickMargin={8}
                      axisLine={false}
                      tickLine={false}
                    />

                    <RechartsTooltip content={<CustomTooltip />} />

                    {/* Cumulative (primary) */}
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke={GREEN}
                      fill="url(#gCum)"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      connectNulls
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Optional zoom/scroll for long ranges (desktop only) */}
                    {/* Uncomment if you expect many months:
                    <Brush height={16} travellerWidth={8} />
                    */}
                  </AreaChart>
                </ResponsiveContainer>
              </Box>

            </Card>
          )}
        </Grid>

        {/* Badges Section */}
        <Grid item xs={12} md={4} sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 2, color: "#333", textAlign: "center" }}
          >
            Badges Collected
          </Typography>

          {badgesLoading ? (
            <Typography color="text.secondary" align="center">Loading badges…</Typography>
          ) : !donorProfile ? (
            <Typography color="text.secondary" align="center">No donor profile found.</Typography>
          ) : (
            (() => {
              const unlockedSet = new Set(donorProfile.badges ?? []);
              const unlocked = allBadges.filter(b => unlockedSet.has(b.id));
              const locked   = allBadges.filter(b => !unlockedSet.has(b.id));

              return (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Unlocked */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                    {unlocked.length === 0 ? (
                      <Typography color="text.secondary">No badges yet — your first is just one gift away 🌱</Typography>
                    ) : (
                      unlocked.map((badge) => (
                        <BadgeTooltip key={badge.id} title={badge.description} arrow placement="top">
                          <Paper
                            sx={{
                              px: 2.5, py: 1.5, borderRadius: 2,
                              backgroundColor: "#fffcec",
                              border: "1px solid #0F6E35",
                              color: "#0F6E35",
                              fontWeight: 600,
                            }}
                          >
                            {badge.label}
                          </Paper>
                        </BadgeTooltip>
                      ))
                    )}
                  </Box>

                  {/* Divider text */}
                  <Typography variant="caption" align="center" sx={{ color: "text.secondary", mt: 1 }}>
                    {unlocked.length} unlocked · {locked.length} locked
                  </Typography>

                  {/* Locked (muted style) */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                    {locked.map((badge) => (
                      <BadgeTooltip key={badge.id} title={badge.description} arrow placement="top">
                        <Paper
                          sx={{
                            px: 2.5, py: 1.5, borderRadius: 2,
                            backgroundColor: "#f5f5f5",
                            border: "1px solid #d6d6d6",
                            color: "#9e9e9e",
                            fontWeight: 500,
                            opacity: 0.8,
                          }}
                        >
                          {badge.label}
                        </Paper>
                      </BadgeTooltip>
                    ))}
                  </Box>
                </Box>
              );
            })()
          )}
        </Grid>

        {/* Region distribution */}
        <Grid item xs={12} md={6} sx={{ mb: 3 }}>
          {loading ? (
            <ChartLoadingPlaceholder />
          ) : stats.count === 0 ? (
            <Card>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>
                By Region
              </Typography>
              <Box sx={{ 
                height: 260, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 3
              }}>
                <img 
                  src="/donation-heart.svg" 
                  alt="Donation Heart" 
                  style={{ 
                    width: '60px', 
                    height: '60px',
                    opacity: 0.7
                  }} 
                />
                <Typography variant="h6" sx={{ 
                  color: 'text.secondary', 
                  textAlign: 'center',
                  fontWeight: 500,
                  lineHeight: 1.4
                }}>
                  Make at least 1 donation to show analytics!
                </Typography>
              </Box>
            </Card>
          ) : (
            <Card>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>
                By Region
              </Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={regionData}
                      dataKey="total"
                      nameKey="region"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {regionData.map((_, i) => (
                        <Cell key={i} fill={GREENS[i % GREENS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <RechartsTooltip formatter={(v, n, e) => [currency(Number(v)), e.payload.region]} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          )}
        </Grid>

        {/* School distribution */}
        <Grid item xs={12} md={6} sx={{ mb: 3 }}>
          {loading ? (
            <ChartLoadingPlaceholder />
          ) : stats.count === 0 ? (
            <Card>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>
                By School
              </Typography>
              <Box sx={{ 
                height: 260, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 3
              }}>
                <img 
                  src="/donation-heart.svg" 
                  alt="Donation Heart" 
                  style={{ 
                    width: '60px', 
                    height: '60px',
                    opacity: 0.7
                  }} 
                />
                <Typography variant="h6" sx={{ 
                  color: 'text.secondary', 
                  textAlign: 'center',
                  fontWeight: 500,
                  lineHeight: 1.4
                }}>
                  Make at least 1 donation to show analytics!
                </Typography>
              </Box>
            </Card>
          ) : (
            <Card>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>
                By School
              </Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={schoolData}
                      dataKey="total"
                      nameKey="school"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {schoolData.map((_, i) => (
                        <Cell key={i} fill={GREENS[i % GREENS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <RechartsTooltip formatter={(v, n, e) => [currency(Number(v)), e.payload.school]} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          )}
        </Grid>

        {/* Recent donations */}
        <Grid item xs={12} md={7} sx={{ mb: 3 }}>
          <Card>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>
              Recent Donations
            </Typography>

            {loading ? (
              <Typography color="text.secondary">Loading…</Typography>
            ) : error ? (
              <Typography color="error.main">{error}</Typography>
            ) : donations.length === 0 ? (
              <Typography color="text.secondary">No donations yet.</Typography>
            ) : (
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>District</TableCell>
                    <TableCell>School</TableCell>
                    <TableCell>Anonymous?</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...donations]
                    .sort(
                      (a, b) =>
                        parseDate(b.createdAt).getTime() -
                        parseDate(a.createdAt).getTime()
                    )
                    .slice(0, 8)
                    .map((d, i) => (
                      <TableRow key={i} hover>
                        <TableCell>{currency(Number(d.amount))}</TableCell>
                        <TableCell>
                          {parseDate(d.createdAt).toLocaleString("en-SG", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>{(d as any).district || "-"}</TableCell>
                        <TableCell>{(d as any).school || "-"}</TableCell>
                        <TableCell>{d.displayName === 'Anonymous' ? '✅' : '❌'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
    </GlassCard>
    </StyledContainer>
  );
}

