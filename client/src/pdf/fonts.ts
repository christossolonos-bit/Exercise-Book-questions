import { Font } from '@react-pdf/renderer'
import regular from '../assets/fonts/DejaVuSans.ttf'
import bold from '../assets/fonts/DejaVuSans-Bold.ttf'

// DejaVu Sans covers Greek + Latin — the built-in PDF fonts do NOT, so this is
// what makes the Greek questions render correctly in the exported file.
let registered = false
export function registerFonts() {
  if (registered) return
  registered = true
  Font.register({
    family: 'DejaVu',
    fonts: [
      { src: regular, fontWeight: 'normal' },
      { src: bold, fontWeight: 'bold' },
    ],
  })
  // Keep words whole (no automatic hyphenation, which looks odd in Greek).
  Font.registerHyphenationCallback((word) => [word])
}
