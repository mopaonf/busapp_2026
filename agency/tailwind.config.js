export default {
   content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
   theme: {
      extend: {
         colors: {
            primary: 'var(--color-primary)',
            'primary-hover': 'var(--color-primary-hover)',
            secondary: 'var(--color-secondary)',
            accent: 'var(--color-accent)',
            background: 'var(--color-background)',
            surface: 'var(--color-surface)',
            'text-primary': 'var(--color-text-primary)',
            'text-secondary': 'var(--color-text-secondary)',
            'text-light': 'var(--color-text-light)',
            border: 'var(--color-border)',
            success: 'var(--color-success)',
            warning: 'var(--color-warning)',
            danger: 'var(--color-danger)',
            info: 'var(--color-info)',
            disabled: 'var(--color-disabled)',
         },
         boxShadow: {
            sm: 'var(--shadow-sm)',
            md: 'var(--shadow-md)',
            lg: 'var(--shadow-lg)',
         },
         borderRadius: {
            sm: 'var(--radius-sm)',
            md: 'var(--radius-md)',
            lg: 'var(--radius-lg)',
         },
         transitionDuration: {
            DEFAULT: '300ms',
         },
         transitionTimingFunction: {
            DEFAULT: 'ease-in-out',
         },
      },
   },
};
