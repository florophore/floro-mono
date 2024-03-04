import React, { useContext, useEffect, useState} from "react";
import metaFile from "@floro/common-generators/meta.floro.json";
import { LocalizedPhrases, PhraseKeys } from "@floro/common-generators/floro_modules/text-generator";
import initText from "@floro/common-generators/floro_modules/text-generator/default.locale.json";
import { getJSON } from "@floro/text-generator";
import { useWatchFloroState } from "./FloroListener";
import axios from 'axios';

const FloroTextContext = React.createContext(initText as unknown as LocalizedPhrases);
export interface Props {
  children: React.ReactElement;
  text: LocalizedPhrases;
  cdnHost: string;
  localeLoads: {[key: string]: string}
  disableSSRText?: boolean;
}

export const FloroTextProvider = (props: Props) => {
  const [text, setText] = useState<LocalizedPhrases>(
    props.disableSSRText
      ? (initText as unknown as LocalizedPhrases)
      : props?.text ?? initText
  );

  useEffect(() => {
    (async () => {
      const promises: Promise<null|{localeCode: keyof LocalizedPhrases["localizedPhraseKeys"], phraseKeys: PhraseKeys}>[] = [];
      for (const localeCode in props.localeLoads) {
        promises.push(
          (async () => {
            const phraseKeysRequest = await axios.get<PhraseKeys>(`${props.cdnHost}/locales/${props.localeLoads[localeCode]}`);
            if (!phraseKeysRequest.data) {
              return null;
            }
            text.localizedPhraseKeys[localeCode] = phraseKeysRequest.data;
            return {
              localeCode: localeCode as keyof LocalizedPhrases["localizedPhraseKeys"],
              phraseKeys: phraseKeysRequest.data
            }
          })()
        )
      }
      const result = await Promise.all(promises)
      const nextText = result.reduce((text, localeInfo) => {
        if (!localeInfo){
          return text;
        }
        text.localizedPhraseKeys[localeInfo.localeCode] = localeInfo?.phraseKeys;
        return text;
      }, text)
      setText({...nextText});
    })()
  }, []);

  const watchedText = useWatchFloroState(metaFile.repositoryId, text, getJSON);
  return (
    <FloroTextContext.Provider value={watchedText}>
      {props.children}
    </FloroTextContext.Provider>
  );
};

export const useFloroText = () => {
    return useContext(FloroTextContext);
}