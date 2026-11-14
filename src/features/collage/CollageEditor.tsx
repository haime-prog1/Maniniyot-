import {
  ArrowDownToLine,
  ArrowUpToLine,
  Check,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  GalleryHorizontal,
  ImagePlus,
  LayoutTemplate,
  Minus,
  Palette,
  Plus,
  Redo2,
  SlidersHorizontal,
  Trash2,
  Type,
  Undo2,
  Wand2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BottomSheet, GlassButton } from '../../components/ui';
import { cn } from '../../lib/utils';
import { requirePremium, usePremium } from '../../services/entitlements';
import { AdjustSheet } from './AdjustSheet';
import { getAsset } from './assets';
import { EditorCanvas } from './EditorCanvas';
import { ExportSheet } from './ExportSheet';
import { FilterSheet } from './FilterSheet';
import { NO_FILTER } from './filters';
import { MAX_PANELS, MIN_PANELS } from './formats';
import { LookSheet } from './LookSheet';
import { addPhoto, addText, duplicateLayer, fillEmptyFrames, moveLayer, patchLayer, removeLayer, setFilterAll, setPanels } from './ops';
import { OverviewSheet } from './OverviewSheet';
import { PhotoPickerSheet } from './PhotoPickerSheet';
import { getProject, makeThumbnail, saveProject } from './projects';
import { TemplateGrid } from './TemplateGrid';
import { applyTemplate } from './templates';
import { TextSheet } from './TextSheet';
import type { CollageProject, FilterSettings, Layer, PhotoLayer, TextLayer } from './types';
import { useHistory } from './useHistory';

type Sheet = 'template' | 'text' | 'look' | 'filter' | 'adjust' | 'export' | 'overview' | null;
type Picker = { mode: 'replace'; layerId: string } | { mode: 'add' } | null;

function Tool({ icon, label, onClick, disabled, active }: { icon: ReactNode; label: string; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex min-h-[52px] min-w-[60px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[11px] font-medium disabled:opacity-35',
        active && 'text-ig-pink',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/** Full-screen collage editor. Changes autosave to this device. */
export function CollageEditor() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const premium = usePremium();
  const history = useHistory<CollageProject | null>(null);
  const project = history.present;
  const [status, setStatus] = useState<'loading' | 'missing' | 'ready'>('loading');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [picker, setPicker] = useState<Picker>(null);
  const [panel, setPanel] = useState(0);
  const [dividers, setDividers] = useState(true);
  const loadedRef = useRef<CollageProject | null>(null);
  const latest = useRef<CollageProject | null>(null);
  latest.current = project;

  useEffect(() => {
    getProject(id).then((p) => {
      if (!p) return setStatus('missing');
      loadedRef.current = p;
      history.reset(p);
      setStatus('ready');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Autosave (debounced), with a fresh thumbnail.
  const save = useCallback(async (p: CollageProject) => {
    const thumb = await makeThumbnail(p).catch(() => p.thumb);
    await saveProject({ ...p, thumb, updatedAt: Date.now() });
  }, []);
  useEffect(() => {
    if (!project || project === loadedRef.current) return;
    const t = setTimeout(() => save(project), 700);
    return () => clearTimeout(t);
  }, [project, save]);
  useEffect(
    () => () => {
      const p = latest.current;
      if (p && p !== loadedRef.current) void save(p);
    },
    [save],
  );

  const update = useCallback((fn: (p: CollageProject) => CollageProject, key?: string) => history.update((p) => (p ? fn(p) : p), key), [history]);

  // Desktop shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest('input, textarea');
      // Sheets handle their own keys (Escape closes the sheet, not the selection).
      if (typing || document.querySelector('[role="dialog"]')) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) history.redo();
        else history.undo();
      } else if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId) {
        update((p) => removeLayer(p, selectedId));
        setSelectedId(null);
      } else if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [history, selectedId, update]);

  if (status !== 'ready' || !project) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-[var(--bg)] px-6 text-center">
        {status === 'missing' ? (
          <>
            <p className="text-[20px] font-bold">Collage not found</p>
            <GlassButton variant="primary" onClick={() => navigate('/collages', { replace: true })}>
              Go to My Collages
            </GlassButton>
          </>
        ) : (
          <p className="text-2">Opening collage…</p>
        )}
      </div>
    );
  }

  const selected = project.layers.find((l) => l.id === selectedId);
  const selPhoto = selected?.type === 'photo' ? (selected as PhotoLayer) : undefined;
  const selText = selected?.type === 'text' ? (selected as TextLayer) : undefined;
  const ctx = { destination: project.destination };
  const carousel = project.format === 'carousel';
  const firstPhoto = project.layers.find((l): l is PhotoLayer => l.type === 'photo' && !!l.assetId);

  const patchSelected = (patch: Partial<Layer>, key?: string) => selectedId && update((p) => patchLayer(p, selectedId, patch), key);

  const onTapLayer = (l: Layer) => {
    if (l.type === 'photo' && !l.assetId) setPicker({ mode: 'replace', layerId: l.id });
    else if (l.type === 'text') setSheet('text');
  };

  const onPicked = async (ids: string[]) => {
    if (!picker) return;
    if (picker.mode === 'replace') {
      const layerId = picker.layerId;
      update((p) => patchLayer(p, layerId, { assetId: ids[0], crop: { scale: 1, ox: 0, oy: 0 } }));
      setSelectedId(layerId);
      return;
    }
    const aspects = await Promise.all(ids.map(async (a) => {
      const r = await getAsset(a);
      return r ? r.w / r.h : 1;
    }));
    update((p) => {
      const { project: filled, rest } = fillEmptyFrames(p, ids);
      return rest.reduce((acc, assetId, i) => addPhoto(acc, assetId, panel, aspects[ids.indexOf(assetId)], i * 36).project, filled);
    });
  };

  const newText = () => {
    let newId = '';
    update((p) => {
      const r = addText(p, 'title', panel, ctx);
      newId = r.id;
      return r.project;
    });
    setTimeout(() => {
      setSelectedId(newId);
      setSheet('text');
    }, 0);
  };

  const filterValue: FilterSettings = selPhoto?.filter ?? firstPhoto?.filter ?? NO_FILTER;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[var(--bg)]">
      {/* Header */}
      <header className="flex items-center gap-1 px-2 pt-[calc(env(safe-area-inset-top)+4px)]">
        <button onClick={() => navigate('/collages')} className="flex h-11 items-center pr-2 font-medium text-ig-pink" aria-label="Back to My Collages">
          <ChevronLeft /> Collages
        </button>
        <button
          className="min-w-0 flex-1 truncate text-center text-[15px] font-semibold"
          onClick={() => {
            const name = prompt('Collage name', project.name);
            if (name?.trim()) update((p) => ({ ...p, name: name.trim() }));
          }}
          aria-label={`Rename collage, ${project.name}`}
        >
          {project.name}
        </button>
        <button onClick={history.undo} disabled={!history.canUndo} aria-label="Undo" className="flex h-11 w-11 items-center justify-center disabled:opacity-30">
          <Undo2 size={20} />
        </button>
        <button onClick={history.redo} disabled={!history.canRedo} aria-label="Redo" className="flex h-11 w-11 items-center justify-center disabled:opacity-30">
          <Redo2 size={20} />
        </button>
        <GlassButton variant="primary" size="sm" className="ml-1" onClick={() => setSheet('export')}>
          Export
        </GlassButton>
      </header>

      {/* Canvas */}
      <div className="min-h-0 flex-1 py-2">
        <EditorCanvas
          project={project}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdate={update}
          onTapLayer={onTapLayer}
          showDividers={dividers}
          watermark={!premium}
          onPanelChange={setPanel}
        />
      </div>

      {/* Carousel controls */}
      {carousel && !selected && (
        <div className="flex items-center justify-center gap-2 px-4 pb-1">
          <div className="glass flex items-center rounded-full">
            <button
              onClick={() => update((p) => setPanels(p, p.panels - 1))}
              disabled={project.panels <= MIN_PANELS}
              aria-label="Remove a slide"
              className="flex h-11 w-11 items-center justify-center disabled:opacity-30"
            >
              <Minus size={18} />
            </button>
            <span className="min-w-[64px] text-center text-[13px] font-semibold" aria-live="polite">
              {project.panels} slides
            </span>
            <button
              onClick={() => update((p) => setPanels(p, p.panels + 1))}
              disabled={project.panels >= MAX_PANELS}
              aria-label="Add a slide"
              className="flex h-11 w-11 items-center justify-center disabled:opacity-30"
            >
              <Plus size={18} />
            </button>
          </div>
          <button
            onClick={() => setDividers((v) => !v)}
            aria-pressed={dividers}
            aria-label={dividers ? 'Hide slide lines' : 'Show slide lines'}
            className="glass flex h-11 w-11 items-center justify-center rounded-full"
          >
            {dividers ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
          <button onClick={() => setSheet('overview')} className="glass flex h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold">
            <GalleryHorizontal size={18} /> Preview swipe
          </button>
        </div>
      )}

      {/* Toolbar */}
      <nav aria-label="Collage tools" className="glass-strong !rounded-none !border-x-0 !border-b-0 pb-[env(safe-area-inset-bottom)] !shadow-none">
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-2 py-1.5">
          {!selected && (
            <>
              <Tool icon={<LayoutTemplate size={22} />} label="Layout" onClick={() => setSheet('template')} />
              <Tool icon={<ImagePlus size={22} />} label="Photos" onClick={() => setPicker({ mode: 'add' })} />
              <Tool icon={<Type size={22} />} label="Text" onClick={newText} />
              <Tool icon={<Palette size={22} />} label="Look" onClick={() => setSheet('look')} />
              <Tool icon={<Wand2 size={22} />} label="Filters" onClick={() => setSheet('filter')} disabled={!firstPhoto} />
            </>
          )}
          {selected && <Tool icon={<Check size={22} />} label="Done" onClick={() => setSelectedId(null)} active />}
          {selPhoto && (
            <>
              <Tool icon={<ImagePlus size={22} />} label={selPhoto.assetId ? 'Replace' : 'Add photo'} onClick={() => setPicker({ mode: 'replace', layerId: selPhoto.id })} />
              <Tool icon={<Wand2 size={22} />} label="Filter" onClick={() => setSheet('filter')} disabled={!selPhoto.assetId} />
              <Tool icon={<SlidersHorizontal size={22} />} label="Adjust" onClick={() => setSheet('adjust')} />
            </>
          )}
          {selText && (
            <>
              <Tool icon={<Type size={22} />} label="Edit" onClick={() => setSheet('text')} />
              <Tool icon={<SlidersHorizontal size={22} />} label="Rotate" onClick={() => setSheet('adjust')} />
            </>
          )}
          {selected && (
            <>
              <Tool icon={<ArrowUpToLine size={22} />} label="Forward" onClick={() => update((p) => moveLayer(p, selected.id, 1))} />
              <Tool icon={<ArrowDownToLine size={22} />} label="Backward" onClick={() => update((p) => moveLayer(p, selected.id, -1))} />
              <Tool
                icon={<Copy size={22} />}
                label="Duplicate"
                onClick={() => {
                  let newId: string | undefined;
                  update((p) => {
                    const r = duplicateLayer(p, selected.id);
                    newId = r.id;
                    return r.project;
                  });
                  setTimeout(() => newId && setSelectedId(newId), 0);
                }}
              />
              <Tool
                icon={<Trash2 size={22} />}
                label="Delete"
                onClick={() => {
                  update((p) => removeLayer(p, selected.id));
                  setSelectedId(null);
                }}
              />
            </>
          )}
        </div>
      </nav>

      {/* Sheets */}
      <BottomSheet open={sheet === 'template'} onClose={() => setSheet(null)} title="Layout">
        <div className="pt-1">
          <p className="text-2 mb-3 text-[13px]">Your photos move into the new layout in order. Text you added stays.</p>
          <TemplateGrid
            format={project.format}
            selectedId={project.templateId}
            onPick={(t) => {
              if (!requirePremium(t, `"${t.name}" is a Premium template.`)) return;
              update((p) => applyTemplate(p, t));
              setSelectedId(null);
              setSheet(null);
            }}
          />
        </div>
      </BottomSheet>

      <TextSheet layer={sheet === 'text' ? selText : undefined} onClose={() => setSheet(null)} onChange={(patch) => patchSelected(patch, `text-${selectedId}`)} ctx={ctx} />

      <LookSheet
        open={sheet === 'look'}
        onClose={() => setSheet(null)}
        style={project.style}
        onChange={(patch) => update((p) => ({ ...p, style: { ...p.style, ...patch } }), `look-${Object.keys(patch).join()}`)}
      />

      <FilterSheet
        open={sheet === 'filter'}
        onClose={() => setSheet(null)}
        assetId={selPhoto?.assetId ?? firstPhoto?.assetId}
        value={filterValue}
        allMode={!selPhoto}
        onChange={(f) => (selPhoto ? patchSelected({ filter: f }, `filter-${selPhoto.id}`) : update((p) => setFilterAll(p, f), 'filter-all'))}
        onApplyAll={(f) => update((p) => setFilterAll(p, f))}
      />

      <AdjustSheet layer={sheet === 'adjust' ? selected : undefined} onClose={() => setSheet(null)} onChange={(patch) => patchSelected(patch, `adjust-${selectedId}`)} />

      <OverviewSheet open={sheet === 'overview'} onClose={() => setSheet(null)} project={project} watermark={!premium} />

      <ExportSheet open={sheet === 'export'} onClose={() => setSheet(null)} project={project} />

      <PhotoPickerSheet
        open={!!picker}
        onClose={() => setPicker(null)}
        multiple={picker?.mode === 'add'}
        tripId={project.tripId}
        onPicked={onPicked}
      />
    </div>
  );
}
