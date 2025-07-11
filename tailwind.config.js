/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        primary: {
          DEFAULT: "#4F8FF9",
          foreground: "#fff",
        },
        secondary: {
          DEFAULT: "#FFE066",
          foreground: "#2D3A5A",
        },
        accent: {
          1: "#FFB347",
          2: "#A8E063",
          3: "#FFB6B9",
          4: "#7ED6FB",
          5: "#B39DDB",
          6: "#6EE7B7",
          7: "#FFE066",
        },
        background: "#FFF9F3",
        foreground: "#2D3A5A",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        // 새로운 색상들 추가
        info: {
          DEFAULT: "hsl(var(--color-info))",
          content: "hsl(var(--color-info-content))",
        },
        success: {
          DEFAULT: "hsl(var(--color-success))",
          content: "hsl(var(--color-success-content))",
        },
        warning: {
          DEFAULT: "hsl(var(--color-warning))",
          content: "hsl(var(--color-warning-content))",
        },
        error: {
          DEFAULT: "hsl(var(--color-error))",
          content: "hsl(var(--color-error-content))",
        },
        // 학습 카테고리 색상들 추가
        consonant: "hsl(var(--color-consonant))",
        vowel: "hsl(var(--color-vowel))",
        syllable: "hsl(var(--color-syllable))",
        word: "hsl(var(--color-word))",
      },
      screens: {
        tl5: {
          raw: "(min-width: 768px) and (orientation: landscape) and (min-height: 500px)",
        },
        tl6: {
          raw: "(min-width: 768px) and (orientation: landscape) and (min-height: 600px)",
        },
        tl7: {
          raw: "(min-width: 768px) and (orientation: landscape) and (min-height: 700px)",
        },
        tl8: {
          raw: "(min-width: 768px) and (orientation: landscape) and (min-height: 800px)",
        },
        tl9: {
          raw: "(min-width: 768px) and (orientation: landscape) and (min-height: 900px)",
        },
        tp: {
          raw: "(min-width: 768px) and (orientation: portrait)",
        },
        "tb-lg": {
          raw: "(min-width: 1200px) and (orientation: landscape) and (min-height: 800px)",
        },
      },
    },
  },
  plugins: [animate],
  safelist: [
    {
      pattern:
        /^(bg|border|from|to|text)-(rose|purple|blue|teal|lime|orange|slate|yellow)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    {
      pattern: /^(bg|border|from|to|text)-(consonant|vowel|syllable|word).*$/,
    },
  ],
};
