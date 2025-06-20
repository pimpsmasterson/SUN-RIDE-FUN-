import React, { useEffect, useState } from 'react';
import { bannerImage } from '../assets';

const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const info = {
      bannerImagePath: bannerImage,
      cssVariable: getComputedStyle(document.documentElement).getPropertyValue('--banner-image'),
      environment: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === 'production',
      timestamp: new Date().toISOString()
    };
    setDebugInfo(info);
    console.log('Debug Info:', info);
  }, []);

  // Only show in development or if there's an issue
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Debug Info</h4>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
};

export default DebugInfo; 