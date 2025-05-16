// Export SVG illustrations as constants
// These are SVG strings that can be rendered using SvgXml from react-native-svg

// Empty state illustration
export const EMPTY_STATE = `
<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g>
    <path d="M90 20C51.34 20 20 51.34 20 90C20 128.66 51.34 160 90 160C128.66 160 160 128.66 160 90C160 51.34 128.66 20 90 20Z" fill="#F5F5F7" stroke="#34C759" stroke-width="2"/>
    <path d="M65 90C65 90 75 75 90 75C105 75 115 90 115 90" stroke="#34C759" stroke-width="3" stroke-linecap="round"/>
    <path d="M60 110C70 122 82 128 90 128C98 128 110 122 120 110" stroke="#34C759" stroke-width="3" stroke-linecap="round"/>
    <path d="M50 70L54 74M130 70L126 74M90 50V56" stroke="#34C759" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>`;

// Recipe success illustration
export const RECIPE_SUCCESS = `
<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g>
    <path d="M50 65C50 47.33 64.33 33 82 33H98C115.67 33 130 47.33 130 65V115C130 132.67 115.67 147 98 147H82C64.33 147 50 132.67 50 115V65Z" fill="#F5F5F7" stroke="#34C759" stroke-width="2"/>
    <path d="M65 90L80 105L115 70" stroke="#34C759" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M50 50L58 58M130 50L122 58" stroke="#34C759" stroke-width="3" stroke-linecap="round"/>
    <path d="M70 40C70 40 80 33 90 33C100 33 110 40 110 40" stroke="#34C759" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>`;

// Shopping list illustration
export const SHOPPING_LIST = `
<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g>
    <path d="M55 40H125C127.76 40 130 42.24 130 45V135C130 137.76 127.76 140 125 140H55C52.24 140 50 137.76 50 135V45C50 42.24 52.24 40 55 40Z" fill="#F5F5F7" stroke="#34C759" stroke-width="2"/>
    <path d="M70 65H110M70 85H110M70 105H90" stroke="#34C759" stroke-width="3" stroke-linecap="round"/>
    <path d="M60 65L63 68L67 62M60 85L63 88L67 82M60 105L63 108L67 102" stroke="#34C759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

// Onboarding welcome illustration
export const ONBOARDING_WELCOME = `
<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g>
    <circle cx="90" cy="90" r="65" fill="#F5F5F7" stroke="#34C759" stroke-width="2"/>
    <path d="M65 90C65 90 75 75 90 75C105 75 115 90 115 90" stroke="#34C759" stroke-width="3" stroke-linecap="round"/>
    <path d="M65 110C65 110 75 125 90 125C105 125 115 110 115 110" stroke="#34C759" stroke-width="3" stroke-linecap="round"/>
    <path d="M70 78C70 78 55 82 45 97M110 78C110 78 125 82 135 97" stroke="#34C759" stroke-width="2" stroke-linecap="round"/>
    <circle cx="90" cy="90" r="8" fill="#34C759"/>
  </g>
</svg>`;

// Error state illustration
export const ERROR_STATE = `
<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g>
    <path d="M90 25L25 145H155L90 25Z" fill="#F5F5F7" stroke="#34C759" stroke-width="2"/>
    <path d="M90 65V105" stroke="#34C759" stroke-width="4" stroke-linecap="round"/>
    <circle cx="90" cy="125" r="5" fill="#34C759"/>
  </g>
</svg>`;

// You can add more custom illustrations as needed 