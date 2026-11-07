import { useEffect, useState } from 'react';
import { getMedia, type MediaRecord } from '../../services/mediaStore';

/** Loads a shot's on-device media and manages its object URL lifecycle. */
export function useShotMedia(listId: string, shotId: string, hasMedia?: boolean, rev?: number) {
  const [state, setState] = useState<{ url?: string; record?: MediaRecord }>({});

  useEffect(() => {
    if (!hasMedia) {
      setState({});
      return;
    }
    let url: string | undefined;
    let cancelled = false;
    getMedia(listId, shotId).then((record) => {
      if (cancelled || !record) return;
      url = URL.createObjectURL(record.blob);
      setState({ url, record });
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [listId, shotId, hasMedia, rev]);

  return state;
}
