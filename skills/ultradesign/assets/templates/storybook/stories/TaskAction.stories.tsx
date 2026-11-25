import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { TaskAction } from './TaskAction';

const meta = {
  title: 'System/TaskAction',
  component: TaskAction,
  tags: ['autodocs'],
  args: { state: 'normal' },
} satisfies Meta<typeof TaskAction>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Save selection' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Selection saved locally.');
  },
};
export const Hover: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole('button'));
    await expect(canvas.getByRole('button')).toHaveAttribute('data-hovered', 'true');
  },
};
export const Focus: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button')).toHaveFocus();
  },
};
export const Disabled: Story = {
  args: { state: 'disabled' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toBeDisabled();
  },
};
export const Loading: Story = {
  args: { state: 'loading' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByRole('status')).toHaveTextContent('Saving your selection.');
  },
};
export const Empty: Story = {
  args: { state: 'empty' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Select an item to save.')).toBeVisible();
    await expect(canvas.getByRole('button')).toBeDisabled();
  },
};
export const Error: Story = {
  args: { state: 'error' },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('The selection was not saved.');
    await userEvent.click(canvas.getByRole('button', { name: 'Try saving again' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Selection saved locally.');
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
