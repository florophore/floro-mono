export {};

declare global {

    interface SystemAPI {
      getSystemTheme: () => Promise<string>;
      subscribeToSystemThemeChange: (string) => void;
      openOAuthWindow: (string) => void;
    }

    interface Window {
      systemAPI: Promise<SystemAPI>;
    }
  }