/**
 * Generate a unique device ID based on browser characteristics
 * This creates a stable identifier that persists across browser sessions
 */
export function getDeviceId(): string {
  const DEVICE_ID_KEY = "device_id";

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    const userAgent = navigator.userAgent;
    const screenResolution = `${screen.width}x${screen.height}`;
    const language = navigator.language;

    const characteristics = `${userAgent}-${screenResolution}-${language}`;

    let hash = 0;
    for (let i = 0; i < characteristics.length; i++) {
      const char = characteristics.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    deviceId = `device_${Math.abs(hash)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function generateSessionId(gameType: string): string {
  const deviceId = getDeviceId();
  return `${deviceId}_${gameType}`;
}

export function getSessionId(gameType: string): string {
  return generateSessionId(gameType);
}

export function clearDeviceId(): void {
  localStorage.removeItem("device_id");
}
