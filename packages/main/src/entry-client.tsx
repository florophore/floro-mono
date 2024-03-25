import { ApolloClient, ApolloProvider, NormalizedCache } from "@apollo/client";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@floro/common-web/src/App";
import { MainRoutes } from "@floro/common-web/src/Routing";
import { createApolloClient } from "@floro/common-web/src/apollo/create-apollo-client";
import { LocalizedPhrases } from "@floro/common-generators/floro_modules/text-generator";
import defaultText from "@floro/common-generators/floro_modules/text-generator/default.locale.json";
import initLocaleLoads from "@floro/common-generators/floro_modules/text-generator/locale.loads.json";
import Cookies from "js-cookie";

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_WEB_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/floro\.io/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const allTextModule =
  import.meta.env?.MODE == "development"
    ? await import(
        "@floro/common-generators/floro_modules/text-generator/text.json"
      )
    : null;

const client = createApolloClient(
  import.meta.env?.["VITE_HOST"] ?? "localhost:9000",
  !!import.meta.env?.["VITE_IS_SECURE"]
);

const combineHyradtedTextWithDefault = (
  hydrationLocaleCode: string,
  hyrationText: LocalizedPhrases,
  defaultText: LocalizedPhrases
): LocalizedPhrases => {
  if (!hyrationText) {
    return defaultText;
  }
  if (
    defaultText?.localizedPhraseKeys?.[hydrationLocaleCode] &&
    hyrationText?.localizedPhraseKeys?.[hydrationLocaleCode]
  ) {
    return {
      ...hyrationText,
      localizedPhraseKeys: {
        ...defaultText.localizedPhraseKeys,
        ...hyrationText.localizedPhraseKeys,
        [hydrationLocaleCode]: {
          ...defaultText.localizedPhraseKeys[hydrationLocaleCode],
          ...hyrationText.localizedPhraseKeys[hydrationLocaleCode],
        },
      },
      phraseKeyDebugInfo: {
        ...defaultText.phraseKeyDebugInfo,
        ...hyrationText.phraseKeyDebugInfo,
      },
    };
  }
  return {
    ...hyrationText,
    localizedPhraseKeys: {
      ...defaultText.localizedPhraseKeys,
      ...hyrationText.localizedPhraseKeys,
    },
    phraseKeyDebugInfo: {
      ...defaultText.phraseKeyDebugInfo,
      ...hyrationText.phraseKeyDebugInfo,
    },
  };
};

const ClientApp = () => {
  const initLocaleCode =
    (Cookies.get?.("locale-code") as keyof LocalizedPhrases["locales"] &
      string) ?? "EN";
  //@ts-ignore
  const text = combineHyradtedTextWithDefault(
    initLocaleCode,
    //@ts-ignore
    window.__FLORO_TEXT__ as LocalizedPhrases,
    import.meta.env?.MODE == "development"
      ? (allTextModule.default as LocalizedPhrases)
      : (defaultText as LocalizedPhrases)
  );
  //@ts-ignore
  const localeLoads = window.__FLORO_LOCALE_LOADS__ ?? initLocaleLoads;
  const initTheme = Cookies.get?.("theme-preference") ?? "light";
  const cdnHost = import.meta.env?.VITE_CDN_HOST;
  return (
    <ApolloProvider client={client as unknown as ApolloClient<NormalizedCache>}>
      <BrowserRouter>
        <App
          cdnHost={cdnHost}
          initLocaleCode={initLocaleCode}
          initTheme={initTheme}
          localeLoads={localeLoads}
          text={text}
          routing={MainRoutes}
          env={import.meta.env?.VITE_BUILD_ENV_NORMALIZED ?? "development"}
          disableSSRText={import.meta.env?.MODE == "development"}
          fathomId={import.meta.env?.VITE_FATHOM_ANALYTICS_ID}
        />
      </BrowserRouter>
    </ApolloProvider>
  );
};

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  ClientApp()
);
