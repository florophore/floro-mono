export {};

declare global {

    interface SystemAPI {
      openOAuthWindow: (_: string) => void;
      bringToFront: () => void;
    }

    interface Window {
      systemAPI: Promise<SystemAPI>;
    }
  }