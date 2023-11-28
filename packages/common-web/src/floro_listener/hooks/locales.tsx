import React, { useContext, useMemo, useState, useCallback } from "react";
import initText, {
  Locales,
  LocalizedPhrases,
  PhraseKeys,
  getDebugInfo,
  getPhraseValue,
} from "@floro/common-generators/floro_modules/text-generator";
import { useFloroText } from "../FloroTextProvider";
import {
  TextRenderers,
  richTextRenderers,
} from "../FloroTextRenderer";
import { useIsDebugMode } from "../FloroDebugProvider";
import {
  PlainTextRenderers,
  plainTextRenderers,
} from "../FloroPlainTextRenderer";
import Cookies from "js-cookie";

const FloroLocalesContext = React.createContext({
  localeCodes: Object.keys(initText.locales),
  locales: Object.values(initText.locales),
  selectedLocaleCode: Object.keys(initText.locales).find(
    (localeCode: string) => initText.locales[localeCode]?.isGlobalDefault
  ) as keyof LocalizedPhrases["locales"] & string,
  setSelectedLocaleCode: (_: keyof LocalizedPhrases["locales"] & string) => {},
});
export interface Props {
  children: React.ReactElement;
  initLocaleCode?: keyof LocalizedPhrases["locales"] & string;
}
export const FloroLocalesProvider = (props: Props) => {
  const floroText = useFloroText();
  const localeCodes = useMemo(() => {
    return Object.keys(floroText?.locales) as Array<
      keyof LocalizedPhrases["locales"] & string
    >;
  }, [floroText?.locales]);

  const locales = useMemo(() => {
    return Object.values(floroText?.locales) as Array<{
      name: string;
      localeCode: keyof LocalizedPhrases["locales"] & string;
      defaultFallbackCode: (keyof LocalizedPhrases["locales"] & string) | null;
      isGlobalDefault: boolean;
    }>;
  }, [floroText?.locales]);

  const defaultLocaleCode = useMemo(() => {
    return Object.keys(floroText?.locales)?.find((localeCode) => {
      if (floroText.locales[localeCode]?.isGlobalDefault) {
        return true;
      }
      return false;
    }) as keyof LocalizedPhrases["locales"] & string;
  }, [floroText?.locales]);

  const [selectedLocaleCode, _setSelectedLocaleCode] = useState<
    keyof LocalizedPhrases["locales"] & string
  >(
    props?.initLocaleCode && !!floroText.locales?.[props?.initLocaleCode]
      ? props.initLocaleCode
      : defaultLocaleCode
  );

  const setSelectedLocaleCode = useCallback(
    (localeCode: keyof LocalizedPhrases["locales"] & string) => {
      _setSelectedLocaleCode(localeCode);
      Cookies.set("locale-code", localeCode);
    },
    []
  );

  return (
    <FloroLocalesContext.Provider
      value={{
        locales,
        localeCodes,
        selectedLocaleCode,
        setSelectedLocaleCode,
      }}
    >
      {props.children}
    </FloroLocalesContext.Provider>
  );
};

export const useLocales = () => {
  return useContext(FloroLocalesContext);
};

export interface TextDebugOptions {
  debugHex: `#${string}`;
  debugTextColorHex: string;
}

export const useRichText = <
  K extends keyof PhraseKeys,
  ARGS extends {
    [KV in keyof PhraseKeys[K]["variables"]]: PhraseKeys[K]["variables"][KV];
  } &
    {
      [KCV in keyof PhraseKeys[K]["contentVariables"]]: React.ReactElement;
    } &
    {
      [KSC in keyof PhraseKeys[K]["styleClasses"]]: (
        content: React.ReactElement,
        styledContentName: keyof PhraseKeys[K]["styledContents"] & string
      ) => React.ReactElement;
    }
>(
  phraseKey: K,
  ...opts: keyof ARGS extends { length: 0 }
    ? [
        ARGS?,
        TextRenderers<keyof PhraseKeys[K]["styledContents"] & string>?,
        {
          debugHex: `#${string}`,
          debugTextColorHex: string
        }?
      ]
    : [
        ARGS,
        TextRenderers<keyof PhraseKeys[K]["styledContents"] & string>?,
        {
          debugHex: `#${string}`,
          debugTextColorHex: string
        }?
      ]
) => {
  const args = opts?.[0] ?? {} as ARGS;
  const renderers = opts?.[1] ?? richTextRenderers;
  const debugOptions = opts?.[2] ?? {
    debugHex: "#FF0000" as `#${string}`,
    debugTextColorHex: "white",

  }

  const floroText = useFloroText();
  const isDebugMode = useIsDebugMode();
  const { selectedLocaleCode } = useLocales();
  const debugInfo = useMemo(
    () => getDebugInfo(floroText.phraseKeyDebugInfo, phraseKey),
    [phraseKey, floroText.phraseKeyDebugInfo]
  );

  const nodes = getPhraseValue<React.ReactElement, keyof Locales, K>(
    floroText,
    selectedLocaleCode,
    phraseKey,
    args
  );
  return useMemo(() => {
    return renderers.render(
      nodes,
      renderers,
      isDebugMode,
      debugInfo,
      debugOptions.debugHex,
      debugOptions.debugTextColorHex
    );
  }, [
    richTextRenderers,
    renderers,
    isDebugMode,
    debugInfo,
    selectedLocaleCode,
    args,
    phraseKey,
  ]);
};

export const usePlainText = <
  K extends keyof PhraseKeys,
  ARGS extends {
    [KV in keyof PhraseKeys[K]["variables"]]: PhraseKeys[K]["variables"][KV];
  } &
    {
      [KCV in keyof PhraseKeys[K]["contentVariables"]]: string;
    } &
    {
      [KSC in keyof PhraseKeys[K]["styleClasses"]]: (
        content: string,
        styledContentName: keyof PhraseKeys[K]["styledContents"] & string
      ) => string;
    }
>(
  phraseKey: K,
  ...opts: keyof ARGS extends { length: 0 }
    ? [
        ARGS?,
        PlainTextRenderers<keyof PhraseKeys[K]["styledContents"] & string>?
      ]
    : [
        ARGS,
        PlainTextRenderers<keyof PhraseKeys[K]["styledContents"] & string>?
      ]
) => {
  const args = opts[0] ?? ({} as ARGS);
  const renderers = opts?.[1] ?? plainTextRenderers;
  const floroText = useFloroText();
  const { selectedLocaleCode } = useLocales();
  return useMemo(() => {
    const nodes = getPhraseValue<string, keyof Locales, K>(
      floroText,
      selectedLocaleCode,
      phraseKey,
      args
    );
    return renderers.render(nodes, renderers);
  }, [richTextRenderers, renderers, selectedLocaleCode, args, phraseKey]);
};