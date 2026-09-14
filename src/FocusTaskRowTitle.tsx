import { Tooltip } from "./overlayPrimitives";
import "./focusTaskRowTitle.css";

export function FocusTaskRowTitle({ title }: { title: string }) {
  return (
    <Tooltip content={title}>
      <span
        className="focus-panel__task-title"
        data-focus-task-title="true"
        tabIndex={0}
        aria-label={`Task title: ${title}`}
      >
        {title}
      </span>
    </Tooltip>
  );
}
