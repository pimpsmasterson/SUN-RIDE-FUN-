import { bannerImage } from '../assets';

export const setBannerImage = () => {
  document.documentElement.style.setProperty('--banner-image', `url('${bannerImage}')`);
};
 
// Initialize banner image when this module is loaded
setBannerImage(); 