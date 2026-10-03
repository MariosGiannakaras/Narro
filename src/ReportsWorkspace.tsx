import { useState } from "react";
import { ReportsOverview } from "./ReportsOverview";
import { ReportsSessions } from "./ReportsSessions";

type ReportsWorkspaceProps = {
  onBack?: () => void;
};

export function ReportsWorkspace({ onBack }: ReportsWorkspaceProps) {
  const [tab, setTab] = useState<"overview" | "sessions">("overview");

  return tab === "sessions" ? (
    <ReportsSessions onBack={onBack} onOpenOverview={() => setTab("overview")} />
  ) : (
    <ReportsOverview onBack={onBack} onOpenSessions={() => setTab("sessions")} />
  );
}
