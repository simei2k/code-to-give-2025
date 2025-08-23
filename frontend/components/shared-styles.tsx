"use client";
import { Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

// Main container with fullscreen layout
export const StyledContainer = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #fffcec 0%, #f5f2dc 50%, #fffcec 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  fontFamily: 'var(--font-inter), sans-serif',
});

// Glass card effect
export const GlassCard = styled(Paper)({
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