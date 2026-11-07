import { motion } from 'framer-motion';
import { Camera, RefreshCw, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn, spring } from '../../lib/utils';
import type { ListShot } from '../../types';
import { FramingDiagram } from '../shotlist/FramingDiagram';

interface Props {
  shot: ListShot;
  onClose: () => void;
  onCaptured: (blob: Blob) => void | Promise<void>;
  onDenied: () => void;
}

const pickMime = () => {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return ['video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
};

/** Full-screen in-app camera with a thirds grid, ghost framing overlay and a shot-length countdown. */
export function CameraView({ shot, onClose, onCaptured, onDenied }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const target = shot.durationSec[1];

  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [remaining, setRemaining] = useState(target);
  const [error, setError] = useState<string | null>(null);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // Start (or restart, on camera flip) the stream. Always stop the tracks on cleanup.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Quick Capture is not supported in this browser. Use "Use iPhone Camera" instead.');
        return;
      }
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: true,
          });
        } catch (e) {
          if ((e as DOMException).name === 'NotAllowedError') throw e;
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
        }
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setReady(true);
      } catch (e) {
        const name = (e as DOMException).name;
        if (name === 'NotAllowedError' || name === 'SecurityError') onDenied();
        else setError('The camera could not be started. Another app might be using it.');
      }
    })();
    return () => {
      cancelled = true;
      stopTracks();
    };
  }, [facing, onDenied, stopTracks]);

  // On unmount, discard any in-progress recording.
  useEffect(
    () => () => {
      const r = recRef.current;
      if (r && r.state !== 'inactive') {
        r.onstop = null;
        r.stop();
      }
    },
    [],
  );

  const stopRec = useCallback(() => {
    const r = recRef.current;
    if (r && r.state !== 'inactive') r.stop();
    setRecording(false);
  }, []);

  useEffect(() => {
    if (!recording) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const left = target - (performance.now() - start) / 1000;
      setRemaining(Math.max(0, left));
      if (left <= 0) stopRec();
    }, 100);
    return () => clearInterval(id);
  }, [recording, target, stopRec]);

  const startRec = () => {
    const stream = streamRef.current;
    if (!stream || typeof MediaRecorder === 'undefined') {
      setError('Video recording is not supported here. Try taking a photo, or use "Use iPhone Camera".');
      return;
    }
    const mime = pickMime();
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    chunks.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.current.push(e.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunks.current, { type: rec.mimeType || mime || 'video/mp4' });
      chunks.current = [];
      void onCaptured(blob);
    };
    rec.start(250);
    recRef.current = rec;
    setRemaining(target);
    setRecording(true);
  };

  const snapPhoto = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (facing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0);
    canvas.toBlob((b) => b && void onCaptured(b), 'image/jpeg', 0.92);
  };

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[70] bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick Capture: ${shot.title}`}
    >
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: facing === 'user' ? 'scaleX(-1)' : undefined }}
      />

      {/* Ghost framing guide */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <FramingDiagram angle={shot.angle} movement={shot.movement} ghost className="h-full max-h-full w-auto opacity-60" />
      </div>

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-black/60 to-transparent px-4 pb-10 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button onClick={onClose} aria-label="Close camera" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <X size={20} />
        </button>
        <div className="flex-1 text-center">
          <p className="text-[15px] font-semibold leading-tight">{shot.title}</p>
          <p className="mt-0.5 text-[12px] opacity-80">
            {shot.angle} · {shot.movement}
          </p>
        </div>
        <button
          onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
          disabled={recording}
          aria-label="Switch between front and back camera"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur disabled:opacity-40"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {error && (
        <div className="absolute inset-x-6 top-1/3 rounded-2xl bg-black/70 p-4 text-center text-[15px] backdrop-blur" role="alert">
          {error}
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-16">
        <p className="mb-3 text-center text-[13px] opacity-85">{shot.tip}</p>
        <div className="mb-4 text-center font-mono text-[28px] font-semibold tabular-nums" aria-live="polite">
          {remaining.toFixed(1)}s
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={snapPhoto}
            disabled={!ready || recording}
            aria-label="Take photo"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur disabled:opacity-40"
          >
            <Camera size={20} />
          </button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            transition={spring}
            disabled={!ready}
            onClick={recording ? stopRec : startRec}
            aria-label={recording ? 'Stop recording' : `Record ${target} second clip`}
            className="flex h-[78px] w-[78px] items-center justify-center rounded-full border-[5px] border-white disabled:opacity-40"
          >
            <motion.span
              animate={{ borderRadius: recording ? 8 : 999, scale: recording ? 0.5 : 1 }}
              transition={spring}
              className={cn('block h-[60px] w-[60px] bg-red-500')}
            />
          </motion.button>
          <span className="w-12 text-center text-[11px] opacity-80">{target}s target</span>
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}
