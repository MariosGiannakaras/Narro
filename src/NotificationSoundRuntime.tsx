import { useEffect } from "react";
import { connectNotificationSounds } from "./notificationSoundDelivery";

export function NotificationSoundRuntime() {
  useEffect(connectNotificationSounds, []);
  return null;
}
