import { NormalizedCacheObject } from "@apollo/client";
import { AuthenticationResult } from "@floro/graphql-schemas/src/generated/main-client-graphql";

export {};

declare global {

    interface OAuthAPI {
      isDesktopApp: boolean,
      sendResult: (isSuccess: boolean, provider?: string, authResult?: AuthenticationResult) => void,
    }

    interface Window {
      OAuthAPI: OAuthAPI;
      __APOLLO_STATE__: NormalizedCacheObject;
      REDIRECT_URL: string;
    }
  }