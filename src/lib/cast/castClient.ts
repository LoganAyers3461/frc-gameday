// /lib/cast/castClient.ts

let session: any = null;
const NAMESPACE = "urn:x-cast:frc.gameday";

export function setCastSession(s: any) {
  session = s;
}



let mockSessionEnabled = true;

export function getCastSession() {
  if (mockSessionEnabled) {
    return {
      sendMessage: (
        namespace: string,
        data: any,
        onSuccess: () => void,
        onError: (err: any) => void
      ) => {
        console.log("🧪 MOCK SEND", { namespace, data });
        onSuccess();
      },
    };
  }

  return session; // your actual session
}

export function sendCastMessage(data: any, p0?: { type: string; source: string; }) {
  const session = getCastSession();

  if (!session) {
    console.warn("❌ No Cast session available");
    console.log("📦 WOULD SEND:", data);
    return;
  }

  console.log("📡 Sending to Cast:", data);

  session.sendMessage(
    NAMESPACE,
    data,
    () => console.log("✅ Message sent"),
    (err: any) => console.error("❌ Send failed:", err)
  );
}