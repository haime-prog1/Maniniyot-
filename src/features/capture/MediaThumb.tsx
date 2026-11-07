import { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  url: string;
  type: string;
  className?: string;
  playable?: boolean;
  label: string;
}

export function MediaThumb({ url, type, className, playable, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const isVideo = type.startsWith('video');

  if (!isVideo) return <img src={url} alt={label} className={cn('object-cover', className)} />;

  const toggle = () => {
    const v = ref.current;
    if (!v || !playable) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <video
        ref={ref}
        // "#t=0.1" makes iOS Safari render the first frame as a poster.
        src={`${url}#t=0.1`}
        muted={!playable}
        playsInline
        preload="metadata"
        onEnded={() => setPlaying(false)}
        className="h-full w-full object-cover"
        aria-label={label}
      />
      {playable && (
        <button
          onClick={toggle}
          aria-label={playing ? `Pause ${label}` : `Play ${label}`}
          className="absolute inset-0 flex items-center justify-center"
        >
          {!playing && (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur">
              <Play size={16} fill="currentColor" />
            </span>
          )}
        </button>
      )}
    </div>
  );
}
