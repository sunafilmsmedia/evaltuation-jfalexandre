declare global {
  interface Window {
    fbq?: (
      action: "track" | "trackCustom",
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

/**
 * Fire a Meta Pixel event. No-op on the server or if the pixel hasn't loaded.
 * Use standard event names ("Lead", "CompleteRegistration", "Contact"…) for
 * automatic optimization in Ads Manager; custom names will go through `trackCustom`.
 */
export function trackFbEvent(
  eventName: string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", eventName, params);
}
