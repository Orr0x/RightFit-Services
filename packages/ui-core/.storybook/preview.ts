import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Accessibility addon configuration
    a11y: {
      config: {
        rules: [
          {
            // Disable color-contrast check for now (will be addressed in styling)
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
    },
  },
};

export default preview;
