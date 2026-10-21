import { type CSSProperties, useEffect, useRef, useState } from "react";
import { formatInvokeError } from "./diagnosticApi";
import { ListIcon } from "./ListIcon";
import { ActionIcon } from "./ActionIcon";
import { listIconContrast } from "./listSpectrumColor";
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
  return {
    "--archived-list-accent": color,
    "--archived-list-icon-contrast": listIconContrast(color),
  } as CSSProperties;
}

export function ArchivedListsPanel({ fixtureLists, embedded = false }: ArchivedListsPanelProps) {
  const [lists, setLists] = useState<ArchivedListSummary[] | null>(fixtureLists ?? null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const readInFlightRef = useRef(false);
  const mountedRef = useRef(false);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArchivedListSummary | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  // Shared immediate write owner: restore and permanent delete cannot overlap
  // before React pending flags publish or across different list rows.
  const archiveMutationInFlightRef = useRef(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    if (fixtureLists) return () => { mountedRef.current = false; };
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
      mountedRef.current = false;
    };
  }, [fixtureLists]);

  async function retryArchiveRead() {
    if (fixtureLists || lists !== null || !loadError || readInFlightRef.current) return;
    readInFlightRef.current = true;
    setLoadError(null);
    try {
      const payload = await getArchivedListsForSettings();
      if (mountedRef.current) {
        setLists(payload);
        setLoadError(null);
      }
    } catch (failure: unknown) {
      if (mountedRef.current) setLoadError(formatInvokeError(failure));
    } finally {
      readInFlightRef.current = false;
    }
  }

  async function restoreList(list: ArchivedListSummary) {
    if (pendingRestoreId || deletePending || archiveMutationInFlightRef.current) return;
    archiveMutationInFlightRef.current = true;
    setPendingRestoreId(list.id);
    setLoadError(null);
    try {
      await restoreListFromSettings(list.id);
      setLists((current) => current?.filter((item) => item.id !== list.id) ?? current);
    } catch (failure) {
      setLoadError(formatInvokeError(failure));
    } finally {
      archiveMutationInFlightRef.current = false;
      setPendingRestoreId(null);
    }
  }

  function requestDelete(list: ArchivedListSummary) {
    if (pendingRestoreId || deletePending || archiveMutationInFlightRef.current) return;
    setDeleteTarget(list);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!deleteTarget || deletePending || pendingRestoreId || archiveMutationInFlightRef.current) return;
    archiveMutationInFlightRef.current = true;
    setDeletePending(true);
    setDeleteError(null);
    try {
      await permanentlyDeleteListFromSettings(deleteTarget.id);
      setLists((current) => current?.filter((item) => item.id !== deleteTarget.id) ?? current);
      setDeleteTarget(null);
    } catch (failure) {
      setDeleteError(formatInvokeError(failure));
    } finally {
      archiveMutationInFlightRef.current = false;
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

      {lists?.length === 0 ? null : (
        <p className="archived-lists-panel__scope-note">
          Restore a list to return it to your active workspace. Permanent deletion is available only here in the archive.
        </p>
      )}

      {loadError ? (
        <div className="archived-lists-panel__error" role="alert">
          <span>{loadError}</span>
          {lists === null ? (
            <button type="button" className="archived-lists-panel__retry motion-interactive"
              data-archived-lists-retry="true" onClick={() => void retryArchiveRead()}>
              Retry loading archived lists
            </button>
          ) : null}
        </div>
      ) : null}

      {lists === null && !loadError ? (
        <div className="archived-lists-panel__loading" role="status">Loading archived lists…</div>
      ) : lists?.length === 0 ? (
        <div className="archived-lists-panel__empty-grid" data-archived-lists-empty="true">
          <div className="archived-lists-panel__empty archived-lists-panel__empty--ghost" data-archived-empty-ghost="true" aria-hidden="true" />
          <div className="archived-lists-panel__empty" data-archived-lists-empty-message="true">
            <span className="archived-lists-panel__empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                <rect x="3" y="4" width="18" height="4" rx="1" />
                <path d="M5 8v11h14V8M10 12h4" />
              </svg>
            </span>
            <strong>No archived lists found</strong>
            <span>Looks like you do not have any archived lists at this moment.</span>
          </div>
          <div className="archived-lists-panel__empty archived-lists-panel__empty--ghost" data-archived-empty-ghost="true" aria-hidden="true" />
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
                <header className="archived-list-row__header">
                  <span className="archived-list-row__icon" aria-hidden="true">
                    <ListIcon
                      listId={list.id}
                      iconAsset={list.iconAsset}
                      iconId={list.iconId}
                      fallback={initial}
                      imageClassName="archived-list-row__icon-image"
                    />
                  </span>
                  <h2 className="archived-list-row__title type-section-title" title={list.title}>{list.title}</h2>
                </header>
                <div className="archived-list-row__copy">
                  {list.previewTasks.length > 0 ? (
                    <div className="archived-list-row__previews" aria-label={`Task previews for ${list.title}`} data-archived-list-previews="true">
                      {list.previewTasks.map((task, index) => (
                        <div key={task.id} className="archived-list-row__preview" data-archived-preview-task-id={task.id}>
                          <span className="archived-list-row__preview-ordinal" aria-hidden="true">{index + 1}</span>
                          <span className="archived-list-row__preview-title" title={task.title}>{task.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="archived-list-row__actions">
                  <button
                    type="button"
                    className="archived-list-row__restore motion-interactive"
                    aria-label={`Unarchive ${list.title}`}
                    disabled={Boolean(pendingRestoreId) || deletePending}
                    onClick={() => void restoreList(list)}
                  >
                    <ActionIcon name="undo" size={14} />
                    {restoring ? "Unarchiving…" : "Unarchive"}
                  </button>
                  <button
                    type="button"
                    className="archived-list-row__delete motion-interactive"
                    aria-label={`Delete Forever ${list.title}`}
                    disabled={Boolean(pendingRestoreId) || deletePending}
                    onClick={() => requestDelete(list)}
                  >
                    <ActionIcon name="trash" size={14} />
                    Delete Forever
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
            if (!deletePending && !archiveMutationInFlightRef.current) {
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
