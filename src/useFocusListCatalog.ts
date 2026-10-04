import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listenForBoardInvalidation } from "./boardInvalidation";
import { formatInvokeError } from "./diagnosticApi";
import type { HomeSnapshot } from "./HomeDashboard";

type ListOption = { id: string; title: string };

// Subscribe before the initial read; a later committed invalidation supersedes
// every older response. Entry also reads once to recover missed delivery hints.
export function useFocusListCatalog(
  fixtureLists: ListOption[] | undefined,
  refreshKey: number,
  presentationActive: boolean,
) {
  const [lists, setLists] = useState<ListOption[]>(fixtureLists ?? []);
  const [loaded, setLoaded] = useState(Boolean(fixtureLists));
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (fixtureLists) {
      setLists(fixtureLists);
      setLoaded(true);
      setError(null);
      return;
    }
    let disposed = false;
    let revision = 0;
    let unlisten: (() => void) | undefined;
    let subscriptionFailure: string | null = null;
    const refresh = async () => {
      const request = ++revision;
      try {
        const home = await invoke<HomeSnapshot>("get_home_snapshot");
        if (disposed || request !== revision) return;
        setLists(home.lists.map(({ id, title }) => ({ id, title })));
        setLoaded(true);
        setError(subscriptionFailure);
      } catch (failure) {
        if (!disposed && request === revision) {
          setError(`Focus lists could not refresh. ${formatInvokeError(failure)}`);
        }
      }
    };
    void listenForBoardInvalidation(() => { void refresh(); })
      .then((stop) => {
        if (disposed) { stop(); return; }
        unlisten = stop;
        void refresh();
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          // Initial catalog remains usable if the optional event boundary fails.
          subscriptionFailure = `Focus list updates could not start. ${formatInvokeError(failure)}`;
          setError(subscriptionFailure);
          void refresh();
        }
      });
    return () => { disposed = true; revision++; unlisten?.(); };
  }, [fixtureLists, refreshKey, presentationActive]);
  return { lists, loaded, error };
}
