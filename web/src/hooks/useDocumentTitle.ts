import { useEffect } from 'react';

const SUFFIX = 'Veridian';

/** Keeps the browser tab / screen-reader page title in sync with the route. */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : SUFFIX;
  }, [title]);
}
