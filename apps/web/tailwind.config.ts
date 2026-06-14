import type { Config } from 'tailwindcss';

/**
 * কোড গুরু design tokens।
 * পরিচয়: গ্রামের স্কুলের ব্ল্যাকবোর্ড — গাঢ় সবুজ বোর্ড, হলুদ চক।
 * Cream/terracotta বা generic dark theme নয় — এটা সচেতন সিদ্ধান্ত।
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        board: {
          DEFAULT: '#173F2E', // ব্ল্যাকবোর্ড সবুজ
          deep: '#0E2B1F',
          line: '#235741',    // বোর্ডের হালকা দাগ
        },
        chalk: {
          DEFAULT: '#FFF8E7', // চকের সাদা-হলুদ
          yellow: '#F5C518',  // হলুদ চক (accent)
          dust: '#C8D8CF',    // মুছে যাওয়া চকের গুঁড়ো (muted text)
        },
        paper: '#FBFAF4',     // খাতার পাতা (light surfaces)
      },
      fontFamily: {
        bengali: ['var(--font-bengali)', 'Kalpurush', 'sans-serif'],
      },
      borderRadius: { card: '1rem' },
    },
  },
  plugins: [],
};

export default config;
