// /lib/cast/castClient.ts

let session: any = null;

export function setCastSession(s: any) {
  session = s;
}

export function getCastSession() {
  return session;
}

export function sendCastMessage(namespace: string, payload: any) {
  if (!session) {
    console.warn("No Cast session available");
    return;
  }

  try {
    session.sendMessage(namespace, payload);
  } catch (e) {
    console.error("Cast sendMessage failed:", e);
  }
}