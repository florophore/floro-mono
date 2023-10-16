import React, { useContext, useMemo, useState} from "react";
import initText, { Locales, LocalizedPhrases, PhraseKeys, PhraseType, getDebugInfo, getPhraseValue } from "@floro/common-generators/floro_modules/text-generator";
import { useFloroText } from "../FloroTextProvider";
import { TextRenderers, renderers as richTextRenderers } from "../FloroTextRenderer";
import { useIsDebugMode } from "../FloroDebugProvider";
import { PlainTextRenderers, renderers as plainTextRenderers } from "../FloroPlainTextRenderer";


const FloroLocalesContext = React.createContext({
  localeCodes: Object.keys(initText.locales),
  locales: Object.values(initText.locales),
  selectedLocaleCode: Object.keys(initText.locales).find(
    (localeCode: string) => initText.locales[localeCode]?.isGlobalDefault
  ) as keyof LocalizedPhrases["locales"] & string,
  setSelectedLocaleCode: (_: keyof LocalizedPhrases["locales"] & string) => {}
});
export interface Props {
  children: React.ReactElement;
  initLocaleCode?: keyof LocalizedPhrases["locales"]&string;
}
export const FloroLocalesProvider = (props: Props) => {
    const floroText = useFloroText();
    const localeCodes = useMemo(() => {
        return Object.keys(floroText?.locales) as Array<keyof LocalizedPhrases["locales"]&string>;
    }, [floroText?.locales]);

    const locales = useMemo(() => {
        return Object.values(floroText?.locales) as Array<{
            name: string,
            localeCode: keyof LocalizedPhrases["locales"]&string,
            defaultFallbackCode: (keyof LocalizedPhrases["locales"]&string)|null,
            isGlobalDefault: boolean,
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

    const [selectedLocaleCode, setSelectedLocaleCode] = useState<keyof LocalizedPhrases["locales"] & string>(
        props?.initLocaleCode && !!floroText.locales?.[props?.initLocaleCode] ? props.initLocaleCode : defaultLocaleCode
    )

  return (
    <FloroLocalesContext.Provider value={{
        locales,
        localeCodes,
        selectedLocaleCode,
        setSelectedLocaleCode
    }}>
      {props.children}
    </FloroLocalesContext.Provider>
  );
};

export const useLocales = () => {
    return useContext(FloroLocalesContext);
}

export interface TextDebugOptions {
    debugHex: `#${string}`;
    debugTextColorHex: string;

}

export const useRichText = <
  K extends keyof PhraseKeys,
  A extends PhraseKeys[K]["variables"]
>(
  phraseKey: K,
  phraseArgs: A,
  renderers: TextRenderers = richTextRenderers,
  debugOptions = {
    debugHex: "#FF0000" as `#${string}`,
    debugTextColorHex: "white",
  }
) => {
  const floroText = useFloroText();
  const isDebugMode = useIsDebugMode();
  const { selectedLocaleCode } = useLocales();
  const debugInfo = useMemo(
    () => getDebugInfo(floroText.phraseKeyDebugInfo, phraseKey),
    [phraseKey, floroText.phraseKeyDebugInfo]
  );
  return useMemo(() => {
    const nodes = getPhraseValue(
      floroText,
      selectedLocaleCode,
      phraseKey,
      phraseArgs
    );
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
    phraseArgs,
    phraseKey,
  ]);
};

export const usePlainText =<
K extends keyof PhraseKeys,
A extends PhraseKeys[K]["variables"]
> (phraseKey: K, phraseArgs: A, renderers: PlainTextRenderers = plainTextRenderers) => {
    const floroText = useFloroText();
    const {selectedLocaleCode } = useLocales();
    return useMemo(() => {
      const nodes = getPhraseValue(
        floroText,
        selectedLocaleCode,
        phraseKey,
        phraseArgs
      );
      return renderers.render(nodes, renderers);
    }, [
      richTextRenderers,
      renderers,
      selectedLocaleCode,
      phraseArgs,
      phraseKey,
    ]);

}