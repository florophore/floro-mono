export {};

declare global {
    interface Window {
      systemAPI: Promise<{
        getSystemTheme: () => Promise<string>;
        subscribeToSystemThemeChange: ((string) => void);
      }>;
    }
  }