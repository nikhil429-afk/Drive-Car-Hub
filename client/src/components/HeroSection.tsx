// src/components/HeroSection.tsx
import React from 'react';
import CtaCard from './CtaCard'; // Import the new CtaCard component

// --- Basic Inline Styles for Demonstration ---
const heroContainerStyles: React.CSSProperties = {
  // IMPORTANT: Replace the path with your actual image path from the 'public' folder
  backgroundImage: `url('/background.jpg')`, 
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  height: '100vh', 
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const overlayStyles: React.CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  padding: '100px 50px',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  marginTop: '-60px',
};

const titleStyles: React.CSSProperties = {
  fontSize: '3em',
  fontWeight: 700,
  letterSpacing: '2px',
  marginBottom: '10px',
};

const subtitleStyles: React.CSSProperties = {
  fontSize: '1.2em',
  marginBottom: '40px',
  opacity: 0.8,
};

const searchBarStyles: React.CSSProperties = {
  display: 'flex',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '5px',
  marginBottom: '50px',
  backdropFilter: 'blur(5px)', // Subtle visual enhancement
};

const inputStyles: React.CSSProperties = {
  padding: '15px 20px',
  border: 'none',
  background: 'transparent',
  color: 'white',
  borderRight: '1px solid rgba(255, 255, 255, 0.2)',
  appearance: 'none',
};

const searchButtonStyles: React.CSSProperties = {
  padding: '15px 30px',
  backgroundColor: '#D9534F',
  color: 'white',
  border: 'none',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const ctaGridStyles: React.CSSProperties = {
  display: 'flex',
  gap: '30px',
  marginBottom: '50px',
};

const HeroSection: React.FC = () => {
  return (
    <div style={heroContainerStyles}>
      <div style={overlayStyles}>
        <h1 style={titleStyles}>FIND YOUR NEXT ADVENTURE</h1>
        <p style={subtitleStyles}>QUALITY USED CARS, UNBEATABLE DEALS</p>

        {/* Search Bar */}
        <div style={searchBarStyles}>
          <select style={inputStyles} defaultValue="">
            <option value="" disabled>MAKE</option>
            <option>Toyota</option>
          </select>
          <select style={inputStyles} defaultValue="">
            <option value="" disabled>YEAR</option>
            <option>2020</option>
          </select>
          <input type="text" placeholder="PRICE RANGE" style={inputStyles} />
          <button style={searchButtonStyles}>SEARCH</button>
        </div>

        {/* Main CTA Cards using the imported component */}
        <div style={ctaGridStyles}>
          <CtaCard icon="🚗" title="BROWSE" description={''} />
          <CtaCard icon="📸" title="SELL YOUR CAR" description={''} />
          <CtaCard icon="🔢" title="GET FINANCING" description={''} />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;