import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { MotionSpecimen } from './MotionSpecimen';

const meta = { title: 'System/Motion', component: MotionSpecimen } satisfies Meta<typeof MotionSpecimen>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Entrance: Story = {};
export const ReducedMotion: Story = {
  globals: { reducedMotion: 'reduce' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Replay entrance' }));
    await expect(getComputedStyle(canvas.getByText('Selection ready')).animationName).toBe('none');
  },
};
