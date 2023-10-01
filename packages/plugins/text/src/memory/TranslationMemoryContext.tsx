import React, { createContext, useContext, useMemo } from "react";
import { makeQueryRef, useFloroContext } from "../floro-schema-api";

export interface TranslationMemory {
  [localeCode: string]: {
    [sourcePlainTextValue: string]: Set<string>;
  };
}

export interface ITranslationMemoryContext {
  translationMemory: TranslationMemory;
}
const TermMemoryContext = createContext({
  translationMemory: {},
} as ITranslationMemoryContext);

interface Props {
  children: React.ReactElement;
}

const TranslationMemoryProvider = (props: Props) => {
  const { applicationState } = useFloroContext();

  const translationMemory = useMemo((): TranslationMemory => {
    if (!applicationState?.text?.localeSettings?.locales) {
        return {};
    }
    return (
      applicationState?.text.localeSettings?.locales?.reduce(
        (acc, locale): TranslationMemory => {
          const sourceLocaleRef =
            locale?.defaultTranslateFromLocaleRef ??
            applicationState?.text?.localeSettings?.defaultLocaleRef;
          const localeRef = makeQueryRef(
            "$(text).localeSettings.locales.localeCode<?>",
            locale.localeCode
          );
          if (!sourceLocaleRef || sourceLocaleRef == localeRef) {
            return acc;
          }
          acc[locale.localeCode] = {};
          const translations = applicationState?.text?.phraseGroups
            ?.flatMap((phraseGroup) => phraseGroup?.phrases)
            ?.reduce((translationAgg, phrase) => {
              const targetPhrase = phrase?.phraseTranslations.find(
                (pt) => pt.id == localeRef
              );
              const sourcePhrase = phrase?.phraseTranslations.find(
                (pt) => pt.id == sourceLocaleRef
              );
              const targetLinkVariants = phrase?.linkVariables
                .flatMap((lv) => lv.translations)
                .filter((t) => t.id == localeRef);
              const sourceLinkVariants = phrase?.linkVariables
                .flatMap((lv) => lv.translations)
                .filter((t) => t.id == sourceLocaleRef);
              const targetInterpolationVariants = phrase?.interpolationVariants
                .flatMap((iv) => iv.localeRules)
                .filter((lr) => lr.id == localeRef);
              const sourceInterpolationVariants = phrase?.interpolationVariants
                .flatMap((iv) => iv.localeRules)
                .filter((lr) => lr.id == sourceLocaleRef);
              if (
                (sourcePhrase?.plainText?.trim() ?? "") != "" &&
                !translationAgg[
                  sourcePhrase?.plainText?.trim().toLowerCase() as string
                ]
              ) {
                translationAgg[
                  sourcePhrase?.plainText?.trim().toLowerCase() as string
                ] = new Set<string>();
              }
              if (
                (targetPhrase?.plainText?.trim() ?? "") != "" &&
                (sourcePhrase?.plainText?.trim() ?? "") != "" &&
                (targetPhrase?.richTextHtml?.trim() ?? "") != "" &&
                !translationAgg[
                  sourcePhrase?.plainText?.trim().toLowerCase() as string
                ]?.has(targetPhrase?.richTextHtml ?? "")
              ) {
                translationAgg[
                  sourcePhrase?.plainText?.trim().toLowerCase() as string
                ]?.add(targetPhrase?.richTextHtml as string);
              }

              for (let i = 0; i < targetLinkVariants?.length; ++i) {
                const targetLink = targetLinkVariants?.[i];
                const sourceLink = sourceLinkVariants?.[i];

                if (
                  (sourceLink?.linkDisplayValue?.plainText?.trim() ?? "") !=
                    "" &&
                  !translationAgg[
                    sourceLink?.linkDisplayValue?.plainText?.trim().toLowerCase() as string
                  ]
                ) {
                  translationAgg[
                    sourceLink?.linkDisplayValue?.plainText?.trim().toLowerCase() as string
                  ] = new Set<string>();
                }

                if (
                  (targetLink?.linkDisplayValue?.plainText?.trim() ?? "") !=
                    "" &&
                  (sourceLink?.linkDisplayValue?.plainText?.trim() ?? "") !=
                    "" &&
                  (targetLink?.linkDisplayValue?.richTextHtml?.trim() ?? "") != "" &&
                  !translationAgg[
                    sourceLink?.linkDisplayValue?.plainText?.trim().toLowerCase() as string
                  ]?.has(targetLink?.linkDisplayValue?.richTextHtml ?? "")
                ) {
                  translationAgg[
                    sourceLink?.linkDisplayValue?.plainText?.trim().toLowerCase() as string
                  ]?.add(targetLink?.linkDisplayValue?.richTextHtml as string);
                }
              }

              for (let i = 0; i < targetInterpolationVariants?.length; ++i) {
                const targetInterpolationVariant =
                  targetInterpolationVariants?.[i];
                const sourceInterpolationVariant =
                  sourceInterpolationVariants?.[i];

                if (
                  (sourceInterpolationVariant?.defaultValue?.plainText?.trim() ??
                    "") != "" &&
                  !translationAgg[
                    sourceInterpolationVariant?.defaultValue?.plainText?.trim().toLowerCase() as string
                  ]
                ) {
                  translationAgg[
                    sourceInterpolationVariant?.defaultValue?.plainText?.trim().toLowerCase() as string
                  ] = new Set<string>();
                }

                if (
                  (targetInterpolationVariant?.defaultValue?.plainText?.trim() ??
                    "") != "" &&
                  (targetInterpolationVariant?.defaultValue?.richTextHtml?.trim() ??
                    "") != "" &&
                  (sourceInterpolationVariant?.defaultValue?.plainText?.trim() ??
                    "") != "" &&
                  !translationAgg[
                    sourceInterpolationVariant?.defaultValue?.plainText?.trim().toLowerCase() as string
                  ]?.has(
                    targetInterpolationVariant?.defaultValue?.richTextHtml ?? ""
                  )
                ) {
                  translationAgg[
                    sourceInterpolationVariant?.defaultValue?.plainText?.trim().toLowerCase() as string
                  ]?.add(
                    targetInterpolationVariant?.defaultValue?.richTextHtml as string
                  );
                }
              }

              return translationAgg;
            }, acc[locale.localeCode]);
          return {
            [locale.localeCode]: translations,
            ...acc,
          };
        },
        {} as TranslationMemory
      ) ?? ({} as TranslationMemory)
    );
  }, [applicationState]);

  return (
    <TermMemoryContext.Provider
      value={{
        translationMemory,
      }}
    >
      {props.children}
    </TermMemoryContext.Provider>
  );
};

export default TranslationMemoryProvider;

export const useTranslationMemory = () => {
  const ctx = useContext(TermMemoryContext);
  return ctx?.translationMemory;
};
