"use client";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  LinearProgress,
  tooltipClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const BadgeTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#fffcec",
    color: "#006e34",
    maxWidth: 260,
    fontSize: "0.85rem",
    border: "1px solid #006e34",
    borderRadius: "12px",
    padding: "12px 16px",
    boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
    fontWeight: 500,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "#fffcec",
  },
}));

const PageWrapper = styled(Box)({
  minHeight: "100vh",
  backgroundColor: "#f9fafb",
  padding: "40px",
  fontFamily: "var(--font-inter), sans-serif",
});

const StatCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "centerContent", // 👈 prevent leaking
})<{ centerContent?: boolean }>(({ centerContent }) => ({
  padding: "24px",
  borderRadius: "16px",
  textAlign: "center",
  backgroundColor: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: centerContent ? "center" : "flex-start",
  alignItems: "center",
}));

const StyledContainer = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #fffcec 0%, #f5f2dc 50%, #fffcec 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  fontFamily: 'var(--font-inter), sans-serif',
});

const GlassCard = styled(Paper)({
  background: 'rgba(255, 252, 236, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  padding: '40px',
  maxWidth: '1200px',
  width: '100%',
  boxShadow: '0 20px 40px rgba(0, 110, 52, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(0, 110, 52, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 252, 236, 0.8) 0%, rgba(245, 242, 220, 0.6) 100%)',
    zIndex: -1,
  }
});

export function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;

    const frameRate = 30;
    const totalFrames = Math.round((duration / 1000) * frameRate);
    const increment = end / totalFrames;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      start += increment;
      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.round(start));
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
}

export function AnimatedProgress({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const step = end / (duration / 20);

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setProgress(end);
        clearInterval(timer);
      } else {
        setProgress(start);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <LinearProgress
      variant="determinate"
      value={progress}
      sx={{
        mt: 2,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#e0e0e0",
        "& .MuiLinearProgress-bar": {
          backgroundColor: "#006e34",
        },
      }}
    />
  );
}

export function AnimatedDonationGraph({ data }: { data: { month: string; cumulative: number }[] }) {
  const [animatedData, setAnimatedData] = useState<{ month: string; cumulative: number }[]>([]);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < data.length) {
        setAnimatedData((prev) => [...prev, data[i]]);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 800); // adds one point every 0.8s
    return () => clearInterval(timer);
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={animatedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(val) => `$${val}`} domain={[0, 600]} />
        <RechartsTooltip formatter={(val) => [`$${val}`, "Cumulative Donations"]} />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#006e34"
          strokeWidth={3}
          dot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function DonorDashboard() {
  const [user, loading] = useAuthState(auth);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [user, loading]);

  if (!user) return null;

  const numberOfDonations = 3;
  const totalDonated = 425;
  const nextMilestone = 500;
  const childrenImpacted = 24;

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
  
  const donationHistory = [
    { amount: 100, date: "2025-01-16", status: "Completed" },
    { amount: 100, date: "2025-02-01", status: "Completed" },
    { amount: 25,  date: "2025-03-19", status: "Completed" },
    { amount: 75,  date: "2025-04-23", status: "Completed" },
  ];

  const baseData = [
    { month: "Jan", cumulative: 100 },
    { month: "Feb", cumulative: 200 },
    { month: "Mar", cumulative: 225 },
    { month: "Apr", cumulative: 300 },
  ];

  return (
    <StyledContainer>
      <GlassCard elevation={0}>
      {/* Giving Stats */}
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", mb: 2, color: "#333", textAlign: "center" }}
      >
        Your Giving Stats
      </Typography>

      <StatCard>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
          Lifetime Donations
        </Typography>
        <Box sx={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={baseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(val) => `$${val}`} domain={[0, 600]} />
              <RechartsTooltip formatter={(val) => [`$${val}`, "Cumulative Donations"]} />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#006e34"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ width: "100%", mt: 2 }}>
          <AnimatedProgress value={(totalDonated / nextMilestone) * 100} />
        </Box>
        <Typography variant="body2" sx={{ mt: 1, color: "#777" }}>
          Next goal: ${nextMilestone} (only ${nextMilestone - totalDonated} left!)
        </Typography>
      </StatCard>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center", width: "100%" }}>
        <Grid container spacing={3} sx={{ mb: 6, maxWidth: "1200px" }}>
          <Grid item xs={12} md={3}>
            <StatCard centerContent>
              <Typography variant="h4" color="primary">
                <AnimatedCounter value={numberOfDonations} />
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Number of Donations
              </Typography>
            </StatCard>
          </Grid>    

          <Grid item xs={12} md={3}>
            <StatCard centerContent>
              <Typography variant="h4" color="primary">
                <AnimatedCounter value={childrenImpacted} />
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Children Impacted
              </Typography>
            </StatCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <StatCard 
              centerContent 
              onClick={() => setIsPopupOpen(true)}
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                }
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#006e34',
                  fontWeight: 'bold',
                  mb: 0.5,
                  fontSize: { xs: '1.2rem', md: '1.4rem' }
                }}
              >
                Your Impact! ➡️
              </Typography>
            </StatCard>
          </Grid>
        </Grid>
      </Box>

      {/* Badges Section */}
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", mb: 2, color: "#333", textAlign: "center" }}
      >
        Badges Collected
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: 6 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: "1000px",
          }}
        >
          {allBadges.map((badge) => {
            const unlocked = badge.condition({
              numberOfDonations,
              totalDonated,
              largestDonation: 425,
              monthlyStreak: 3,
            });

            return (
              <BadgeTooltip
                key={badge.id}
                title={badge.description}
                arrow
                placement="top"
              >
                <Paper
                  sx={{
                    px: 3,
                    py: 2,
                    borderRadius: "12px",
                    backgroundColor: unlocked ? "#fffcec" : "#f0f0f0",
                    border: "1px solid #006e34",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: unlocked ? "#006e34" : "#999",
                    opacity: unlocked ? 1 : 0.6,
                    minWidth: "200px",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  {badge.label}
                </Paper>
              </BadgeTooltip>
            );
          })}
        </Box>
      </Box>

      {/* Donation History */}
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", mb: 2, color: "#333" }}
      >
        Recent Donations
      </Typography>
      <Paper sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Donation</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donationHistory.map((don, i) => (
              <TableRow key={i}>
                <TableCell>${don.amount}</TableCell>
                <TableCell>{don.date}</TableCell>
                <TableCell>{don.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      </GlassCard>

      {/* Popup Window */}
      {isPopupOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setIsPopupOpen(false)}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #fffcec 0%, #f5f2dc 50%, #fffcec 100%)',
              width: '95%',
              maxWidth: '1200px',
              minHeight: '94vh',
              borderRadius: '24px 24px 0 0',
              padding: '40px',
              transform: isPopupOpen ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.3s ease-out',
              animation: 'slideUp 0.3s ease-out',
              '@keyframes slideUp': {
                from: {
                  transform: 'translateY(100%)',
                },
                to: {
                  transform: 'translateY(0)',
                },
              },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Box
                component="button"
                onClick={() => setIsPopupOpen(false)}
                sx={{
                  background: 'rgba(0, 110, 52, 0.1)',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: '#006e34',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(0, 110, 52, 0.2)',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                ✕
              </Box>
            </Box>

            {/* Popup content */}
            <Typography variant="h5" sx={{ mb: 3, color: '#006e34', fontWeight: 'bold' }}>
              Detailed Statistics
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 2, color: '#333' }}>
              This is your detailed view popup window. You can add any content here.
            </Typography>
            
            <Typography variant="body2" sx={{ color: '#666' }}>
              The popup opens from the bottom with a smooth animation and matches the background color scheme.
            </Typography>
          </Box>
        </Box>
      )}

    </StyledContainer>
  );
}
