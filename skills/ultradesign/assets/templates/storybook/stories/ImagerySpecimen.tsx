import React from 'react';

export function ImagerySpecimen() {
  return (
    <div className="ud-imagery">
      {['wide', 'narrow'].map((crop) => (
        <figure key={crop}>
          <svg className={`ud-image ud-image-${crop}`} viewBox="0 0 640 360"
            preserveAspectRatio="xMidYMid slice" role="img" aria-label="A circular focal subject above layered hills">
            <rect width="640" height="360" className="ud-image-sky" />
            <circle cx="320" cy="120" r="55" className="ud-image-subject" />
            <path d="M0 280 Q160 120 320 260 T640 240 V360 H0Z" className="ud-image-hill" />
          </svg>
          <figcaption>{crop === 'wide' ? 'Wide crop, focal subject centered' : 'Narrow crop, subject preserved'}</figcaption>
        </figure>
      ))}
    </div>
  );
}
