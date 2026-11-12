import { ClipboardCopy, Database, HardDrive, Lock, RotateCcw, Share2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { LargeTitle, ListGroup, ListRow, SegmentedControl } from '../../components/ui';
import { formatBytes } from '../../lib/utils';
import { shotListToText } from '../../services/exportText';
import { deleteAllMedia, mediaUsage } from '../../services/mediaStore';
import { useActiveList, useStore } from '../../store/useStore';
import { CAMERAS } from '../../data/cameraSettings';
import type { CameraPref, ThemePref } from '../../types';

export function Settings() {
  const { theme, setTheme, camera, setCamera, lists, clearAllMediaFlags, resetAll } = useStore();
  const active = useActiveList();
  const [exportId, setExportId] = useState(active?.id);
  const [usage, setUsage] = useState<{ count: number; bytes: number }>({ count: 0, bytes: 0 });
  const [quota, setQuota] = useState<{ usage?: number; quota?: number; persisted?: boolean }>({});
  const [toast, setToast] = useState<string | null>(null);
  const exportList = lists.find((l) => l.id === exportId) ?? active;

  const refresh = useCallback(async () => {
    setUsage(await mediaUsage().catch(() => ({ count: 0, bytes: 0 })));
    try {
      const est = await navigator.storage?.estimate?.();
      const persisted = await navigator.storage?.persisted?.();
      setQuota({ usage: est?.usage, quota: est?.quota, persisted });
    } catch {
      /* Storage estimates are optional */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const copy = async () => {
    if (!exportList) return;
    try {
      await navigator.clipboard.writeText(shotListToText(exportList));
      flash('Copied to clipboard');
    } catch {
      flash('Copy failed');
    }
  };

  const share = async () => {
    if (!exportList) return;
    const text = shotListToText(exportList);
    if (navigator.share) {
      try {
        await navigator.share({ title: `ShotList: ${exportList.destinationName}`, text });
      } catch {
        /* user cancelled */
      }
    } else await copy();
  };

  const wipeMedia = async () => {
    if (!confirm('Delete all captured photos and videos from this device? Your shot lists are kept.')) return;
    await deleteAllMedia();
    clearAllMediaFlags();
    await refresh();
    flash('All media deleted');
  };

  const reset = async () => {
    if (!confirm('Reset ShotList? This deletes every trip, setting and captured clip on this device.')) return;
    await deleteAllMedia();
    resetAll();
    await refresh();
    flash('ShotList was reset');
  };

  return (
    <div>
      <LargeTitle title="Settings" />
      <div className="px-4 pt-4">
        <ListGroup title="Appearance">
          <div className="p-3">
            <SegmentedControl<ThemePref>
              label="Theme"
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </div>
        </ListGroup>

        <ListGroup
          title="Camera"
          footer={
            camera === 'acepro2'
              ? 'Shot details show Insta360 Ace Pro 2 settings (mode, stabilisation, field of view, mounting). New guides add action-cam shots, and Capture lets you import clips from the camera.'
              : 'Shot details show iPhone camera settings.'
          }
        >
          <div className="p-3">
            <SegmentedControl<CameraPref> label="Camera" value={camera} onChange={setCamera} options={CAMERAS} />
          </div>
        </ListGroup>

        <ListGroup title="Export shot list" footer="Share opens the iOS share sheet: Notes, Messages, AirDrop and more.">
          {lists.length > 1 && (
            <div className="p-3">
              <select className="field appearance-none" aria-label="Shot list to export" value={exportList?.id} onChange={(e) => setExportId(e.target.value)}>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.destinationName}
                  </option>
                ))}
              </select>
            </div>
          )}
          {exportList ? (
            <>
              <ListRow icon={<ClipboardCopy size={17} />} label="Copy as text" onClick={copy} chevron />
              <ListRow icon={<Share2 size={17} />} label="Share…" onClick={share} chevron />
            </>
          ) : (
            <ListRow label={<span className="text-2">Create a shot list to export it</span>} />
          )}
        </ListGroup>

        <ListGroup
          title="Media & storage"
          footer={
            <span className="flex items-start gap-1.5">
              <Lock size={13} className="mt-0.5 shrink-0" /> Your photos and videos never leave this device. They're stored in this browser only, and are never
              uploaded, synced or shared unless you tap Share.
            </span>
          }
        >
          <ListRow icon={<HardDrive size={17} />} label="Captured media" detail={`${usage.count} · ${formatBytes(usage.bytes)}`} />
          {quota.quota !== undefined && (
            <ListRow icon={<Database size={17} />} label="Storage used" detail={`${formatBytes(quota.usage ?? 0)} of ${formatBytes(quota.quota)}`} />
          )}
          <ListRow icon={<Lock size={17} />} label="Persistent storage" detail={quota.persisted ? 'On' : 'Not yet'} />
          <ListRow icon={<Trash2 size={17} className="text-red-500" />} label="Delete all media" destructive onClick={wipeMedia} />
        </ListGroup>

        <ListGroup title="Data">
          <ListRow icon={<RotateCcw size={17} className="text-red-500" />} label="Reset all data" destructive onClick={reset} />
        </ListGroup>

        <p className="text-2 pb-4 text-center text-[12px]">ShotList 1.0 · Works offline · No account, no tracking</p>
      </div>

      {toast && (
        <div role="status" className="glass-strong fixed inset-x-0 top-[calc(env(safe-area-inset-top)+60px)] z-50 mx-auto w-max rounded-full px-5 py-2.5 text-[14px] font-semibold">
          {toast}
        </div>
      )}
    </div>
  );
}
