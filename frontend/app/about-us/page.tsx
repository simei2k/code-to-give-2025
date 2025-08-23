"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Box, Container, Grid, Paper, Typography, Fade, Grow,
  IconButton, Tooltip, Divider, useMediaQuery, useTheme
} from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Team member data
const teamMembers = [
  {
    name: "Vivian Chung",
    title: "Co-Founder",
    image: "/vivian.jpg", 
    bio: `Vivian Chung is an award-winning education specialist with 20+ years of experience teaching 
    English reading and writing through the use of story books. She holds an MA in Psychology in 
    Education from Columbia University and is the Director of Story Jungle Education Centre and 
    the Founder of REACH Charity. She serves as a Reading Consultant & Teacher Trainer for 
    kindergarten, primary, and secondary schools throughout Hong Kong and is a top-rated 
    Parents Seminar Speaker promoting home literacy and shared reading strategies. In 2021, 
    Vivian received the Women of Excellence award from the South China Media Group honouring 
    her work and contributions in the field of education.`,
    quote: `"It is my belief that the best gift for children is reading as it enables 
    learning and accessibility to knowledge, opportunities and ideas. My hope 
    is that all of my students can obtain this power and use it to anchor 
    their foundation, so that each and every one of them can grow to 
    incredible heights, allowing them the widest and greatest visions in life."`
  },
  {
    name: "Quincy Tse",
    title: "Co-Founder",
    role: "Director of Outreach",
    image: "/quincy.jpg", 
    bio: `Quincy Tse has 15 years of experience in global Fintechs specialising in offering financial data 
    and analytics, and web-based applications for financial institutions. Quincy also served as 
    Director of Special Projects at a Fortune 500 company, where he was responsible for project 
    management, International Public Relations and Government Affairs.
    
    Outside work, Quincy has over 18 years of experience co-running education charities. Prior to 
    REACH, he spent 9 years as Council Member of Access HK, a charity which provides English 
    tuition to underprivileged primary school students in Hong Kong. He earned his BSc in 
    Mathematics and Statistics from Imperial College London, and MSc in Statistics from University 
    College London.`
  },
  {
    name: "Sally Ng",
    title: "Co-Founder",
    role: "Honorary Education Consultant",
    image: "/sally.png", 
    bio: `Sally Ng joined Story Jungle Education Centre as a Native English teacher in 2007 and is 
    currently the Education Consultant. She conducts lessons for students in the United Kingdom, 
    United States, and Hong Kong and serves as a consultant to students applying to university and 
    parents wishing to send their children to schools in the UK. Born in the UK, Sally completed her 
    high school education in a prestigious UK boarding school and graduated from the University 
    of London. Having spent a number of years studying in St. Mary's Cainossian School, she is 
    familiar with the Hong Kong school system and understands through first-hand experience the 
    struggles that Hong Kong students encounter.
    
    Sally has one-of-a-kind teaching style where she has shone a new light on English learning to 
    many students who were not fans of English at first. She is also an expert in developing 
    curriculum that is effective and enjoyable for students as she understands the efficacy of 
    positivity in motivating and helping students build confidence in English learning. Having vast 
    experience in the teaching field, she is quick to recognize and accommodate the individual 
    needs of each student even in a class setting.`,
    quote: `"Every child deserves quality education regardless 
    of socioeconomic background and gender."`
  },
  {
    name: "Myolie Lau",
    title: "Director of Education and Outreach",
    image: "/myolie.jpg", 
    bio: `Myolie Lau first joined REACH in 2022. In her previous educational experiences, she worked as 
    an English NET Teacher and spent most of her time with kindergarten students. She is in charge 
    of planning and implementing English learning programs for children. She also helps establish 
    and maintains relationships with partners, as well as assisting with proposal writing, fundraising 
    activities, outreach, and partnership discussions.
    
    As she understands that learning English might be a challenge for some children, she hopes to 
    teach and guide them to discover and appreciate the beauty of English. She hopes that with the 
    help of storybooks, kids could start to embrace this amazing language and step out of their 
    comfort zone.`,
    quote: `"Given the right opportunity and resources, I firmly belive that 
    every single child can shine, thrive, and live their lives to the fullest."`
  }
];

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState(0); // Start with team section active
  const [showScrollTop, setShowScrollTop] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Refs for each section to track visibility
  const sectionRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const handleScroll = () => {
      // Show/hide scroll to top button
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      // Update active section for animations
      sectionRefs.forEach((ref, index) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.9 && rect.bottom >= window.innerHeight * 0.05) {
            setActiveSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ 
      bgcolor: "#fffcec", 
      minHeight: "100vh", 
      pb: 8,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <Box sx={{ 
        position: 'absolute', 
        top: '5%', 
        right: '-5%', 
        width: '300px', 
        height: '300px', 
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,110,52,0.05) 0%, rgba(0,110,52,0) 70%)',
        zIndex: 0
      }} />
      
      <Box sx={{ 
        position: 'absolute', 
        bottom: '15%', 
        left: '-10%', 
        width: '400px', 
        height: '400px', 
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,110,52,0.03) 0%, rgba(0,110,52,0) 70%)',
        zIndex: 0
      }} />

      {/* Scroll to top button */}
      <Fade in={showScrollTop}>
        <IconButton 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            bgcolor: '#006e34',
            color: 'white',
            '&:hover': {
              bgcolor: '#005a2b',
            },
            zIndex: 10,
            boxShadow: 3
          }}
          onClick={scrollToTop}
        >
          <ArrowUpwardIcon />
        </IconButton>
      </Fade>

      <Box sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="md">
          {/* Meet Our Team Section */}
          <Grow in={activeSection >= 0} timeout={800}>
            <Box ref={sectionRefs[0]}>
              <Box sx={{ position: 'relative', mb: 5 }}>
                <Typography 
                  variant="h3" 
                  align="center" 
                  fontWeight="bold" 
                  sx={{ 
                    color: "#006e34", 
                    mb: 1,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  Meet Our Team
                </Typography>
                
                <Divider sx={{ 
                  width: '80px', 
                  mx: 'auto', 
                  borderColor: '#006e34', 
                  borderWidth: 3,
                  borderRadius: 1,
                  mb: 4
                }} />
                
                <Typography 
                  variant="body1"
                  align="center"
                  sx={{
                    maxWidth: '600px',
                    mx: 'auto',
                    mb: 6,
                    color: '#555'
                  }}
                >
                  Our passionate team is dedicated to improving English education and creating opportunities
                  for children across Hong Kong.
                </Typography>
              </Box>

              {/* Team Members with staggered animations */}
              {teamMembers.map((member, index) => (
                <Fade 
                  in={activeSection >= 0} 
                  style={{ transitionDelay: `${100 * index}ms` }}
                  key={index}
                >
                  <Box 
                    sx={{ 
                      mb: 8,
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: { xs: 'center', md: 'flex-start' },
                      backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
                      borderRadius: 3,
                      p: { xs: 2, md: 3 },
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: index % 2 === 0 ? '0 10px 30px rgba(0,0,0,0.08)' : 'none'
                      }
                    }}
                  >
                    {/* Profile Image and Title */}
                    <Box 
                      sx={{ 
                        width: { xs: '200px', md: '220px' },
                        mb: { xs: 3, md: 0 },
                        mr: { xs: 0, md: 4 },
                        textAlign: 'center'
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          paddingBottom: '100%',
                          position: 'relative',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '4px solid white',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                          margin: '0 auto',
                          transition: 'transform 0.5s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          style={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            transition: 'transform 0.8s ease',
                          }} 
                        />
                      </Box>
                      <Typography 
                        variant="h5" 
                        fontWeight="bold" 
                        sx={{ mt: 2, color: '#006e34' }}
                      >
                        {member.name}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#006e34', 
                          fontWeight: 500,
                          mb: 0.5
                        }}
                      >
                        {member.title}
                      </Typography>
                      {member.role && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#006e34',
                            opacity: 0.9
                          }}
                        >
                          {member.role}
                        </Typography>
                      )}
                    </Box>

                    {/* Bio and Quote */}
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 3,
                          whiteSpace: 'normal',
                          color: '#333',
                          fontSize: '1rem',
                          lineHeight: 1.7,
                          letterSpacing: '0.01em'
                        }}
                      >
                        {member.bio}
                      </Typography>

                      {member.quote && (
                        <Paper
                          elevation={2}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            borderLeft: '4px solid #006e34',
                            mt: 3,
                            mx: { xs: 0, md: 2 },
                            position: 'relative',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          {/* Opening quote mark */}
                          <Typography 
                            component="span"
                            sx={{ 
                              position: 'absolute',
                              top: -20,
                              left: 10,
                              fontSize: '3.5rem',
                              color: 'rgba(0, 110, 52, 0.15)',
                              fontFamily: 'Georgia, serif',
                              lineHeight: 1
                            }}
                          >
                            "
                          </Typography>
                          
                          {/* Quote text */}
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontStyle: 'italic',
                              whiteSpace: 'normal',
                              color: '#333',
                              textAlign: 'center',
                              fontSize: '1.05rem',
                              lineHeight: 1.6,
                              position: 'relative',
                              zIndex: 1
                            }}
                          >
                            {member.quote.replace(/^"/, '').replace(/"$/, '')}
                          </Typography>
                          
                          {/* Closing quote mark */}
                          <Typography 
                            component="span"
                            sx={{ 
                              position: 'absolute',
                              bottom: -35,
                              right: 10,
                              fontSize: '3.5rem',
                              color: 'rgba(0, 110, 52, 0.15)',
                              fontFamily: 'Georgia, serif',
                              lineHeight: 1,
                              transform: 'rotate(180deg)'
                            }}
                          >
                            "
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </Box>
                </Fade>
              ))}
            </Box>
          </Grow>

          {/* Partners and Sponsors Sections with animations */}
          <Grow in={activeSection >= 1} timeout={800}>
            <Box ref={sectionRefs[1]}>
              {/* Our Official Partners Section */}
              <Box sx={{ mb: 10 }}>
                <Typography 
                  variant="h3" 
                  align="center" 
                  fontWeight="bold" 
                  sx={{ 
                    color: "#006e34", 
                    mb: 1,
                    mt: 8,
                    fontSize: { xs: '2rem', md: '2.5rem' }
                  }}
                >
                  Our Official Partners
                </Typography>
                
                <Divider sx={{ 
                  width: '80px', 
                  mx: 'auto', 
                  borderColor: '#006e34', 
                  borderWidth: 3,
                  borderRadius: 1,
                  mb: 4
                }} />

                <Box sx={{ 
                  bgcolor: 'rgba(255, 245, 201, 0.8)', 
                  py: 5, 
                  px: 3, 
                  borderRadius: 3, 
                  mb: 8,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  backdropFilter: 'blur(5px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: -40, 
                      right: -40, 
                      width: '200px', 
                      height: '200px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%'
                    }} 
                  />
                  
                  <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                    <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
                      <Paper
                        elevation={3}
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 3,
                          height: '100%',
                          width: '100%',
                          borderRadius: 2,
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-8px)'
                          }
                        }}
                      >
                        <Box sx={{ 
                          height: '120px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3,
                          p: 2
                        }}>
                          <img 
                            src="/city u.svg" 
                            alt="CityU Department of English" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '100%', 
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                            }}
                          />
                        </Box>
                        <Typography variant="subtitle1" align="center" fontWeight="bold">
                          Advisory on Impact Measurement
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                          Supporting our data-driven approach to English education
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
                      <Paper
                        elevation={3}
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 3,
                          height: '100%',
                          width: '100%',
                          borderRadius: 2,
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-8px)'
                          }
                        }}
                      >
                        <Box sx={{ 
                          height: '120px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3,
                          p: 2
                        }}>
                          <img 
                            src="/good rich tech.png" 
                            alt="Good Rich Technology Limited" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '100%', 
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                            }}
                          />
                        </Box>
                        <Typography variant="subtitle1" align="center" fontWeight="bold">
                          Data Analysis and Visualisation
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                          Empowering our work with AI-driven insights
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              {/* Our Sponsors Section */}
              <Box sx={{ mb: 10 }}>
                <Typography 
                  variant="h3" 
                  align="center" 
                  fontWeight="bold" 
                  sx={{ 
                    color: "#006e34", 
                    mb: 1,
                    fontSize: { xs: '2rem', md: '2.5rem' }
                  }}
                >
                  Our Sponsors
                </Typography>
                
                <Divider sx={{ 
                  width: '80px', 
                  mx: 'auto', 
                  borderColor: '#006e34', 
                  borderWidth: 3,
                  borderRadius: 1,
                  mb: 4
                }} />

                <Box sx={{ 
                  bgcolor: 'rgba(255, 234, 203, 0.8)', 
                  py: 5, 
                  px: 3, 
                  borderRadius: 3, 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  backdropFilter: 'blur(5px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Grid container spacing={3} justifyContent="center">
                    {[
                      { name: "Story Jungle Education Centre", location: "Hong Kong", img: "/story jungle.png" },
                      { name: "Time Auction", location: "Hong Kong", img: "/time auction.png" },
                      { name: "Egon Zehnder", location: "Hong Kong", img: "/egonzehnder.png" },
                      { name: "Allen & Overy", location: "Hong Kong", img: "/allen&overy.png" },
                      { name: "Charitable Choice", location: "Hong Kong", img: "/charitable choice.png" },
                      { name: "Warburg Pincus Asia", location: "Hong Kong", img: "/warburg pincus.png" }
                    ].map((sponsor, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper
                          elevation={2}
                          sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 3,
                            height: '100%',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                            }
                          }}
                        >
                          <Box sx={{
                            height: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3,
                            width: '100%'
                          }}>
                            <img 
                              src={sponsor.img} 
                              alt={sponsor.name} 
                              style={{ 
                                maxWidth: '85%', 
                                maxHeight: '85px', 
                                objectFit: 'contain',
                                filter: 'grayscale(20%)',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.filter = 'grayscale(0%)';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.filter = 'grayscale(20%)';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" align="center" fontWeight="bold" sx={{ mb: 0.5 }}>
                              {sponsor.name.split(" Hong Kong")[0]}
                            </Typography>
                            <Typography variant="body2" align="center" color="text.secondary">
                              {sponsor.location}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            </Box>
          </Grow>

          {/* Partnering Organizations Section */}
          <Grow in={activeSection >= 1} timeout={800}>
            <Box ref={sectionRefs[2]}>
              <Typography 
                variant="h3" 
                align="center" 
                fontWeight="bold" 
                sx={{ 
                  color: "#006e34", 
                  mb: 1,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                Partnering Organisations
              </Typography>
              
              <Divider sx={{ 
                width: '80px', 
                mx: 'auto', 
                borderColor: '#006e34', 
                borderWidth: 3,
                borderRadius: 1,
                mb: 4
              }} />

              <Box sx={{ 
                bgcolor: 'rgba(227, 240, 211, 0.8)', 
                py: 5, 
                px: 3, 
                borderRadius: 3, 
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                backdropFilter: 'blur(5px)',
                position: 'relative'
              }}>
              
                <Grid container spacing={3} justifyContent="center">
                  {[
                    { name: "Yan Oi Tong Pang Hung Cheung Kindergarten", img: "/yot pang hung.png", type: 'Schools' },
                    { name: "Yan Oi Tong Mrs Cheng Ting Kong Kindergarten", img: "/yot mrs cheng.png", type: 'Schools' },
                    { name: "Yan Oi Tong Dan Yang Wing Man Kindergarten", img: "/yot dan yang.png", type: 'Schools' },
                    { name: "Society for Community Organization", img: "/soco.png", type: 'NGOs' },
                    { name: "Hope of the City", img: "/hope of the city.png", type: 'NGOs' },
                    { name: "Asbury Methodist Social Service", img: "/asbury methodist social service.png", type: 'NGOs' },
                    { name: "Principal Chan Free Tutorial World", img: "/principal chan.png", type: 'NGOs' },
                    { name: "New Home Association", img: "/new home association.png", type: 'NGOs' },
                    { name: "HKU Department of Pharmacology", img: "/hku med.png", type: 'Universities' },
                    { name: "HKU Faculty of Social Sciences", img: "/faculty of social sciences.png", type: 'Universities' },
                    { name: "EdUHK Department of English", img: "/the education university of hong kong.png", type: 'Universities' }
                  ].map((org, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={500 + (index * 100)}>
                        <Paper 
                          elevation={2}
                          sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            p: 3,
                            height: '100%',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                            }
                          }}
                        >
                        <Box sx={{ 
                          height: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          width: '100%'
                        }}>
                          <img 
                            src={org.img} 
                            alt={org.name} 
                            style={{ 
                              maxWidth: '90%', 
                              maxHeight: '90px', 
                              objectFit: 'contain',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'scale(1.08)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          />
                        </Box>
                          <Typography 
                            variant="subtitle2" 
                            align="center" 
                            fontWeight="bold" 
                            sx={{ 
                              fontSize: '0.85rem',
                              lineHeight: 1.4
                            }}
                          >
                            {org.name}
                          </Typography>
                          <Box 
                            sx={{ 
                              mt: 2,
                              px: 2,
                              py: 0.5,
                              bgcolor: org.type === 'Schools' ? '#e3f2fd' : 
                                      org.type === 'NGOs' ? '#f1f8e9' : '#fff8e1',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}
                          >
                            {org.type}
                          </Box>
                        </Paper>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </Grow>
          
          <Fade in={true} timeout={800}>
            <Box ref={sectionRefs[3]} sx={{ mt: 10 }}>
              <Box 
                sx={{ 
                  display: 'table',
                  bgcolor: 'white',
                  px: 3, 
                  py: 1, 
                  alignItems: 'center',
                  borderRadius: 3,
                  mb: 2,
                  mx: 'auto',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  transform: 'translateY(20px)', // Starting position
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%': {
                      transform: 'translateY(0px)'
                    },
                    '50%': {
                      transform: 'translateY(-10px)'
                    },
                    '100%': {
                      transform: 'translateY(0px)'
                    }
                  }
                }}
              >
                <Typography 
                  variant="h4" 
                  component="h2" 
                  color="#006e34" 
                  align="center" 
                  fontWeight="bold"
                  sx={{
                    background: 'linear-gradient(45deg, #006e34 30%, #4caf50 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Contact Us
                </Typography>
              </Box>

              <Paper 
                elevation={6}
                sx={{ 
                  p: 4, 
                  borderRadius: 4,
                  position: 'relative',
                  background: 'white',
                  mb: 6,
                  maxWidth: '800px', // Added to limit width
                  mx: 'auto', // Added to center the card
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  align="center" 
                  sx={{ 
                    mb: 2,
                    color: '#006e34',
                    fontWeight: 600
                  }}
                >
                  We would love to hear from you!
                </Typography>
                <Typography 
                  variant="body1" 
                  align="center" 
                  sx={{ mb: 4, color: '#006e34' }}
                >
                  Please write or call us with your questions or comments.
                </Typography>
                  
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: { xs: 2, md: 0 },
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.03)'
                      }
                    }}>
                      <PhoneIcon sx={{ color: '#006e34', mr: 1.5, fontSize: '1.8rem' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="#006e34">
                          Phone:
                        </Typography>
                        <Typography variant="body1">
                          (852) 9198 3989 - Quincy Tse
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.03)'
                      }
                    }}>
                      <EmailIcon sx={{ color: '#006e34', mr: 1.5, fontSize: '1.8rem' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="#006e34">
                          Email:
                        </Typography>
                        <Typography variant="body1">
                          <a 
                            href="mailto:info@reach.org.hk" 
                            style={{ 
                              color: '#006e34', 
                              textDecoration: 'none',
                              borderBottom: '1px dotted #006e34'
                            }}
                          >
                            info@reach.org.hk
                          </a>
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid container spacing={3} justifyContent="left">
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: { xs: 2, md: 0 },
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.03)'
                      }
                    }}>
                      <LocationOnIcon sx={{ color: '#006e34', mr: 1.5, fontSize: '1.8rem' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" color="#006e34">
                          Address:
                        </Typography>
                        <Typography variant="body1">
                          Room 902, 9/F, 168 Queen&apos;s Road Central
                        </Typography>
                        <Typography variant="body1">
                          Central, Hong Kong
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ 
                  mt: 4, 
                  width: '100%', 
                  height: '200px', 
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.9071339578917!2d114.15252!3d22.2835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3404007b56b953a3%3A0x5c3f40f9004566e7!2s168%20Queen&#39;s%20Rd%20Central%2C%20Central%2C%20Hong%20Kong!5e0!3m2!1sen!2s!4v1692753591428!5m2!1sen!2s" 
                    width="100%" 
                    height="100%" 
                    style={{border:0}} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </Box>
              </Paper>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
}