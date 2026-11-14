import { Copy, Images, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GlassButton, GlassCard, LargeTitle } from '../../components/ui';
import { FORMATS } from './formats';
import { NewCollageSheet } from './NewCollageSheet';
import { deleteProject, duplicateProject, listProjects } from './projects';
import type { CollageProject } from './types';

/** Saved collages, newest first. */
export function MyCollages() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [projects, setProjects] = useState<CollageProject[] | null>(null);
  const [creating, setCreating] = useState(params.get('new') === '1');
  const tripId = params.get('trip') ?? undefined;

  const refresh = useCallback(() => listProjects().then(setProjects), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const closeCreate = () => {
    setCreating(false);
    if (params.get('new')) setParams({}, { replace: true });
  };

  const remove = async (p: CollageProject) => {
    if (!confirm(`Delete "${p.name}"? Its photos are removed from Collage Studio, but your trip shots are kept.`)) return;
    await deleteProject(p.id);
    refresh();
  };

  return (
    <div>
      <LargeTitle
        title="My Collages"
        subtitle="Stories, posts and seamless carousels"
        onBack={() => navigate(-1)}
        right={
          <button onClick={() => setCreating(true)} aria-label="New collage" className="flex h-11 w-11 items-center justify-center text-ig-pink">
            <Plus />
          </button>
        }
      />
      <div className="px-4 pt-4">
        {projects && projects.length === 0 && (
          <GlassCard className="p-5 text-center">
            <Images className="mx-auto text-ig-pink" />
            <p className="mt-2 text-[17px] font-semibold">Make your first collage</p>
            <p className="text-2 mt-1 text-[14px]">
              Turn trip shots into an IG Story, a post, or a seamless carousel that swipes like one long photo.
            </p>
            <GlassButton variant="primary" className="mt-4" onClick={() => setCreating(true)}>
              New collage
            </GlassButton>
          </GlassCard>
        )}

        {projects && projects.length > 0 && (
          <>
            <GlassButton variant="primary" size="lg" full icon={<Plus size={20} />} onClick={() => setCreating(true)}>
              New collage
            </GlassButton>
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {projects.map((p) => (
                <li key={p.id} className="glass overflow-hidden rounded-[22px]">
                  <button onClick={() => navigate(`/collage/${p.id}`)} className="block w-full text-left" aria-label={`Open ${p.name}`}>
                    <div className="flex h-36 items-center justify-center bg-black/[0.04] p-2 dark:bg-white/[0.04]">
                      {p.thumb ? (
                        <img src={p.thumb} alt="" className="max-h-full max-w-full rounded-md object-contain shadow" />
                      ) : (
                        <Images className="text-2" aria-hidden />
                      )}
                    </div>
                    <div className="px-3 pt-2">
                      <p className="truncate text-[14px] font-semibold">{p.name}</p>
                      <p className="text-2 text-[12px]">
                        {FORMATS[p.format].label}
                        {p.format === 'carousel' ? ` · ${p.panels} slides` : ''}
                      </p>
                    </div>
                  </button>
                  <div className="flex justify-end gap-1 px-2 pb-1">
                    <button
                      onClick={async () => {
                        await duplicateProject(p.id);
                        refresh();
                      }}
                      aria-label={`Duplicate ${p.name}`}
                      className="text-2 flex h-11 w-11 items-center justify-center"
                    >
                      <Copy size={17} />
                    </button>
                    <button onClick={() => remove(p)} aria-label={`Delete ${p.name}`} className="flex h-11 w-11 items-center justify-center text-red-500">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <NewCollageSheet open={creating} onClose={closeCreate} tripId={tripId} />
    </div>
  );
}
