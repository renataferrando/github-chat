// Design system split:
//   CSS tokens (colors, font sizes, radii) → app/globals.css @theme
//   JS-only runtime constants (avatar palette, per-user overrides) → this file
// See DESIGN.md for the full design system reference.

// Avatar background palette — used by avatarColor() in utils.ts.
// All 8 colors verified ≥4.5:1 contrast ratio with white (#ffffff).
export const AVATAR_PALETTE = [
  '#5a3ea3', // [0] violet/purple   CR 7.9
  '#1b6ca8', // [1] medium blue     CR 5.6
  '#8b3d11', // [2] burnt orange    CR 7.6
  '#1a7f3c', // [3] forest green    CR 5.1
  '#7a2d50', // [4] deep rose       CR 9.1
  '#2d6585', // [5] slate teal      CR 6.3
  '#5f4c0a', // [6] dark amber      CR 8.3
  '#3b6b1a', // [7] dark olive      CR 6.4
] as const

// Per-username color overrides — checked before the djb2 hash fallback.
export const AVATAR_OVERRIDES: Readonly<Record<string, string>> = {
  elenavoss: '#1b6ca8',
}
