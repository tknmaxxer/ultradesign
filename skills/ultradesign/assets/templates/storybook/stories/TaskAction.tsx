import React, { useState } from 'react';

export type TaskActionProps = {
  state?: 'normal' | 'disabled' | 'loading' | 'empty' | 'error';
};

/** A complete local selection action; production callers supply their task state. */
export function TaskAction({ state = 'normal' }: TaskActionProps) {
  const [saved, setSaved] = useState(false);
  const [hovered, setHovered] = useState(false);
  const blocked = state === 'disabled' || state === 'loading' || state === 'empty';
  return (
    <section className="ud-action" aria-label="Selection action">
      <p>{state === 'empty' ? 'Select an item to save.' : 'Keep this selection for your next visit.'}</p>
      {state === 'error' && !saved && <p role="alert">The selection was not saved. Try again.</p>}
      <button
        className="ud-button"
        type="button"
        disabled={blocked}
        aria-busy={state === 'loading'}
        data-hovered={hovered}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => setSaved(true)}
      >
        {state === 'loading' ? 'Saving selection' : state === 'error' ? 'Try saving again' : 'Save selection'}
      </button>
      <p role="status">{saved ? 'Selection saved locally.' : state === 'loading' ? 'Saving your selection.' : ''}</p>
    </section>
  );
}
