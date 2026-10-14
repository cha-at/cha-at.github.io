import type { IconName } from "../data/menu";

const OUTLINE = "#0a0a0a";
const FACE = "#c0c0c0";
const SHADOW = "#808080";
const NAVY = "#000080";
const BLUE = "#1084d0";
const WHITE = "#ffffff";
const YELLOW = "#ffcc00";
const YELLOW_DARK = "#d4a017";
const TEAL = "#008080";

// 16x16 pixel art, one unit = one pixel, rendered with shape-rendering: crispEdges
export const icons: Record<IconName, string> = {
  globe: `
    <path fill="${OUTLINE}" d="M5 1h6v1H5z M4 2h8v1H4z M3 3h10v1H3z M2 4h12v1H2z M2 5h12v1H2z M1 6h14v1H1z M1 7h14v1H1z M1 8h14v1H1z M1 9h14v1H1z M2 10h12v1H2z M2 11h12v1H2z M3 12h10v1H3z M4 13h8v1H4z M5 14h6v1H5z"/>
    <path fill="${NAVY}" d="M5 2h6v1H5z M4 3h8v1H4z M3 4h10v1H3z M3 5h10v1H3z M2 6h12v1H2z M2 7h12v1H2z M2 8h12v1H2z M2 9h12v1H2z M3 10h10v1H3z M3 11h10v1H3z M4 12h8v1H4z M5 13h6v1H5z"/>
    <path fill="${BLUE}" d="M4 3h2v1H4z M3 4h2v1H3z M3 5h1v1H3z"/>
    <path fill="${TEAL}" d="M6 4h3v1H6z M5 5h4v1H5z M5 6h3v1H5z M9 8h3v1H9z M10 9h3v1H10z M10 10h2v1H10z M5 11h4v1H5z M6 12h2v1H6z"/>
  `,
  house: `
    <path fill="${NAVY}" d="M7 3h2v1H7z M6 4h4v1H6z M5 5h6v1H5z M4 6h8v1H4z M3 7h10v1H3z"/>
    <path fill="${OUTLINE}" d="M3 8h10v7H3z M7 11h3v3H7z"/>
    <path fill="${FACE}" d="M4 8h8v6H4z"/>
    <path fill="${BLUE}" d="M5 9h2v2H5z M10 9h2v2H10z"/>
  `,
  user: `
    <path fill="${OUTLINE}" d="M1 2h14v12H1z M4 4h3v3H4z M3 8h5v2H3z"/>
    <path fill="${WHITE}" d="M2 3h12v10H2z"/>
    <path fill="${SHADOW}" d="M9 5h4v1H9z M9 7h4v1H9z M9 9h3v1H9z"/>
  `,
  folder: `
    <path fill="${OUTLINE}" d="M1 3h7v2H1z M1 5h14v9H1z"/>
    <path fill="${YELLOW}" d="M2 4h5v1H2z M2 7h12v5H2z"/>
    <path fill="${WHITE}" d="M2 6h12v1H2z"/>
    <path fill="${YELLOW_DARK}" d="M2 12h12v1H2z"/>
  `,
  network: `
    <path fill="${OUTLINE}" d="M1 2h9v7H1z M4 9h3v1H4z M3 10h5v1H3z M9 8h6v5H9z"/>
    <path fill="${FACE}" d="M2 3h7v5H2z M10 9h4v3H10z"/>
    <path fill="${NAVY}" d="M3 4h5v3H3z"/>
    <path fill="${BLUE}" d="M11 10h2v1H11z"/>
  `,
  shutdown: `
    <path fill="${OUTLINE}" d="M2 2h12v9H2z M6 11h5v2H6z M4 13h9v2H4z"/>
    <path fill="${FACE}" d="M3 3h10v7H3z M7 11h3v1H7z M5 13h7v1H5z"/>
    <path fill="${NAVY}" d="M4 4h8v5H4z"/>
    <path fill="${BLUE}" d="M4 4h2v1H4z"/>
  `,
  doc: `
    <path fill="${OUTLINE}" d="M3 1h10v14H3z"/>
    <path fill="${WHITE}" d="M4 2h8v12H4z"/>
    <path fill="${SHADOW}" d="M11 2h1v1H11z M10 3h2v1H10z M9 4h3v1H9z M5 7h6v1H5z M5 9h6v1H5z M5 11h4v1H5z"/>
  `,
};
