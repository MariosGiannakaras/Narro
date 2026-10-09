import { useEffect, useState } from "react";
import { getListIconAsset } from "./listEditorApi";
import { BuiltinListIcon, isBuiltinListIconId } from "./BuiltinListIcon";

type ListIconProps = {
  listId: string;
  iconAsset: string | null;
  iconId?: string | null;
  fallback: string;
  imageClassName?: string;
};

export function ListIcon({
  listId,
  iconAsset,
  iconId,
  fallback,
  imageClassName,
}: ListIconProps) {
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    setSource(null);
    if (!iconAsset || (iconId && isBuiltinListIconId(iconId))) return;

    let disposed = false;
    let objectUrl: string | null = null;
    void getListIconAsset(listId)
      .then((payload) => {
        if (disposed || !payload) return;
        objectUrl = URL.createObjectURL(
          new Blob([Uint8Array.from(payload.bytes)], { type: payload.mimeType }),
        );
        setSource(objectUrl);
      })
      .catch(() => {
        if (!disposed) setSource(null);
      });

    return () => {
      disposed = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [iconAsset, iconId, listId]);

  if (iconId && isBuiltinListIconId(iconId)) {
    return <BuiltinListIcon id={iconId} className={imageClassName} />;
  }

  return source ? (
    <img className={imageClassName} src={source} alt="" aria-hidden="true" />
  ) : (
    <>{fallback}</>
  );
}
