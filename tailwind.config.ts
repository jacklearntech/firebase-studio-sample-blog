import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
      // Add typography styles
      typography: ({ theme }: { theme: (path: string) => string }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.foreground'),
            '--tw-prose-headings': theme('colors.foreground'),
            '--tw-prose-lead': theme('colors.muted.foreground'),
            '--tw-prose-links': theme('colors.accent.DEFAULT'),
            '--tw-prose-bold': theme('colors.foreground'),
            '--tw-prose-counters': theme('colors.muted.foreground'),
            '--tw-prose-bullets': theme('colors.border'),
            '--tw-prose-hr': theme('colors.border'),
            '--tw-prose-quotes': theme('colors.foreground'),
            '--tw-prose-quote-borders': theme('colors.border'),
            '--tw-prose-captions': theme('colors.muted.foreground'),
            '--tw-prose-code': theme('colors.foreground'),
            '--tw-prose-pre-code': theme('colors.card.foreground / 95%'), // Slightly transparent for pre
            '--tw-prose-pre-bg': theme('colors.card.DEFAULT'), // Use card background for code blocks
            '--tw-prose-th-borders': theme('colors.border'),
            '--tw-prose-td-borders': theme('colors.border'),
            // Dark mode adjustments (if needed, though base colors handle it now)
            // '--tw-prose-invert-body': theme('colors.foreground'),
            // ... add other inverted variables if necessary
             a: {
                fontWeight: '500',
                 textDecoration: 'none', // Optional: remove underline
                 '&:hover': {
                   textDecoration: 'underline', // Add underline on hover
                 },
             },
             'code::before': { content: 'none' }, // Remove backticks around inline code
             'code::after': { content: 'none' },
             code: {
                fontWeight: '500',
                backgroundColor: 'hsl(var(--muted) / 0.5)', // Slightly transparent muted bg
                padding: '0.1em 0.3em',
                borderRadius: '0.25rem',
              },
              pre: {
                  // Use card styles for code blocks
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: theme('borderRadius.md'),
                  padding: theme('spacing.4'),
                  color: 'hsl(var(--card-foreground))', // Ensure text color contrasts with card bg
                  boxShadow: theme('boxShadow.sm'), // Optional subtle shadow
              },
              'pre code': {
                  backgroundColor: 'transparent', // Code inside pre should be transparent
                  padding: '0',
                  borderRadius: '0',
                  border: 'none',
                  color: 'inherit', // Inherit color from pre
              },
          },
        },
         // Define 'invert' variant if needed for explicit dark mode control
         invert: {
           css: {
             '--tw-prose-body': theme('colors.foreground'),
             '--tw-prose-headings': theme('colors.foreground'),
             '--tw-prose-lead': theme('colors.muted.foreground'),
             '--tw-prose-links': theme('colors.accent.DEFAULT'), // Keep accent for links?
             '--tw-prose-bold': theme('colors.foreground'),
             // ... map other variables for dark mode
             '--tw-prose-pre-code': theme('colors.card.foreground / 95%'),
             '--tw-prose-pre-bg': theme('colors.card.DEFAULT'), // Card is already dark
             // ... etc
           },
         },
      }),
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography") // Add typography plugin
],
} satisfies Config;
