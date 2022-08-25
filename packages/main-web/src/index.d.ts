export {};

declare global {

    interface OAuthAPI {
      isDesktopApp: boolean,
      sendResult: (isSuccess: boolean, provider: string, code?: string) => void,
    }

    interface Window {
      OAuthAPI: OAuthAPI;
    }
  }