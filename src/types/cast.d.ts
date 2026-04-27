export {};

declare global {
  namespace chrome.cast {
    interface Session {
      sendMessage(
        namespace: string,
        message: any,
        successCallback?: () => void,
        errorCallback?: (error: any) => void
      ): void;
    }
  }

  const cast: any;
  const chrome: any;
}