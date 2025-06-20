import { bannerImage } from '../assets';

export const setBannerImage = () => {
  try {
    console.log('Setting banner image:', bannerImage);
    if (bannerImage && document.documentElement) {
      document.documentElement.style.setProperty('--banner-image', `url('${bannerImage}')`);
      console.log('Banner image set successfully');
    } else {
      console.error('Banner image or document element not available');
    }
  } catch (error) {
    console.error('Error setting banner image:', error);
  }
};

// Initialize banner image when DOM is ready
const initializeBanner = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setBannerImage);
  } else {
    setBannerImage();
  }
};

// Initialize immediately
initializeBanner();

// Also set it when the window loads (as a fallback)
if (typeof window !== 'undefined') {
  window.addEventListener('load', setBannerImage);
} 