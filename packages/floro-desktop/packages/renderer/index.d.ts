export {};

declare global {

    interface SystemAPI {
      openOAuthWindow: (_: string) => void;
      bringToFront: () => void;
      openUrl: (url: string) => void,
      buildVersion: string;
    }

    interface Window {
      systemAPI: Promise<SystemAPI>;
      REDIRECT_URL: string;
    }
  }