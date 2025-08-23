"use client";
import React, { useState } from "react";
import { Box, Typography, Slider, TextField, Paper, Fade, Grow, FormControl, InputLabel, Select, MenuItem, Chip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Snackbar, Alert, IconButton, InputAdornment, Stepper, Step, StepLabel } from "@mui/material";
import { Visibility, VisibilityOff, Close } from '@mui/icons-material';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { styled, keyframes } from "@mui/material/styles";
import Button from '@/components/Button';

const images = [
  { src: "/picture_1.jpg", alt: "School Supplies", impact: "Textbooks & Stationery" },
  { src: "/picture_2.jpg", alt: "Educational Materials", impact: "Year Supply for Child" },
  { src: "/picture_3.jpg", alt: "Teacher Empowerment", impact: "Changing Lives Together" },
];

// Floating animation
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Pulse animation for amount display
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Card rotation animation
const cardRotation = keyframes`
  0% { transform: perspective(1000px) rotateY(0deg) scale(1); opacity: 1; }
  25% { transform: perspective(1000px) rotateY(45deg) scale(0.9); opacity: 0.7; }
  50% { transform: perspective(1000px) rotateY(90deg) scale(0.8); opacity: 0.3; }
  75% { transform: perspective(1000px) rotateY(135deg) scale(0.9); opacity: 0.7; }
  100% { transform: perspective(1000px) rotateY(180deg) scale(1); opacity: 1; }
`;

// Card entrance animation
const cardEntrance = keyframes`
  0% { 
    transform: perspective(1000px) rotateY(-90deg) translateZ(-100px) scale(0.8);
    opacity: 0;
  }
  100% { 
    transform: perspective(1000px) rotateY(0deg) translateZ(0px) scale(1);
    opacity: 1;
  }
`;

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

// Rotating card container (responsive, up to 40% of page width)
const RotatingCardsContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '40vw', // cap at 40% of viewport width
  minWidth: 320,
  aspectRatio: '4 / 3', // keep consistent aspect
  height: 'auto',
  perspective: '1200px',
  margin: '0 auto',
  [theme.breakpoints.down('md')]: {
    maxWidth: '80vw',
    aspectRatio: '16 / 10',
  },
}));

// Individual rotating card
const RotatingCard = styled(Box, {
  shouldForwardProp: (prop) =>
    !['isActive', 'rotation', 'zIndex'].includes(prop as string),
})<{ isActive: boolean; rotation: number; zIndex: number }>(
  ({ isActive, rotation, zIndex }) => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    transform: `perspective(1000px) rotateY(${rotation}deg) translateZ(${isActive ? '0px' : '-50px'})`,
    opacity: isActive ? 1 : 0.6,
    transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    zIndex, // OK to use here – it won't be forwarded as an attribute
    boxShadow: isActive
      ? '0 15px 30px rgba(0, 110, 52, 0.3), 0 5px 15px rgba(0,0,0,0.1)'
      : '0 8px 16px rgba(0, 110, 52, 0.2)',
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '16px',
    },
  })
);

// Card overlay for text
const CardOverlay = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive: boolean }>(({ isActive }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(transparent, rgba(0, 110, 52, 0.9))',
  padding: '20px',
  transform: isActive ? 'translateY(0)' : 'translateY(10px)',
  opacity: isActive ? 1 : 0.8,
  transition: 'all 0.3s ease',
}));

// Amount display
const AmountDisplay = styled(Typography)({
  background: 'linear-gradient(45deg, #006e34, #004d24)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold',
  animation: `${pulse} 2.5s ease-in-out infinite`,
  textShadow: '2px 2px 8px rgba(0, 110, 52, 0.3)',
  textAlign: 'center',
  marginBottom: '20px',
});

// Styled slider
const StyledSlider = styled(Slider)({
  color: '#006e34',
  height: 12,
  padding: '15px 0',
  '& .MuiSlider-track': {
    border: 'none',
    background: 'linear-gradient(90deg, #006e34 0%, #004d24 50%, #003318 100%)',
    borderRadius: '6px',
    height: 12,
  },
  '& .MuiSlider-rail': {
    background: 'rgba(0, 110, 52, 0.2)',
    borderRadius: '6px',
    height: 12,
    opacity: 1,
  },
  '& .MuiSlider-thumb': {
    height: 40,
    width: 40,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    backgroundImage: 'url(/book-custom.svg)',
    backgroundSize: '40px 40px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    filter: 'none', // Remove the filter
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: '0 0 0 8px rgba(0, 110, 52, 0.16)',
      border: 'none',
    },
    '&:before': {
      display: 'none',
    },
  },
});

// Floating donate button
const FloatingButton = styled(Button)({
  background: 'linear-gradient(45deg, #006e34 0%, #004d24 50%, #003318 100%)',
  border: 0,
  borderRadius: '30px',
  boxShadow: '0 8px 20px rgba(0, 110, 52, 0.4), 0 4px 8px rgba(0,0,0,0.1)',
  color: '#fffcec',
  height: 64,
  padding: '0 40px',
  fontSize: '18px',
  fontWeight: 'bold',
  animation: `${float} 4s ease-in-out infinite`,
  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 12px 25px rgba(0, 110, 52, 0.5), 0 6px 12px rgba(0,0,0,0.15)',
    background: 'linear-gradient(45deg, #004d24 0%, #003318 50%, #002112 100%)',
  },
});

// Leaderboard data
const leaderboardData = [
  { id: 1, name: "Sarah Chen", amount: 450, rank: 1, level: "Champion", isCurrentUser: false },
  { id: 2, name: "Michael Rodriguez", amount: 380, rank: 2, level: "Hero", isCurrentUser: false },
  { id: 3, name: "Emma Thompson", amount: 320, rank: 3, level: "Hero", isCurrentUser: false },
  { id: 4, name: "You", amount: 120, rank: 4, level: "Supporter", isCurrentUser: true },
  { id: 5, name: "David Park", amount: 95, rank: 5, level: "Friend", isCurrentUser: false },
  { id: 6, name: "Lisa Wang", amount: 75, rank: 6, level: "Friend", isCurrentUser: false },
  { id: 7, name: "James Wilson", amount: 50, rank: 7, level: "Starter", isCurrentUser: false },
];

// Leaderboard Container
const LeaderboardContainer = styled(Paper)({
  background: 'linear-gradient(135deg, #fffcec 0%, #f5f2e0 100%)',
  borderRadius: '24px',
  border: '2px solid rgba(0, 110, 52, 0.2)',
  padding: '20px',
  marginTop: '20px',
  boxShadow: '0 15px 30px rgba(0, 110, 52, 0.15), 0 6px 12px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
});

// Top 3 Podium Container
const PodiumContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'end',
  marginBottom: '20px',
  gap: '15px',
});

// Podium Item
const PodiumItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'rank',
})<{ rank: number }>(({ rank }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
}));

// Podium Bar
const PodiumBar = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'rank',
})<{ rank: number }>(({ rank }) => ({
  width: '60px',
  height: rank === 1 ? '80px' : rank === 2 ? '65px' : '50px',
  background: rank === 1 
    ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
    : rank === 2 
    ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)'
    : 'linear-gradient(135deg, #CD7F32, #A0522D)',
  borderRadius: '8px 8px 0 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  fontWeight: 'bold',
  color: 'white',
  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
}));

// Avatar Container
const AvatarContainer = styled(Box)({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  overflow: 'hidden',
  border: '2px solid #fff',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  marginBottom: '8px',
  background: 'linear-gradient(45deg, #006e34, #004d24)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '16px',
  fontWeight: 'bold',
});

// Leaderboard List Item
const LeaderboardItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCurrentUser',
})<{ isCurrentUser?: boolean }>(({ isCurrentUser }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '12px',
  marginBottom: '6px',
  background: isCurrentUser 
    ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.1))'
    : 'rgba(255, 255, 255, 0.6)',
  border: isCurrentUser ? '2px solid #FF9800' : '1px solid rgba(0, 110, 52, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 110, 52, 0.15)',
  }
}));

// Crown icon for top ranks
const CrownIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'rank',
})<{ rank: number }>(({ rank }) => ({
  position: 'absolute',
  top: '-10px',
  fontSize: rank === 1 ? '24px' : '20px',
  zIndex: 10,
}));

// Simple helper arrays removed fancy styling; using standard Select components

export default function DonatePage() {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('50');
  const [region, setRegion] = useState<string>('');
  const [school, setSchool] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<'choose'|'login'|'confirm'>('choose');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{open:boolean; message:string; severity:'success'|'error'}>({open:false,message:'',severity:'success'});
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [lastDonationId, setLastDonationId] = useState<string | null>(null);

  const regionSchools: Record<string, string[]> = {
    'Kwai Tsing': [
      'Asbury Methodist Primary School',
      'Buddhist Lim Kim Tian Memorial Primary School',
      'CCC Chuen Yuen Second Primary School',
      'CCC Kei Chun Primary School',
      'Cho Yiu Catholic Primary School',
      'CNEC Lui Ming Choi Primary School',
      'CNEC Ta Tung School'
    ],
    'Sham Shui Po': [
      'Sham Shui Po Government Primary School'
    ],
    'Kwun Tong': [
      'Kwun Tong Government Primary School',
      'Bishop Paschang Catholic School',
      'Buddhist Chi King Primary School'
    ]
  };

  const sliderMarks = [
    { value: 1, label: '$1' },
    { value: 50, label: '$50' },
    { value: 250, label: '$250' },
    { value: 500, label: '$500' },
  ];

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    setAmount(value);
    setCustomAmount(value.toString()); // Sync custom amount with slider
  };

  const handleCustomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Prevent negative values and non-numeric input
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setCustomAmount(value);
      
      // Update slider if value is valid and within range
      if (value !== '' && !isNaN(Number(value))) {
        const numValue = Math.max(0, Number(value)); // Ensure non-negative
        setAmount(Math.min(Math.max(numValue, 1), 500)); // Keep slider in bounds but allow custom amount to exceed
      }
    }
  };

  const getActiveCardIndex = () => {
    if (amount <= 50) return 0;
    if (amount <= 250) return 1;
    return 2;
  };

  const getCardRotation = (index: number, activeIndex: number) => {
    const offset = (index - activeIndex) * 20;
    return offset;
  };

  const getMessage = () => {
    const currentAmount = customAmount && !isNaN(Number(customAmount)) ? parseFloat(customAmount) : amount;
    if (currentAmount >= 500) return "You're a true champion of education!";
    if (currentAmount >= 250) return "Your generosity will transform many lives!";
    if (currentAmount >= 50) return "Thank you for making education accessible!";
    if (currentAmount > 0) return "Every dollar counts in changing a child's future!";
    return "Enter an amount to see your impact!";
  };

  const displayAmount = customAmount && !isNaN(Number(customAmount)) && Number(customAmount) > 0 
    ? `$${customAmount}` 
    : `$${amount}`;
  const numericAmount = customAmount && !isNaN(Number(customAmount)) && Number(customAmount) > 0 ? Number(customAmount) : amount;

  // Track auth state
  React.useEffect(()=>{
    const unsub = onAuthStateChanged(auth, (u)=> setCurrentUser(u));
    return () => unsub();
  },[]);

  // Submit anonymous donation
  const submitAnonymous = async () => {
    const res = await fetch('/api/donations', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        amount: numericAmount,
        displayName: 'Anonymous',
        email: `anonymous+${Date.now()}@donor.local`,
        message: `${school || ''}${school && region ? ', ' : ''}${region || ''}` || '-',
        region,
        school
      })
    });
    if(!res.ok){
      const data = await res.json().catch(()=>({error:'Unknown error'}));
      throw new Error(data.error || 'Donation failed');
    }
    const data = await res.json();
    setLastDonationId(data.id || null);
    setDialogOpen(false);
    setThankYouOpen(true);
  };

  const handleLogin = async () => {
    if(!isEmailValid(userEmail)) { setSnackbar({open:true, message:'Invalid email', severity:'error'}); return; }
    try {
      setSubmitting(true);
      await signInWithEmailAndPassword(auth, userEmail, userPassword);
      setSnackbar({open:true, message:'Logged in. Please confirm donation.', severity:'success'});
      setDialogStep('confirm');
    } catch(e:any){
      setSnackbar({open:true, message:e.message || 'Login failed', severity:'error'});
    } finally {
      setSubmitting(false);
    }
  };

  const submitAuthed = async () => {
    if(!currentUser) return;
    const res = await fetch('/api/donations', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        amount: numericAmount,
        displayName: currentUser.displayName || currentUser.email || '-',
        email: currentUser.email || `user+${Date.now()}@donor.local`,
        message: `${school || ''}${school && region ? ', ' : ''}${region || ''}` || '-',
        region,
        school
      })
    });
    if(!res.ok){
      const data = await res.json().catch(()=>({error:'Unknown error'}));
      throw new Error(data.error || 'Donation failed');
    }
    const data = await res.json();
    setLastDonationId(data.id || null);
    setDialogOpen(false);
    setThankYouOpen(true);
  };

  const handleRegionChange = (e: any) => {
    const newRegion = e.target.value as string;
    setRegion(newRegion);
    setSchool(''); // reset school
  };

  const handleSchoolChange = (e: any) => {
    setSchool(e.target.value as string);
  };

  return (
    <StyledContainer>
      <GlassCard elevation={0}>
        {/* Two-Column Layout Container */}
        <Box sx={{ 
          display: 'flex',
          gap: 4,
          alignItems: 'stretch',
          minHeight: '70vh',
          '@media (max-width: 968px)': {
            flexDirection: 'column',
            gap: 2,
            minHeight: 'auto',
          }
        }}>
          
          {/* Left Column - Rotating Picture Cards */}
          <Box sx={{ 
            flex: '0 0 40%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            '@media (max-width: 968px)': {
              flex: '1 1 auto',
              minHeight: '300px',
            }
          }}>
            <Grow in timeout={1000}>
              <RotatingCardsContainer sx={{ 
                transform: 'scale(1)',
              }}>
                {images.map((img, index) => {
                  const activeIndex = getActiveCardIndex();
                  const isActive = index === activeIndex;
                  const rotation = getCardRotation(index, activeIndex);
                  const zIndex = isActive ? 10 : Math.max(5 - Math.abs(index - activeIndex), 1);
                  
                  return (
                    <RotatingCard 
                      key={index}
                      isActive={isActive}
                      rotation={rotation}
                      zIndex={zIndex}
                    >
                      <img src={img.src} alt={img.alt} />
                      <CardOverlay isActive={isActive}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: '#fffcec',
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                            fontSize: { xs: '0.8rem', md: '1rem' }
                          }}
                        >
                          {img.impact}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#fffcec',
                            opacity: 0.9,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                            mt: 0.5,
                            fontSize: { xs: '0.7rem', md: '0.8rem' }
                          }}
                        >
                          {img.alt}
                        </Typography>
                      </CardOverlay>
                    </RotatingCard>
                  );
                })}
              </RotatingCardsContainer>
            </Grow>
          </Box>

          {/* Right Column - All Donation Controls */}
          <Box sx={{ 
            flex: '0 0 55%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: { xs: 1, md: 2 },
            '@media (max-width: 968px)': {
              flex: '1 1 auto',
              px: 1,
            }
          }}>
            
            {/* Title */}
            <Fade in timeout={1000}>
              <Typography 
                variant="h2" 
                align="center" 
                sx={{ 
                  color: '#006e34',
                  fontWeight: '800',
                  textShadow: '3px 3px 6px rgba(0, 110, 52, 0.3)',
                  mb: 1,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontFamily: 'var(--font-inter), sans-serif'
                }}
              >
                Transform Lives Today ✨
              </Typography>
            </Fade>
            
            <Fade in timeout={1100}>
              <Typography 
                variant="h6" 
                align="center" 
                sx={{ 
                  color: '#006e34',
                  fontWeight: '400',
                  mb: 2,
                  opacity: 0.9,
                  fontStyle: 'italic',
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                Every donation creates ripples of hope
              </Typography>
            </Fade>

            {/* Amount Display */}
            <Fade in timeout={1200}>
              <AmountDisplay variant="h4" sx={{ mb: 2 }}>
                {displayAmount}
              </AmountDisplay>
            </Fade>

            {/* Amount Slider */}
            <Grow in timeout={1400}>
              <Box sx={{ px: { xs: 1, md: 2 }, mb: 2 }}>
                <Typography 
                  gutterBottom 
                  sx={{ 
                    color: '#006e34', 
                    fontWeight: '600',
                    fontSize: { xs: '14px', md: '16px' },
                    textShadow: '1px 1px 3px rgba(0, 110, 52, 0.2)',
                    mb: 1,
                    textAlign: 'center'
                  }}
                >
                  Select your impact level:
                </Typography>
                <Box sx={{ px: { xs: 1, md: 2 } }}>
                  <StyledSlider
                    value={amount}
                    onChange={handleSliderChange}
                    step={1}
                    marks={sliderMarks}
                    min={1}
                    max={500}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `$${value}`}
                    sx={{ mb: 2 }}
                  />
                </Box>

                {/* Dynamic Message */}
                {getMessage() && (
                  <Fade in timeout={1700}>
                    <Typography 
                      variant="body1" 
                      align="center"
                      sx={{ 
                        color: '#006e34',
                        fontWeight: '600',
                        fontStyle: 'italic',
                        textShadow: '1px 1px 2px rgba(0, 110, 52, 0.1)',
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        mt: 1,
                        mb: 1,
                        opacity: 0.9
                      }}
                    >
                      🌟 {getMessage()}
                    </Typography>
                  </Fade>
                )}
              </Box>
            </Grow>

            {/* Custom Amount Input - Always visible */}
            <Fade in timeout={1600}>
              <Box sx={{ px: { xs: 1, md: 2 }, mb: 2 }}>
                <TextField
                  label="Enter a custom amount"
                  type="number"
                  value={customAmount}
                  onChange={handleCustomChange}
                  fullWidth
                  inputProps={{
                    min: 0,
                    step: 1,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#006e34',
                      },
                      '&:hover fieldset': {
                        borderColor: '#006e34',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#006e34',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#006e34',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#006e34',
                    },
                  }}
                  helperText="Amount will sync with the slider above"
                />
              </Box>
            </Fade>

            {/* Donate Button */}
            {/* Region & School Dropdowns (below amount input, above donate button) */}
            <Fade in timeout={1850}>
              <Box sx={{ display: 'flex', flexDirection: { xs:'column', sm:'row' }, gap: 2, px: { xs:1, md:2 }, mb:2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="region-label" sx={{ color:'#006e34' }}>Region</InputLabel>
                  <Select
                    labelId="region-label"
                    label="Region"
                    value={region}
                    onChange={(e) => { setRegion(e.target.value); setSchool(''); }}
                    sx={{
                      background:'#fff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor:'rgba(0,110,52,0.35)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor:'#006e34' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor:'#004d24', boxShadow:'0 0 0 2px rgba(0,110,52,0.2)' }
                    }}
                  >
                    {Object.keys(regionSchools).map(r => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" disabled={!region}>
                  <InputLabel id="school-label" sx={{ color:'#006e34' }}>School</InputLabel>
                  <Select
                    labelId="school-label"
                    label="School"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    sx={{
                      background:'#fff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor:'rgba(0,110,52,0.35)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor:'#006e34' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor:'#004d24', boxShadow:'0 0 0 2px rgba(0,110,52,0.2)' }
                    }}
                  >
                    {(region ? regionSchools[region] : []).map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Fade>
            {(region || school) && (
              <Fade in timeout={1680}>
                <Box sx={{ px: { xs:1, md:2 }, mb:2, display:'flex', gap:1, flexWrap:'wrap', alignItems:'center' }}>
                  <Typography variant="caption" sx={{ fontWeight:600, color:'#006e34' }}>Selected:</Typography>
                  {region && (
                    <Chip size="small" label={region} sx={{ background:'linear-gradient(45deg,#006e34,#004d24)', color:'#fffcec', fontWeight:600 }} />
                  )}
                  {school && (
                    <Chip size="small" label={school} sx={{ background:'linear-gradient(45deg,#006e34,#004d24)', color:'#fffcec', fontWeight:600 }} />
                  )}
                </Box>
              </Fade>
            )}

            {/* Donate Button */}
            <Fade in timeout={1700}>
              <Box sx={{ px: { xs: 1, md: 2 }, mb: 2 }}>
                <Button 
                  disabled={!region || !school}
                  onClick={() => setDialogOpen(true)}
                  className="w-full"
                  size='medium'
                >
                  {region && school ? `Donate ${displayAmount} Now 🚀` : 'Select Region & School'}
           
                </Button>
              </Box>
            </Fade>

            {/* Security Message */}
            <Fade in timeout={1800}>
              <Typography 
                variant="body2" 
                align="center" 
                sx={{ 
                  color: '#006e34',
                  opacity: 0.7,
                  fontStyle: 'italic',
                  fontSize: { xs: '0.8rem', md: '0.9rem' },
                  px: { xs: 1, md: 2 }
                }}
              >
                💝 Your generosity makes education accessible to all children
              </Typography>
            </Fade>

          </Box>
        </Box>

        {/* Original Leaderboard with Podium Bars */}
        <Fade in timeout={1800}>
          <LeaderboardContainer elevation={0}>
            <Typography 
              variant="h5" 
              align="center" 
              sx={{ 
                color: '#006e34',
                fontWeight: '600',
                mb: 2,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontFamily: 'var(--font-inter), sans-serif',
                letterSpacing: '0.05em',
              }}
            >
              🏆 Donation Leaderboard
            </Typography>

            {/* Top 3 Podium with Bars */}
            <PodiumContainer>
              {leaderboardData.slice(0, 3).map((donor, index) => {
                const rank = index === 1 ? 1 : index === 0 ? 2 : 3; // Center is 1st, left is 2nd, right is 3rd
                const actualDonor = leaderboardData[rank - 1];
                return (
                  <PodiumItem key={actualDonor.id} rank={rank}>
                    {rank <= 3 && (
                      <CrownIcon rank={rank}>
                        {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
                      </CrownIcon>
                    )}
                    <AvatarContainer>
                      {actualDonor.name.charAt(0)}
                    </AvatarContainer>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: '600', 
                        color: '#006e34',
                        textAlign: 'center',
                        mb: 0.5,
                        fontSize: '12px'
                      }}
                    >
                      {actualDonor.name}
                    </Typography>
                    <PodiumBar rank={rank}>
                      {rank}
                    </PodiumBar>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: '#006e34',
                        mt: 0.5,
                        fontSize: '12px'
                      }}
                    >
                      ${actualDonor.amount}
                    </Typography>
                  </PodiumItem>
                );
              })}
            </PodiumContainer>

            {/* Current User Highlight */}
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#FF9800',
                  fontWeight: '600',
                  mb: 1,
                  textAlign: 'center',
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                Your Position
              </Typography>
              {leaderboardData
                .filter(donor => donor.isCurrentUser)
                .map((donor) => (
                  <LeaderboardItem key={donor.id} isCurrentUser={true}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        minWidth: '30px',
                        fontWeight: 'bold',
                        color: '#FF9800',
                        mr: 2,
                        fontSize: '14px'
                      }}
                    >
                      #{donor.rank}
                    </Typography>
                    <AvatarContainer sx={{ width: '32px', height: '32px', mr: 2, fontSize: '14px' }}>
                      {donor.name.charAt(0)}
                    </AvatarContainer>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: '600',
                          color: '#006e34',
                          fontSize: '14px'
                        }}
                      >
                        {donor.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#FF9800',
                          fontSize: '10px'
                        }}
                      >
                        {donor.level} Level
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: '#006e34',
                        fontSize: '14px'
                      }}
                    >
                      ${donor.amount}
                    </Typography>
                  </LeaderboardItem>
                ))}
            </Box>

            {/* Full Leaderboard List */}
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#006e34',
                fontWeight: '600',
                mb: 1,
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}
            >
              All Donors
            </Typography>
            {leaderboardData.slice(0, 7).map((donor) => (
              <LeaderboardItem key={donor.id} isCurrentUser={donor.isCurrentUser}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    minWidth: '25px',
                    fontWeight: 'bold',
                    color: donor.isCurrentUser ? '#FF9800' : '#006e34',
                    mr: 2,
                    fontSize: '12px'
                  }}
                >
                  {String(donor.rank).padStart(2, '0')}
                </Typography>
                <AvatarContainer sx={{ width: '32px', height: '32px', mr: 2, fontSize: '14px' }}>
                  {donor.name.charAt(0)}
                </AvatarContainer>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: donor.isCurrentUser ? '700' : '500',
                      color: '#006e34',
                      fontSize: '12px'
                    }}
                  >
                    {donor.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: donor.rank <= 3 ? '#FFD700' : '#006e34',
                      fontSize: '10px',
                      opacity: 0.8
                    }}
                  >
                    {donor.level} Level
                  </Typography>
                </Box>
                {donor.rank <= 3 && (
                  <Box sx={{ mr: 1, fontSize: '14px' }}>
                    {donor.rank === 1 ? '👑' : donor.rank === 2 ? '🥈' : '🥉'}
                  </Box>
                )}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: donor.isCurrentUser ? '#FF9800' : '#006e34',
                    fontSize: '12px'
                  }}
                >
                  ${donor.amount}
                </Typography>
              </LeaderboardItem>
            ))}

            <Typography 
              variant="body2" 
              align="center" 
              sx={{ 
                mt: 2,
                color: '#006e34',
                opacity: 0.7,
                fontStyle: 'italic',
                fontSize: '10px'
              }}
            >
              🌟 Donate more to climb the leaderboard and unlock new levels!
            </Typography>
          </LeaderboardContainer>
        </Fade>

      </GlassCard>
      {/* Donation Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { position:'relative', borderRadius: 5, pb: 2, background:'linear-gradient(135deg,#fffcec 0%, #f5f2e8 100%)', border:'1px solid rgba(0,110,52,0.25)' } }}>
        <IconButton size="small" onClick={()=>!submitting && setDialogOpen(false)} sx={{ position:'absolute', top:6, right:6, color:'#006e34', opacity:0.6, '&:hover':{opacity:1}}}><Close fontSize="small" /></IconButton>
        <DialogTitle sx={{ fontWeight:800, color:'#006e34', textAlign:'center', pb:1 }}>Donation</DialogTitle>
        <DialogContent>
          <Stepper activeStep={ dialogStep === 'choose' ? 0 : dialogStep === 'login' ? 1 : 2 } alternativeLabel sx={{ mb:2 }}>
            <Step><StepLabel>Select</StepLabel></Step>
            <Step><StepLabel>Login</StepLabel></Step>
            <Step><StepLabel>Confirm</StepLabel></Step>
          </Stepper>
          {dialogStep === 'choose' && (
            <Box sx={{ textAlign:'center' }}>
              <Typography variant="h6" sx={{ fontWeight:700, color:'#004d24' }}>{displayAmount}</Typography>
              <Typography variant="body2" sx={{ mt:1, color:'#006e34', opacity:0.8 }}>{school && region ? `${school}, ${region}` : 'Selected beneficiary'}</Typography>
              <Typography variant="body2" sx={{ mt:2, color:'#006e34', fontStyle:'italic' }}>Log in to appear on the leaderboard, or donate quietly.</Typography>
              <Box sx={{ display:'flex', gap:1, justifyContent:'center', flexWrap:'wrap', mt:2 }}>
                {region && <Chip size="small" label={region} />}
                {school && <Chip size="small" label={school} />}
              </Box>
              <Box sx={{ mt:3, display:'flex', flexDirection:'column', gap:1.5 }}>
                <Button variant="contained" fullWidth onClick={()=> setDialogStep('login')} sx={{ background:'linear-gradient(45deg,#006e34,#004d24)', fontWeight:700, '&:hover':{ background:'linear-gradient(45deg,#004d24,#003318)'} }}>Log In</Button>
                <Button variant="text" fullWidth disabled={submitting} onClick={async ()=>{
                  try { setSubmitting(true); await submitAnonymous(); } finally { setSubmitting(false);} }} sx={{ fontWeight:600, color:'#004d24', opacity:0.75, textTransform:'none', '&:hover':{ opacity:1, background:'rgba(0,110,52,0.06)' } }}>{submitting ? <CircularProgress size={18} /> : 'Donate Anonymously'}</Button>
              </Box>
            </Box>
          )}
          {dialogStep === 'login' && (
            <Box component="form" onSubmit={async (e)=>{ e.preventDefault(); await handleLogin(); }} sx={{ mt:1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight:600, mb:1, color:'#006e34', textAlign:'center' }}>Login to Continue</Typography>
              <TextField label="Email" type="email" value={userEmail} onChange={e=>setUserEmail(e.target.value)} fullWidth size="small" sx={{ mb:2 }} required />
              <TextField label="Password" type={showPassword?'text':'password'} value={userPassword} onChange={e=>setUserPassword(e.target.value)} fullWidth size="small" required 
                InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={()=>setShowPassword(s=>!s)}>{showPassword? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
              <Box sx={{ display:'flex', gap:1.5, mt:3 }}>
                <Button onClick={()=> setDialogStep('choose')} variant="outlined" color="inherit" fullWidth disabled={submitting}>Back</Button>
                <Button type="submit" variant="contained" fullWidth disabled={submitting || !userEmail || !userPassword} sx={{ background:'linear-gradient(45deg,#006e34,#004d24)', fontWeight:700 }}>{submitting? <CircularProgress size={20} /> : 'Login'}</Button>
              </Box>
            </Box>
          )}
          {dialogStep === 'confirm' && (
            <Box sx={{ textAlign:'center' }}>
              <Typography variant="h6" sx={{ fontWeight:700, color:'#004d24' }}>{displayAmount}</Typography>
              <Typography variant="body2" sx={{ mt:1, color:'#006e34', opacity:0.8 }}>{school && region ? `${school}, ${region}` : ''}</Typography>
              <Typography variant="body2" sx={{ mt:2, color:'#006e34' }}>Donating as <strong>{currentUser?.email}</strong></Typography>
              <Box sx={{ display:'flex', gap:1, justifyContent:'center', flexWrap:'wrap', mt:2 }}>
                {region && <Chip size="small" label={region} />}
                {school && <Chip size="small" label={school} />}
              </Box>
              <Box sx={{ mt:3, display:'flex', gap:1.5 }}>
                <Button onClick={()=> setDialogStep('choose')} variant="outlined" color="inherit" fullWidth disabled={submitting}>Back</Button>
                <Button fullWidth variant="contained" disabled={submitting} onClick={async ()=>{ try{ setSubmitting(true); await submitAuthed(); } finally { setSubmitting(false);} }} sx={{ background:'linear-gradient(45deg,#006e34,#004d24)', fontWeight:700 }}>{submitting ? <CircularProgress size={20} /> : 'Confirm Donation'}</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(s => ({...s, open:false}))} anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert onClose={() => setSnackbar(s => ({...s, open:false}))} severity={snackbar.severity} variant="filled" sx={{ width:'100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Thank You Dialog */}
      <Dialog open={thankYouOpen} onClose={()=> setThankYouOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx:{ borderRadius:5, background:'linear-gradient(135deg,#fffcec 0%, #f5f2e8 100%)', p:2, textAlign:'center', border:'1px solid rgba(0,110,52,0.25)' } }}>
        <DialogTitle sx={{ fontWeight:800, color:'#006e34', pb:1 }}>Thank You! 💚</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ fontWeight:700, color:'#004d24' }}>{displayAmount} Donated</Typography>
          {school && region && (
            <Typography variant="body2" sx={{ mt:1, color:'#006e34' }}>{school}, {region}</Typography>
          )}
          <Typography variant="body2" sx={{ mt:2, color:'#006e34', opacity:0.85 }}>
            Your support helps empower students and teachers. {currentUser ? 'You\'ll appear on the leaderboard shortly.' : 'Anonymous gifts still make a big impact.'}
          </Typography>
          {lastDonationId && (
            <Typography variant="caption" sx={{ mt:2, display:'block', color:'#006e34', opacity:0.6 }}>Ref: {lastDonationId}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent:'center' }}>
          <Button onClick={()=> setThankYouOpen(false)} variant="contained" sx={{ background:'linear-gradient(45deg,#006e34,#004d24)', fontWeight:700 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
}

// Helper functions appended (within same file scope not exported)
function isEmailValid(email:string){ return /.+@.+\..+/.test(email); }
