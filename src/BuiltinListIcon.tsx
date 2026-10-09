import type { CSSProperties } from "react";
import { BUILTIN_LIST_ICONS } from "./builtinListIconCatalog";
export { BUILTIN_LIST_ICONS, isBuiltinListIconId } from "./builtinListIconCatalog";

const ICON_MAP = new Map(BUILTIN_LIST_ICONS.map((icon) => [icon.id, icon]));
export function BuiltinListIcon({ id, className, style }: {
  id: string;
  className?: string;
  style?: CSSProperties;
}) {
  const icon = ICON_MAP.get(id);
  if (!icon) return null;
  return (
    <svg className={className} style={style} viewBox={icon.viewBox}
      aria-hidden="true" focusable="false"
      fill={icon.filled ? "currentColor" : "none"}
      stroke={icon.filled ? "none" : "currentColor"}
      strokeWidth={icon.filled ? undefined : 1.85}
      strokeLinecap="round" strokeLinejoin="round"
      // Only prebundled compile-time static geometry from local allowlist.
      dangerouslySetInnerHTML={{ __html: icon.markup }} />
  );
}
