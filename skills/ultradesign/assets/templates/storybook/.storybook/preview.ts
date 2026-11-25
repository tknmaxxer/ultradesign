import { createElement } from 'react';
import type { Preview } from '@storybook/react-vite';
import '../generated/tokens.css';
import '../stories/specimens.css';

const preview: Preview = {
  parameters: { a11y: { test: 'error' } },
  globalTypes: {
    reducedMotion: {
      description: 'Motion preference for system specimens',
      toolbar: {
        title: 'Motion',
        items: [
          { value: 'user', title: 'Use device preference' },
          { value: 'reduce', title: 'Reduce motion' },
        ],
      },
    },
  },
  initialGlobals: { reducedMotion: 'user' },
  decorators: [
    (Story, context) => createElement('div', {
      className: 'ud-specimen',
      'data-reduced-motion': context.globals.reducedMotion,
    }, createElement(Story)),
  ],
};

export default preview;
