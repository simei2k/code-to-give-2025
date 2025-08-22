"use client";
import React, { useState } from "react";
import { Box, Container, Grid, Typography, Button } from "@mui/material";

const programs = [
  {
    title: "Empowering Students",
    description: `We provide a minimum of 20 hours of weekly, premium English programmes targeting
to bridge the English proficiency gaps of K3 kindergarten students coming from some
of the poorest districts in Hong Kong. Our curriculum is designed based on renowned
story books worldwide.`,
    more: "Through mentorship, workshops, and educational programs, we help students develop confidence, resilience, and a love for learning.",
    img: "https://reach.org.hk/_assets/media/8d6a889428aa71b2ea0cc19c67eb2135.jpg",
  },
  {
    title: "Empowering Parents",
    description: `Students are given home learning booklets for them to practise at home after each
class. Detailed written instructions with videos are provided to parents each week on
how to help their children complete the home learning booklets. 

Parents are requested to submit completed work to Project REACH for grading. Our
previous programmes have increased parent-children interaction by >3,000 hours.`,
    more: "We offer parenting workshops, resources, and counseling to strengthen family relationships and equip parents with the knowledge to support their children's growth.",
    img: "https://reach.org.hk/_assets/media/48c3142886cbaf18f1a45f89d1aaa5a6.jpg",
  },
  {
    title: "Empowering Kindergartens with Data and Technology",
    description: `
    All participating students will utilise the Project Reach learning app, a
    proprietary platform created and owned by Project Reach, to complete
    their pre- and post-programme assessments. Students will also be assigned
    exercises to complete on the app at home following each weekly class. 

    The app will provide immediate feedback to students, and all learning data
    will be collected, analysed, and shared with our kindergarten partners.`,
    img: "https://reach.org.hk/_assets/media/0e0672d2a6987d6690a535dd4ff5abae.jpg",
  },
];

const FlipCard = ({ program }: { program: typeof programs[0] }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <Box
      onClick={() => setFlipped(!flipped)}
      sx={{
        perspective: "1000px",
        cursor: "pointer",
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          transition: "transform 0.6s",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backfaceVisibility: "hidden",
            overflow: "hidden",
            p: 2,
            minHeight: 250,
          }}
        >
          <img
            src={program.img}
            alt={program.title}
            style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }}
          />
          <Box sx={{ textAlign: "center", mt: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#006e34",
                fontWeight: "bold",
                fontSize: "0.9rem",
                lineHeight: 1.2,
              }}
            >
              {program.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.75rem", mt: 0.5 }}
            >
              {program.description.length > 80
                ? program.description.slice(0, 80) + "..."
                : program.description}
            </Typography>
          </Box>
        </Box>

        {/* Back */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            bgcolor: "#006e34",
            color: "white",
            borderRadius: 3,
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            p: 2,
            maxHeight: 250,
            overflowY: "auto",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
              mb: 1,
              fontSize: "0.85rem",
              textAlign: "center",
            }}
          >
            {program.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              fontSize: "0.75rem",
              whiteSpace: "pre-line",
              textAlign: "justify",
            }}
          >
            {program.more}
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: "white",
              color: "#006e34",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#f0f0f0" },
              mt: "auto",
            }}
          >
            Learn More
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default function AboutPage() {
  return (
    <Box sx={{ bgcolor: "#fffcec", minHeight: "100vh", py: 8 }}>
      <Container>
        <Typography
          variant="h3"
          align="center"
          fontWeight="bold"
          sx={{ color: "#006e34", mb: 4 }}
        >
          Our Work
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {programs.map((program, idx) => (
            <Grid
              item
              xs={12}
              sm={4}
              md={2.4} // ~20% width
              key={idx}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <FlipCard program={program} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

