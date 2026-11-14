import { Download, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BottomSheet, GlassButton, LockBadge, SegmentedControl, Toggle } from '../../components/ui';
import { requirePremium, usePremium } from '../../services/entitlements';
import { deliverFiles, exportCollage, type ExportType } from './exporter';
import { panelCount } from './formats';
import type { CollageProject } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  project: CollageProject;
}

export function ExportSheet({ open, onClose, project }: Props) {
  const premium = usePremium();
  const [type, setType] = useState<ExportType>('jpg');
  const [watermark, setWatermark] = useState(!premium);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const n = panelCount(project.format, project.panels);
  const empty = project.layers.filter((l) => l.type === 'photo' && !l.assetId).length;

  useEffect(() => {
    if (open) {
      setStatus(null);
      setWatermark(!premium);
    }
  }, [open, premium]);

  const toggleWatermark = (on: boolean) => {
    if (!on && !requirePremium({ premium: true }, 'Remove the watermark with Premium.')) return;
    setWatermark(on);
  };

  const run = async () => {
    setBusy(true);
    try {
      const files = await exportCollage(project, { type, watermark: watermark || !premium }, setStatus);
      const result = await deliverFiles(files, `${project.name.replace(/[^\w-]+/g, '-').toLowerCase() || 'collage'}-slides.zip`);
      setStatus(
        result === 'shared'
          ? 'Done! Post the images in order to keep the swipe seamless.'
          : result === 'cancelled'
            ? 'Sharing cancelled.'
            : files.length > 1
              ? `Downloaded ${files.length} slides as a ZIP.`
              : 'Downloaded.',
      );
    } catch (e) {
      setStatus((e as Error).message || 'Export failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Export"
      footer={
        <GlassButton variant="primary" size="lg" full disabled={busy} onClick={run} icon={<Download size={20} />}>
          {busy ? 'Exporting…' : n > 1 ? `Export ${n} slides` : 'Export image'}
        </GlassButton>
      }
    >
      <div className="space-y-4 pt-1">
        <SegmentedControl
          label="File type"
          value={type}
          onChange={setType}
          options={[
            { value: 'jpg', label: 'JPG' },
            { value: 'png', label: 'PNG' },
          ]}
        />
        <div className="glass flex min-h-[52px] items-center justify-between rounded-2xl px-4">
          <span className="flex items-center gap-2 text-[15px]">
            ShotList watermark {!premium && <LockBadge />}
          </span>
          <Toggle checked={watermark || !premium} onChange={toggleWatermark} label="ShotList watermark" />
        </div>
        <p className="text-2 text-[13px]">
          {n > 1
            ? `Saves ${n} images (slide-01 to slide-${String(n).padStart(2, '0')}), 1080×${project.height} each. Post them together, in order, as one carousel.`
            : `Saves one ${project.width}×${project.height} image.`}
        </p>
        {empty > 0 && <p className="text-[13px] font-medium text-amber-600 dark:text-amber-400">{empty} frame{empty > 1 ? 's are' : ' is'} still empty.</p>}
        {status && (
          <p role="status" className="text-center text-[14px] font-medium">
            {status}
          </p>
        )}
        <p className="text-2 flex items-center justify-center gap-1.5 text-[12px]">
          <Lock size={12} /> Rendered on this device from your original photos. Nothing is uploaded.
        </p>
      </div>
    </BottomSheet>
  );
}
