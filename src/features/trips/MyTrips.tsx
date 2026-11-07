import { Copy, Map, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassButton, GlassCard, LargeTitle, ProgressRing } from '../../components/ui';
import { styleLabel, tripLabel } from '../../data/options';
import { deleteListMedia } from '../../services/mediaStore';
import { useStore } from '../../store/useStore';
import { useUI } from '../../store/useUI';

export function MyTrips() {
  const navigate = useNavigate();
  const { lists, deleteList, duplicateList, setActive } = useStore();
  const openCreate = useUI((s) => s.openCreate);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all of its captured media?`)) return;
    await deleteListMedia(id);
    deleteList(id);
  };

  return (
    <div>
      <LargeTitle title="My Trips" subtitle={lists.length ? `${lists.length} saved shot list${lists.length > 1 ? 's' : ''}` : undefined} />
      <div className="space-y-3 px-4 pt-4">
        {lists.length === 0 && (
          <GlassCard className="p-5 text-center">
            <Map className="mx-auto text-orange-500" />
            <p className="mt-2 text-[17px] font-semibold">No saved trips</p>
            <p className="text-2 mt-1 text-[14px]">Your shot lists are saved here automatically.</p>
            <GlassButton variant="primary" className="mt-4" onClick={() => openCreate()}>
              Create a guide
            </GlassButton>
          </GlassCard>
        )}
        {lists.map((l) => {
          const shots = l.shots.filter((s) => !s.skipped);
          const done = shots.filter((s) => s.captured).length;
          return (
            <GlassCard key={l.id} className="p-4">
              <button
                className="flex w-full items-center gap-4 text-left"
                onClick={() => {
                  setActive(l.id);
                  navigate(`/list/${l.id}`);
                }}
              >
                <ProgressRing value={done} total={shots.length} size={56} stroke={6} label={`${l.destinationName} progress`}>
                  <span className="text-[12px] font-bold">
                    {done}/{shots.length}
                  </span>
                </ProgressRing>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[17px] font-semibold">{l.destinationName}</p>
                  <p className="text-2 text-[13px]">
                    {styleLabel(l.style)} · {tripLabel(l.tripType)} · {l.targetLength}s
                  </p>
                  <p className="text-2 text-[12px]">{new Date(l.createdAt).toLocaleDateString()}</p>
                </div>
              </button>
              <div className="mt-3 flex gap-2">
                <GlassButton size="sm" icon={<Copy size={14} />} onClick={() => duplicateList(l.id)}>
                  Duplicate
                </GlassButton>
                <GlassButton size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => remove(l.id, l.destinationName)}>
                  Delete
                </GlassButton>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
