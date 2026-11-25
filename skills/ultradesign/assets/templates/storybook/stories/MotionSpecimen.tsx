import React, { useState } from 'react';
import { tokens } from '../generated/tokens';

/** Replay by changing the keyed subject, with no timers or fixed sleeps. */
export function MotionSpecimen() {
  const [replay, setReplay] = useState(0);
  const [reduce, setReduce] = useState(false);
  return (
    <section className="ud-motion" data-reduced-motion={reduce ? 'reduce' : 'user'} aria-label="Motion specimen">
      <label><input type="checkbox" checked={reduce} onChange={(event) => setReduce(event.target.checked)} /> Reduce motion</label>
      <button type="button" className="ud-button" onClick={() => setReplay(replay + 1)}>Replay entrance</button>
      <div className="ud-motion-track">
        <div key={replay} className="ud-motion-subject">Selection ready</div>
      </div>
      <p>Entrance: {tokens.motion.duration.medium} ms. Reduced motion shows the final state immediately.</p>
    </section>
  );
}
