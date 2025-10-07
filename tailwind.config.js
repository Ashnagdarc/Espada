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
      // Enhanced Apple Typography Scale with proper letter spacing
      fontSize: {
        'large-title': ['34px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '0.374px' }],
        'title-1': ['28px', { lineHeight: '1.21', fontWeight: '700', letterSpacing: '0.364px' }],
        'title-2': ['22px', { lineHeight: '1.27', fontWeight: '700', letterSpacing: '0.352px' }],
        'title-3': ['20px', { lineHeight: '1.25', fontWeight: '600', letterSpacing: '0.38px' }],
        'headline': ['17px', { lineHeight: '1.29', fontWeight: '600', letterSpacing: '-0.408px' }],
        'body': ['17px', { lineHeight: '1.29', fontWeight: '400', letterSpacing: '-0.408px' }],
        'callout': ['16px', { lineHeight: '1.31', fontWeight: '400', letterSpacing: '-0.32px' }],
        'subhead': ['15px', { lineHeight: '1.33', fontWeight: '400', letterSpacing: '-0.24px' }],
        'footnote': ['13px', { lineHeight: '1.38', fontWeight: '400', letterSpacing: '-0.078px' }],
        'caption-1': ['12px', { lineHeight: '1.33', fontWeight: '400', letterSpacing: '0px' }],
        'caption-2': ['11px', { lineHeight: '1.18', fontWeight: '400', letterSpacing: '0.066px' }],
      },
      // Enhanced Apple 8pt Grid Spacing System
      spacing: {
        '0': '0px',
        '1': '4px',    // 1 unit
        '2': '8px',    // 2 units
        '3': '12px',   // 3 units
        '4': '16px',   // 4 units
        '5': '20px',   // 5 units
        '6': '24px',   // 6 units
        '7': '28px',   // 7 units
        '8': '32px',   // 8 units
        '9': '36px',   // 9 units
        '10': '40px',  // 10 units
        '11': '44px',  // 11 units (touch target)
        '12': '48px',  // 12 units
        '14': '56px',  // 14 units
        '16': '64px',  // 16 units
        '20': '80px',  // 20 units
        '24': '96px',  // 24 units
        '28': '112px', // 28 units
        '32': '128px', // 32 units
      },
      
      // Apple Touch Targets
      minHeight: {
        'touch': '44px',
        'touch-comfortable': '48px',
        'touch-large': '52px',
      },
      
      minWidth: {
        'touch': '44px',
        'touch-comfortable': '48px',
        'touch-large': '52px',
      },
      colors: {
        // Existing colors
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
        
        // Enhanced Apple Semantic Colors
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
          opaque: "hsl(var(--separator-opaque))",
          'non-opaque': "hsl(var(--separator-non-opaque))",
        },
        
        // Enhanced Apple Form Colors
        form: {
          background: "hsl(var(--form-background))",
          border: "hsl(var(--form-border))",
          'border-focus': "hsl(var(--form-border-focus))",
          'border-error': "hsl(var(--form-border-error))",
          text: "hsl(var(--form-text))",
          placeholder: "hsl(var(--form-placeholder))",
        },
        
        // Apple System Colors
        'apple-blue': {
          50: '#e6f3ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#007AFF', // Apple Blue
          600: '#0056b3',
          700: '#004080',
          800: '#002a4d',
          900: '#00141a',
        },
        
        'apple-red': {
          50: '#ffe6e6',
          100: '#ffb3b3',
          200: '#ff8080',
          300: '#ff4d4d',
          400: '#ff1a1a',
          500: '#FF3B30', // Apple Red
          600: '#cc2e26',
          700: '#99221c',
          800: '#661713',
          900: '#330b09',
        },
        
        'apple-green': {
          50: '#e6ffe6',
          100: '#b3ffb3',
          200: '#80ff80',
          300: '#4dff4d',
          400: '#1aff1a',
          500: '#34C759', // Apple Green
          600: '#2a9f47',
          700: '#1f7735',
          800: '#154f23',
          900: '#0a2712',
        },
      },
      borderRadius: {
        // Apple Border Radius System
        'apple-xs': 'var(--apple-radius-xs)',
        'apple-sm': 'var(--apple-radius-sm)',
        'apple-md': 'var(--apple-radius-md)',
        'apple-lg': 'var(--apple-radius-lg)',
        'apple-xl': 'var(--apple-radius-xl)',
        'apple-2xl': 'var(--apple-radius-2xl)',
        'apple-full': 'var(--apple-radius-full)',
        
        // Legacy support
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // Existing animations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        
        // Apple-style animations
        "apple-bounce": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "apple-press": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.95)" },
        },
        "apple-fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "apple-slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        // Existing animations
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        
        // Apple-style animations
        "apple-bounce": "apple-bounce 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "apple-press": "apple-press 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "apple-fade-in": "apple-fade-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "apple-slide-in": "apple-slide-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      fontFamily: {
        'gilroy': ['Gilroy', 'system-ui', 'sans-serif'],
        'sans': ['Gilroy', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
