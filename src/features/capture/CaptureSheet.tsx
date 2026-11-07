import { BottomSheet } from '../../components/ui';
import type { ListShot } from '../../types';
import { CapturePanel } from './CapturePanel';

interface Props {
  listId: string;
  shot?: ListShot;
  onClose: () => void;
}

export function CaptureSheet({ listId, shot, onClose }: Props) {
  return (
    <BottomSheet open={!!shot} onClose={onClose} title={shot ? `Capture: ${shot.title}` : undefined}>
      {shot && <CapturePanel listId={listId} shot={shot} />}
    </BottomSheet>
  );
}
