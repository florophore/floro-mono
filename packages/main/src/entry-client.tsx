import { ApolloClient, ApolloProvider, NormalizedCache } from '@apollo/client';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from '@floro/common-web/src/App';
import { MainRoutes } from '@floro/common-web/src/Routing';
import { createApolloClient } from '@floro/common-web/src/apollo/create-apollo-client';
import { LocalizedPhrases } from "@floro/common-generators/floro_modules/text-generator";
import defaultText from "@floro/common-generators/floro_modules/text-generator/default.locale.json";
import initLocaleLoads from "@floro/common-generators/floro_modules/text-generator/locale.loads.json";
import Cookies from 'js-cookie';


const client = createApolloClient(import.meta.env?.['VITE_HOST'] ?? 'localhost:9000', !!import.meta.env?.['VITE_IS_SECURE']);

const combineHyradtedTextWithDefault = (hydrationLocaleCode: string, hyrationText: LocalizedPhrases, defaultText: LocalizedPhrases): LocalizedPhrases => {
  if (!hyrationText) {
    return defaultText;
  }
  if (defaultText?.localizedPhraseKeys?.[hydrationLocaleCode] && hyrationText?.localizedPhraseKeys?.[hydrationLocaleCode]) {
    return {
      ...hyrationText,
      localizedPhraseKeys: {
        ...defaultText.localizedPhraseKeys,
        ...hyrationText.localizedPhraseKeys,
        [hydrationLocaleCode]: {
          ...defaultText.localizedPhraseKeys[hydrationLocaleCode],
          ...hyrationText.localizedPhraseKeys[hydrationLocaleCode],
        }
      },
      phraseKeyDebugInfo: {
        ...defaultText.phraseKeyDebugInfo,
        ...hyrationText.phraseKeyDebugInfo,
      }
    }
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
    }
  }
}

const ClientApp = () => {
  const initLocaleCode =
    (Cookies.get?.("locale-code") as keyof LocalizedPhrases["locales"] &
      string) ?? "EN";
  //@ts-ignore
  // CHANGE FOR CODE HMR
  //const text = import.meta.env?.MODE == "development" ? defaultText : window.__FLORO_TEXT__ ?? defaultText;
  // need to combine these
  const text = combineHyradtedTextWithDefault(
    initLocaleCode,
    //@ts-ignore
    window.__FLORO_TEXT__ as LocalizedPhrases,
    defaultText as LocalizedPhrases
  );
  //@ts-ignore
  // CHANGE FOR CODE HMR
  //const localeLoads = import.meta.env?.MODE == "development" ? initLocaleLoads : window.__FLORO_LOCALE_LOADS__ ?? initLocaleLoads;
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
           text={text} routing={MainRoutes} env={import.meta.env?.VITE_BUILD_ENV_NORMALIZED ?? "development"} />
      </BrowserRouter>
    </ApolloProvider>
  )
};

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(ClientApp());