import { NormalizedCacheObject } from "@apollo/client";

export {};

declare global {

    interface OAuthAPI {
      isDesktopApp: boolean,
      sendResult: (isSuccess: boolean, provider?: string, code?: string|null) => void,
    }

    interface Window {
      OAuthAPI: OAuthAPI;
      __APOLLO_STATE__: NormalizedCacheObject;
    }
  }