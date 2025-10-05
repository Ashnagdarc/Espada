/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Apple Typography Scale
      fontSize: {
        'large-title': ['34px', { lineHeight: '41px', fontWeight: '700' }],
        'title-1': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'title-2': ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'title-3': ['20px', { lineHeight: '25px', fontWeight: '600' }],
        'headline': ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'body': ['17px', { lineHeight: '22px', fontWeight: '400' }],
        'callout': ['16px', { lineHeight: '21px', fontWeight: '400' }],
        'subhead': ['15px', { lineHeight: '20px', fontWeight: '400' }],
        'footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption-1': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'caption-2': ['11px', { lineHeight: '13px', fontWeight: '400' }],
      },
      // Apple 8pt Grid Spacing
      spacing: {
        '1': '4px',   // 0.25rem
        '2': '8px',   // 0.5rem  
        '3': '12px',  // 0.75rem
        '4': '16px',  // 1rem
        '5': '20px',  // 1.25rem
        '6': '24px',  // 1.5rem
        '8': '32px',  // 2rem
        '10': '40px', // 2.5rem
        '12': '48px', // 3rem
        '16': '64px', // 4rem
        '20': '80px', // 5rem
        '24': '96px', // 6rem
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Apple Semantic Colors
        label: {
          primary: "hsl(var(--label-primary))",
          secondary: "hsl(var(--label-secondary))",
          tertiary: "hsl(var(--label-tertiary))",
          quaternary: "hsl(var(--label-quaternary))",
        },
        fill: {
          primary: "hsl(var(--fill-primary))",
          secondary: "hsl(var(--fill-secondary))",
          tertiary: "hsl(var(--fill-tertiary))",
          quaternary: "hsl(var(--fill-quaternary))",
        },
        separator: {
          primary: "hsl(var(--separator-primary))",
          secondary: "hsl(var(--separator-secondary))",
          tertiary: "hsl(var(--separator-tertiary))",
          quaternary: "hsl(var(--separator-quaternary))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        'gilroy': ['Gilroy', 'system-ui', 'sans-serif'],
        'sans': ['Gilroy', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
