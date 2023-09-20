export {};

declare global {

    interface SystemAPI {
      getSystemTheme: () => Promise<string>;
      subscribeToSystemThemeChange: (_: string) => void;
      openOAuthWindow: (_: string) => void;
    }

    interface Window {
      systemAPI: Promise<SystemAPI>;
    }
  }