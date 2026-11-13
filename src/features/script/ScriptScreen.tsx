import { ClipboardCopy, Lightbulb, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassButton, LargeTitle, SegmentedControl } from '../../components/ui';
import { buildScript, factLabel, SCRIPT_LANGS, SCRIPT_LENGTHS, scriptToText } from '../../data/script';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/useStore';

/** A short spoken line for each shot, with destination facts, in Taglish or Tagalog. */
export function ScriptScreen() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const list = useStore((s) => s.lists.find((l) => l.id === id));
  const lang = useStore((s) => s.scriptLang);
  const setLang = useStore((s) => s.setScriptLang);
  const length = useStore((s) => s.scriptLength);
  const setLength = useStore((s) => s.setScriptLength);
  const [status, setStatus] = useState<string | null>(null);

  if (!list) {
    return (
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+60px)] text-center">
        <h1 className="text-[24px] font-bold">Trip not found</h1>
        <GlassButton variant="primary" className="mt-6" onClick={() => navigate('/trips')}>
          Go to My Trips
        </GlassButton>
      </div>
    );
  }

  const entries = buildScript(list, lang, length);
  const facts = entries.filter((e) => e.fact).length;

  const flash = (m: string) => {
    setStatus(m);
    setTimeout(() => setStatus(null), 1800);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(scriptToText(list, lang, length));
      flash('Copied');
    } catch {
      flash('Copy failed');
    }
  };
  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: `Vlog script: ${list.destinationName}`, text: scriptToText(list, lang, length) });
    } catch {
      /* cancelled */
    }
  };

  return (
    <div>
      <LargeTitle title="Vlog Script" subtitle={`${list.destinationName} · a spiel for every shot`} onBack={() => navigate(-1)} />

      <div className="space-y-3 px-4 pt-4">
        <SegmentedControl label="Script language" options={SCRIPT_LANGS} value={lang} onChange={setLang} />
        <SegmentedControl label="Script length" options={SCRIPT_LENGTHS} value={length} onChange={setLength} />
        <p className="text-2 px-1 text-[13px]">
          Say each line to the camera or use it as a voice-over or caption.
          {facts > 0 ? ` ${facts} shots come with a fact about ${list.destinationName} you can add.` : ''}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <GlassButton size="md" icon={<ClipboardCopy size={16} />} onClick={copy}>
            Copy script
          </GlassButton>
          <GlassButton size="md" icon={<Share2 size={16} />} onClick={share}>
            Share
          </GlassButton>
        </div>
        {status && (
          <p role="status" className="text-center text-[13px] font-medium">
            {status}
          </p>
        )}
      </div>

      <ol className="mt-4 space-y-3 px-4" aria-label="Script lines in shot order">
        {entries.map((e) => (
          <li key={e.shot.id} className={cn('glass rounded-[22px] p-4', e.shot.captured && 'opacity-60')}>
            <p className="text-2 text-[12px] font-semibold uppercase tracking-wide">
              <span className="text-ig-pink">{e.number}.</span> {e.shot.title}
            </p>
            {e.line && <p className="mt-1.5 text-[18px] font-semibold leading-snug">“{e.line}”</p>}
            {e.fact && (
              <p className="mt-2.5 flex gap-2 rounded-2xl bg-ig-pink/10 p-3 text-[14px] leading-snug">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-ig-pink" aria-hidden />
                <span>
                  <b>{factLabel(lang)}</b> {e.fact}
                </span>
              </p>
            )}
          </li>
        ))}
      </ol>

      {list.destinationId === 'boracay' && (
        <p className="text-2 px-6 pb-2 pt-4 text-center text-[12px]">
          Boracay facts were checked in November 2026 against news reports, government documents and encyclopedias. Rules can change, so check the
          latest before you post.
        </p>
      )}
    </div>
  );
}
