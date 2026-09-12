import { type CSSProperties, useEffect, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import { ListMutationConfirmDialog } from "./ListMutationConfirmDialog";
import {
  getArchivedListsForSettings,
  permanentlyDeleteListFromSettings,
  restoreListFromSettings,
  type ArchivedListSummary,
} from "./listSettingsApi";
import "./archivedListsPanel.css";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

type ArchivedListsPanelProps = {
  fixtureLists?: ArchivedListSummary[];
  embedded?: boolean;
};

function listAccent(color: string | null): CSSProperties | undefined {
  if (!color || !HEX_COLOR.test(color)) return undefined;
  return { "--archived-list-accent": color } as CSSProperties;
}

export function ArchivedListsPanel({ fixtureLists, embedded = false }: ArchivedListsPanelProps) {
  const [lists, setLists] = useState<ArchivedListSummary[] | null>(fixtureLists ?? null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArchivedListSummary | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (fixtureLists) return;
    let disposed = false;
    void getArchivedListsForSettings()
      .then((payload) => {
        if (!disposed) {
          setLists(payload);
          setLoadError(null);
        }
      })
      .catch((failure: unknown) => {
        if (!disposed) {
          setLists(null);
          setLoadError(formatInvokeError(failure));
        }
      });
    return () => {
      disposed = true;
    };
  }, [fixtureLists]);

  async function restoreList(list: ArchivedListSummary) {
    if (pendingRestoreId || deletePending) return;
    setPendingRestoreId(list.id);
    setLoadError(null);
    try {
      await restoreListFromSettings(list.id);
      setLists((current) => current?.filter((item) => item.id !== list.id) ?? current);
    } catch (failure) {
      setLoadError(formatInvokeError(failure));
    } finally {
      setPendingRestoreId(null);
    }
  }

  function requestDelete(list: ArchivedListSummary) {
    if (pendingRestoreId || deletePending) return;
    setDeleteTarget(list);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!deleteTarget || deletePending) return;
    setDeletePending(true);
    setDeleteError(null);
    try {
      await permanentlyDeleteListFromSettings(deleteTarget.id);
      setLists((current) => current?.filter((item) => item.id !== deleteTarget.id) ?? current);
      setDeleteTarget(null);
    } catch (failure) {
      setDeleteError(formatInvokeError(failure));
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <section
      className={`archived-lists-panel${embedded ? " archived-lists-panel--embedded" : ""}`}
      data-archived-lists-panel="true"
      aria-labelledby={embedded ? undefined : "archived-lists-title"}
      aria-label={embedded ? "Archived lists" : undefined}
    >
      {embedded ? (
        <div className="archived-lists-panel__embedded-helper">
          <span className="archived-lists-panel__helper type-metadata">Your archived lists</span>
        </div>
      ) : (
        <header className="archived-lists-panel__header">
          <div>
            <p className="archived-lists-panel__eyebrow type-metadata">Archive</p>
            <h1 id="archived-lists-title" className="type-page-title">Archived lists</h1>
          </div>
          <span className="archived-lists-panel__helper type-metadata">Your archived lists</span>
        </header>
      )}

      <p className="archived-lists-panel__scope-note">
        Restore a list to return it to your active workspace. Permanent deletion is available only here in the archive.
      </p>

      {loadError ? <div className="archived-lists-panel__error" role="alert">{loadError}</div> : null}

      {lists === null && !loadError ? (
        <div className="archived-lists-panel__loading" role="status">Loading archived lists…</div>
      ) : lists?.length === 0 ? (
        <div className="archived-lists-panel__empty" data-archived-lists-empty="true">
          <span className="archived-lists-panel__empty-icon" aria-hidden="true">⌁</span>
          <strong>No archived lists found</strong>
          <span>Lists you archive from Home will appear here and can be restored later.</span>
        </div>
      ) : (
        <div className="archived-lists-panel__items">
          {lists?.map((list) => {
            const restoring = pendingRestoreId === list.id;
            const initial = list.title.trim().charAt(0).toUpperCase() || "L";
            return (
              <article
                key={list.id}
                className="archived-list-row"
                data-archived-list-id={list.id}
                style={listAccent(list.color)}
              >
                <span className="archived-list-row__icon" aria-hidden="true">{initial}</span>
                <div className="archived-list-row__copy">
                  <h2 className="archived-list-row__title type-section-title">{list.title}</h2>
                  <span className="type-metadata">Archived · history preserved</span>
                </div>
                <div className="archived-list-row__actions">
                  <button
                    type="button"
                    className="archived-list-row__restore motion-interactive"
                    disabled={Boolean(pendingRestoreId) || deletePending}
                    onClick={() => void restoreList(list)}
                  >
                    {restoring ? "Restoring…" : "Restore"}
                  </button>
                  <button
                    type="button"
                    className="archived-list-row__delete motion-interactive"
                    disabled={Boolean(pendingRestoreId) || deletePending}
                    onClick={() => requestDelete(list)}
                  >
                    Permanently delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {deleteTarget ? (
        <ListMutationConfirmDialog
          action="delete"
          listTitle={deleteTarget.title}
          pending={deletePending}
          error={deleteError}
          onCancel={() => {
            if (!deletePending) {
              setDeleteTarget(null);
              setDeleteError(null);
            }
          }}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}
    </section>
  );
}
