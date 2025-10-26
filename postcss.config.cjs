// frontend/postcss.config.cjs
module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      'mantine-breakpoint': {
        '--mantine-breakpoint-xs': '30em',
        '--mantine-breakpoint-sm': '48em',
        // ... (el resto de breakpoints de Mantine)
      },
    },
  },
};