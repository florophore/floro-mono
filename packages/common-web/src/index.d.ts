import { NormalizedCacheObject } from "@apollo/client";
import { LocalizedPhraseKeys } from "@floro/common-generators/floro_modules/text-generator";
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
      __FLORO_TEXT__: LocalizedPhraseKeys;
    }
  }