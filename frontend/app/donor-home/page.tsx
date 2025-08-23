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
  LinearProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const PageWrapper = styled(Box)({
  minHeight: "100vh",
  backgroundColor: "#f9fafb",
  padding: "40px",
  fontFamily: "var(--font-inter), sans-serif",
});

const StatCard = styled(Paper)({
  padding: "24px",
  borderRadius: "16px",
  textAlign: "center",
  backgroundColor: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  height: "100%",
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

export default function DonorDashboard() {
  const [user, loading] = useAuthState(auth);

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

  const badges = ["🥉 Bronze Donor", "🥈 Silver Donor"];
  const regionBadges = ["✅ Shum Shui Po Donor"];

  const donationHistory = [
    { amount: 25, date: "2025-03-19", status: "Complete" },
    { amount: 200, date: "2025-01-02", status: "Complete" },
    { amount: 200, date: "2025-01-16", status: "Complete" },
  ];

  return (
    <PageWrapper>
      {/* Giving Stats */}
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", mb: 2, color: "#333", textAlign: "center" }}
      >
        Your Giving Stats
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Grid container spacing={3} sx={{ mb: 6, maxWidth: "1000px" }}>
          <Grid item xs={12} md={4}>
            <StatCard>
              <Typography variant="h4" color="primary">
                <AnimatedCounter value={numberOfDonations} />
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Number of Donations
              </Typography>
            </StatCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StatCard>
              <Typography variant="h6" color="textSecondary">
                Lifetime Donations
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: "#333" }}>
                $<AnimatedCounter value={totalDonated} />
              </Typography>
              <AnimatedProgress value={(totalDonated / nextMilestone) * 100} />
              <Typography variant="body2" sx={{ mt: 1, color: "#777" }}>
                Next goal: ${nextMilestone} (only ${nextMilestone - totalDonated} left!)
              </Typography>
            </StatCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StatCard>
              <Typography variant="h4" color="primary">
                <AnimatedCounter value={childrenImpacted} />
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Children Impacted
              </Typography>
            </StatCard>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 6 }} />

      {/* Badges Section */}
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", mb: 2, color: "#333", textAlign: "center" }}
      >
        Badges Collected
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          mb: 6,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", maxWidth: "800px" }}>
          {badges.concat(regionBadges).map((badge, i) => (
            <Paper
              key={i}
              sx={{
                px: 3,
                py: 2,
                borderRadius: "12px",
                backgroundColor: "#fffcec",
                border: "1px solid #006e34",
                fontSize: "14px",
                fontWeight: "500",
                color: "#006e34",
              }}
            >
              {badge}
            </Paper>
          ))}
        </Box>
      </Box>
      <Divider sx={{ mb: 6 }} />

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
    </PageWrapper>
  );
}
