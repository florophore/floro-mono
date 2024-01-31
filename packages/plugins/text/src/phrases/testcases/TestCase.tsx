import React, { useMemo, useCallback, useEffect } from "react";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useExtractQueryArgs,
  useFloroContext,
  useFloroState,
} from "../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";

import ColorPalette from "@floro/styles/ColorPalette";
import MockValueRow from "./MockValueRow";
import { useDiffColor } from "../../diff";

const Container = styled.div``;

const SubContainer = styled.div`
  padding: 0;
  margin-bottom: 8px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  padding: 16px;
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 24px;
  background: ${(props) =>
    props.theme.name == "light"
      ? ColorPalette.extraLightGray
      : ColorPalette.darkerGray};
`;

const InputsContainer = styled.div`
  padding: 0;
  margin-bottom: 8px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  padding: 16px;
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  background: ${(props) => props.theme.background};
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const RequiresRevision = styled.h1`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.warningTextColor};
  font-style: italic;
  padding: 0;
  margin: 0;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const DeleteVarContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
  padding-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DeleteVar = styled.img`
  height: 32px;
  width: 32px;
  pointer-events: none;
  user-select: none;
`;

const DisplayText = styled.p`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

interface Comparator {
  intComparatorValue: number;
  floatComparatorValue: number;
  stringComparatorValue: string;
  booleanComparatorValue: boolean;
}

const getComparatorValue = (
  varType: "integer" | "float" | "boolean" | "string",
  comparator: Comparator
) => {
  if (varType == "integer") {
    return comparator?.intComparatorValue ?? 0;
  }
  if (varType == "float") {
    return comparator?.floatComparatorValue ?? 0;
  }
  if (varType == "boolean") {
    return comparator?.booleanComparatorValue ?? false;
  }
  return comparator?.stringComparatorValue ?? "";
};

const isStatementTrue = <T extends number | string | boolean>(
  value: T,
  comparisonValue: T,
  varType: "integer" | "float" | "boolean" | "string",
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "ends_with" | "is_fractional"
): boolean => {
  if (operator == "eq") {
    return value == comparisonValue;
  }
  if (operator == "neq") {
    return value != comparisonValue;
  }
  if (varType == "boolean" || varType == "string") {
    return false;
  }
  const numberValue: number = value as number;
  const comparisonNumberValue: number = comparisonValue as number;
  if (operator == "gt") {
    return numberValue > comparisonNumberValue;
  }
  if (operator == "gte") {
    return numberValue >= comparisonNumberValue;
  }
  if (operator == "lt") {
    return numberValue < comparisonNumberValue;
  }
  if (operator == "lte") {
    return numberValue <= comparisonNumberValue;
  }
  if (operator == "ends_with") {
    return (numberValue?.toString() ?? "").endsWith(comparisonNumberValue.toString() ?? "-1");
  }
  if (varType == "integer") {
    return false;
  }

  if (operator == "is_fractional" && typeof numberValue == "number") {
    return numberValue % 1 != 0;
  }
  return false;
};

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  fallbackLocale:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  globalFallbackLocale:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  localeTest: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>"];
  localeTestRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>"];
  onRemove: (
    variable: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>"]
  ) => void;
}

const TestCase = (props: Props) => {
  const theme = useTheme();
  const { commandMode, applicationState } = useFloroContext();

  const selectedLocaleRef = props?.selectedLocale?.localeCode
    ? makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        props?.selectedLocale.localeCode
      )
    : (null as unknown as PointerTypes["$(text).localeSettings.locales.localeCode<?>"]);

  const fallbackLocaleRef = props?.fallbackLocale?.localeCode
    ? makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        props?.fallbackLocale.localeCode
      )
    : (null as unknown as PointerTypes["$(text).localeSettings.locales.localeCode<?>"]);

  const globalFallbackLocaleRef = props?.globalFallbackLocale?.localeCode
    ? makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        props?.globalFallbackLocale.localeCode
      )
    : (null as unknown as PointerTypes["$(text).localeSettings.locales.localeCode<?>"]);

  const [mockValues, setMockValues] = useFloroState(
    `${props.localeTestRef}.mockValues`
  );

  useEffect(() => {
    if (commandMode == "edit") {
      const mockValuesString = JSON.stringify(mockValues);
      const nextMocks =
        props.phrase.variables?.map?.(
          (
            variable
          ): SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>"] => {
            const varRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"] = `${
              props.phraseRef
            }.variables.id<${variable.id as string}>`;
            const existingVar = mockValues?.find(
              (mv) => mv.variableRef == varRef
            );
            if (existingVar) {
              return existingVar;
            }
            if (variable.varType == "float") {
              return {
                variableRef: varRef,
                floatMockValue: 0,
                intMockValue: undefined,
                booleanMockValue: undefined,
                stringMockValue: undefined,
              };
            }
            if (variable.varType == "integer") {
              return {
                variableRef: varRef,
                floatMockValue: undefined,
                intMockValue: 0,
                booleanMockValue: undefined,
                stringMockValue: undefined,
              };
            }
            if (variable.varType == "boolean") {
              return {
                variableRef: varRef,
                floatMockValue: undefined,
                intMockValue: undefined,
                booleanMockValue: true,
                stringMockValue: undefined,
              };
            }
            return {
              variableRef: varRef,
              floatMockValue: undefined,
              intMockValue: undefined,
              booleanMockValue: undefined,
              stringMockValue: "",
            };
          }
        ) ?? [];
      const mockNextString = JSON.stringify(nextMocks);
      if (mockNextString != mockValuesString) {
        setMockValues(nextMocks);
      }
    }
  }, [commandMode, mockValues, props.phrase.variables, setMockValues]);

  const onRemove = useCallback(() => {
    if (props.localeTest) {
      props.onRemove(props.localeTest);
    }
  }, [props.localeTest, props.onRemove]);

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);

  const varReplacementMap = useMemo(() => {
    return props.phrase?.variables?.reduce((acc, variable) => {
      const varRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"] = `${props.phraseRef}.variables.id<${variable.id}>`;
      const mockValue = mockValues?.find((v) => v.variableRef == varRef);
      if (!mockValue) {
        return acc;
      }
      let value!: number | string | boolean;
      if (variable.varType == "integer") {
        value = mockValue?.intMockValue ?? 0;
      }
      if (variable.varType == "float") {
        value = mockValue?.floatMockValue ?? 0;
      }
      if (variable.varType == "string") {
        value = mockValue?.stringMockValue ?? "";
      }
      if (variable.varType == "boolean") {
        value = mockValue?.booleanMockValue ?? false;
      }
      return {
        ...acc,
        [`${variable.name}`]: value,
      };
    }, {} as { [key: string]: number | string | boolean });
  }, [mockValues, props.phrase?.variables, applicationState]);

  const contentVarReplacementMap = useMemo(() => {
    return props.phrase?.contentVariables?.reduce((acc, contentVariable) => {
      return {
        ...acc,
        [`${contentVariable.name}`]: `<div style="border: 2px dashed ${theme.colors.contrastText}; padding: 16px; margin-top: 16px; margin-bottom: 16px;"><h1>content inserted here</h1></div>`,

      };
    }, {} as { [key: string]: number | string | boolean });
  }, [mockValues, props.phrase?.variables, applicationState]);

  const interpolationVariantReplacementMap = useMemo(() => {
    return props.phrase?.interpolationVariants?.reduce(
      (acc, interpolationVariant) => {
        const premiseVariable = props.phrase.variables.find(
          (v) =>
            interpolationVariant.variableRef ==
            `${props.phraseRef}.variables.id<${v.id}>`
        );
        const premiseVarType = premiseVariable?.varType as
          | "string"
          | "integer"
          | "float"
          | "boolean";
        const selectedLocaleRule = interpolationVariant.localeRules.find(
          (iv) => iv.id == selectedLocaleRef
        );
        for (const condition of selectedLocaleRule?.conditionals ?? []) {
          const value = varReplacementMap[premiseVariable?.name ?? ""];
          if (!value) {
            continue;
          }
          const comparatorValue = getComparatorValue(
            premiseVarType,
            condition as Comparator
          );
          const operator = condition?.operator as
            | "eq"
            | "neq"
            | "gt"
            | "gte"
            | "lt"
            | "lte"
            | "ends_with"
            | "is_fractional";
          if (
            isStatementTrue(value, comparatorValue, premiseVarType, operator)
          ) {
            let allSubConditonsAreTrue = true;
            for (const subcondition of condition?.subconditions ?? []) {
              const variable = props.phrase.variables.find(
                (v) =>
                  subcondition.variableRef ==
                  `${props.phraseRef}.variables.id<${v.id}>`
              );
              if (!variable) {
                allSubConditonsAreTrue = false;
                break;
              }
              const value = varReplacementMap[variable?.name ?? ""];
              if (!value) {
                allSubConditonsAreTrue = false;
                break;
              }
              const operator = subcondition?.operator as
                | "eq"
                | "neq"
                | "gt"
                | "gte"
                | "lt"
                | "lte"
                | "ends_with"
                | "is_fractional";
              const varType = variable?.varType as
                | "string"
                | "integer"
                | "float"
                | "boolean";
              const comparatorValue = getComparatorValue(
                varType,
                subcondition as Comparator
              );
              if (!isStatementTrue(value, comparatorValue, varType, operator)) {
                allSubConditonsAreTrue = false;
                break;
              }
            }
            if (!allSubConditonsAreTrue) {
              continue;
            }
            if ((condition?.resultant?.plainText ?? "").trim() == "") {
              continue;
            }
            return {
              ...acc,
              [interpolationVariant.name]: {
                plainText: condition?.resultant?.plainText ?? "",
                richText: condition?.resultant?.richTextHtml ?? "",
              },
            };
          }
        }
        if ((selectedLocaleRule?.defaultValue?.plainText ?? "").trim() != "") {
          return {
            ...acc,
            [interpolationVariant.name]: {
              plainText: selectedLocaleRule?.defaultValue?.plainText ?? "",
              richText: selectedLocaleRule?.defaultValue?.richTextHtml ?? "",
            },
          };
        }
        if (selectedLocaleRef != fallbackLocaleRef) {
          const fallbackLocaleRule = interpolationVariant.localeRules.find(
            (iv) => iv.id == fallbackLocaleRef
          );
          for (const condition of fallbackLocaleRule?.conditionals ?? []) {
            const value = varReplacementMap[premiseVariable?.name ?? ""];
            if (!value) {
              continue;
            }
            const comparatorValue = getComparatorValue(
              premiseVarType,
              condition as Comparator
            );
            const operator = condition?.operator as
              | "eq"
              | "neq"
              | "gt"
              | "gte"
              | "lt"
              | "lte"
              | "ends_with"
              | "is_fractional";
            if (
              isStatementTrue(value, comparatorValue, premiseVarType, operator)
            ) {
              let allSubConditonsAreTrue = true;
              for (const subcondition of condition?.subconditions ?? []) {
                const variable = props.phrase.variables.find(
                  (v) =>
                    subcondition.variableRef ==
                    `${props.phraseRef}.variables.id<${v.id}>`
                );
                if (!variable) {
                  allSubConditonsAreTrue = false;
                  break;
                }
                const value = varReplacementMap[variable?.name ?? ""];
                if (!value) {
                  allSubConditonsAreTrue = false;
                  break;
                }
                const operator = subcondition?.operator as
                  | "eq"
                  | "neq"
                  | "gt"
                  | "gte"
                  | "lt"
                  | "lte"
                  | "ends_with"
                  | "is_fractional";
                const varType = variable?.varType as
                  | "string"
                  | "integer"
                  | "float"
                  | "boolean";
                const comparatorValue = getComparatorValue(
                  varType,
                  subcondition as Comparator
                );
                if (
                  !isStatementTrue(value, comparatorValue, varType, operator)
                ) {
                  allSubConditonsAreTrue = false;
                  break;
                }
              }
              if (!allSubConditonsAreTrue) {
                continue;
              }
              if ((condition?.resultant?.plainText ?? "").trim() == "") {
                continue;
              }
              return {
                ...acc,
                [interpolationVariant.name]: {
                  plainText: condition?.resultant?.plainText ?? "",
                  richText: condition?.resultant?.richTextHtml ?? "",
                },
              };
            }
          }
          if (
            (fallbackLocaleRule?.defaultValue?.plainText ?? "").trim() != ""
          ) {
            return {
              ...acc,
              [interpolationVariant.name]: {
                plainText: fallbackLocaleRule?.defaultValue?.plainText ?? "",
                richText: fallbackLocaleRule?.defaultValue?.richTextHtml ?? "",
              },
            };
          }
        }

        if (selectedLocaleRef != globalFallbackLocaleRef) {
          const globalFallbackLocaleRule =
            interpolationVariant.localeRules.find(
              (iv) => iv.id == globalFallbackLocaleRef
            );
          for (const condition of globalFallbackLocaleRule?.conditionals ??
            []) {
            const value = varReplacementMap[premiseVariable?.name ?? ""];
            if (!value) {
              continue;
            }
            const comparatorValue = getComparatorValue(
              premiseVarType,
              condition as Comparator
            );
            const operator = condition?.operator as
              | "eq"
              | "neq"
              | "gt"
              | "gte"
              | "lt"
              | "lte"
              | "ends_with"
              | "is_fractional";
            if (
              isStatementTrue(value, comparatorValue, premiseVarType, operator)
            ) {
              let allSubConditonsAreTrue = true;
              for (const subcondition of condition?.subconditions ?? []) {
                const variable = props.phrase.variables.find(
                  (v) =>
                    subcondition.variableRef ==
                    `${props.phraseRef}.variables.id<${v.id}>`
                );
                if (!variable) {
                  allSubConditonsAreTrue = false;
                  break;
                }
                const value = varReplacementMap[variable?.name ?? ""];
                if (!value) {
                  allSubConditonsAreTrue = false;
                  break;
                }
                const operator = subcondition?.operator as
                  | "eq"
                  | "neq"
                  | "gt"
                  | "gte"
                  | "lt"
                  | "lte"
                  | "ends_with"
                  | "is_fractional";
                const varType = variable?.varType as
                  | "string"
                  | "integer"
                  | "float"
                  | "boolean";
                const comparatorValue = getComparatorValue(
                  varType,
                  subcondition as Comparator
                );
                if (
                  !isStatementTrue(value, comparatorValue, varType, operator)
                ) {
                  allSubConditonsAreTrue = false;
                  break;
                }
              }
              if (!allSubConditonsAreTrue) {
                continue;
              }
              if ((condition?.resultant?.plainText ?? "").trim() == "") {
                continue;
              }
              return {
                ...acc,
                [interpolationVariant.name]: {
                  plainText: condition?.resultant?.plainText ?? "",
                  richText: condition?.resultant?.richTextHtml ?? "",
                },
              };
            }
          }
          if (
            (globalFallbackLocaleRule?.defaultValue?.plainText ?? "").trim() !=
            ""
          ) {
            return {
              ...acc,
              [interpolationVariant.name]: {
                plainText:
                  globalFallbackLocaleRule?.defaultValue?.plainText ?? "",
                richText:
                  globalFallbackLocaleRule?.defaultValue?.richTextHtml ?? "",
              },
            };
          }
        }
        return {
          ...acc,
          [interpolationVariant.name]: {
            plainText: "",
            richText: "",
          },
        };
      },
      {} as {
        [key: string]: {
          plainText: string;
          richText: string;
        };
      }
    );
  }, [
    applicationState,
    props.phrase?.interpolationVariants,
    props.phrase?.variables,
    varReplacementMap,
    mockValues,
    selectedLocaleRef,
    fallbackLocaleRef,
    globalFallbackLocaleRef,
  ]);

  const linkVariablesDisplayValueReplacementMap = useMemo(() => {
    return props.phrase?.linkVariables?.reduce(
      (acc, linkVariable) => {
        const linkTranslation = linkVariable?.translations?.find(
          (lv) => lv.id == selectedLocaleRef
        );
        if ((linkTranslation?.linkDisplayValue?.plainText ?? "").trim() != "") {
          const richText = Object.keys(
            interpolationVariantReplacementMap ?? {}
          ).reduce((s, iv) => {
            return s.replaceAll(
              `{${iv}}`,
              interpolationVariantReplacementMap[iv]?.richText ?? ""
            );
          }, linkTranslation?.linkDisplayValue?.richTextHtml ?? "");
          return {
            ...acc,
            [linkVariable.linkName]: {
              richText,
              plainText: linkTranslation?.linkDisplayValue?.plainText ?? "",
            },
          };
        }

        const fallbackLinkTranslation = linkVariable?.translations?.find(
          (lv) => lv.id == fallbackLocaleRef
        );
        if (
          (fallbackLinkTranslation?.linkDisplayValue?.plainText ?? "").trim() !=
          ""
        ) {
          const richText = Object.keys(
            interpolationVariantReplacementMap ?? {}
          ).reduce((s, iv) => {
            return s.replaceAll(
              `{${iv}}`,
              interpolationVariantReplacementMap[iv]?.richText ?? ""
            );
          }, fallbackLinkTranslation?.linkDisplayValue?.richTextHtml ?? "");
          return {
            ...acc,
            [linkVariable.linkName]: {
              richText,
              plainText:
                fallbackLinkTranslation?.linkDisplayValue?.plainText ?? "",
            },
          };
        }

        const globalFallbackLinkTranslation = linkVariable?.translations?.find(
          (lv) => lv.id == globalFallbackLocaleRef
        );
        if (
          (
            globalFallbackLinkTranslation?.linkDisplayValue?.plainText ?? ""
          ).trim() != ""
        ) {
          const richText = Object.keys(
            interpolationVariantReplacementMap ?? {}
          ).reduce((s, iv) => {
            return s.replaceAll(
              `{${iv}}`,
              interpolationVariantReplacementMap[iv]?.richText ?? ""
            );
          }, globalFallbackLinkTranslation?.linkDisplayValue?.richTextHtml ?? "");
          return {
            ...acc,
            [linkVariable.linkName]: {
              richText,
              plainText:
                globalFallbackLinkTranslation?.linkDisplayValue?.plainText ??
                "",
            },
          };
        }
        return {
          ...acc,
          [linkVariable.linkName]: {
            plainText: "",
            richText: "",
          },
        };
      },
      {} as {
        [key: string]: {
          plainText: string;
          richText: string;
        };
      }
    );
  }, [
    applicationState,
    props.phrase?.interpolationVariants,
    props.phrase?.linkVariables,
    props.phrase?.variables,
    interpolationVariantReplacementMap,
    varReplacementMap,
    mockValues,
    selectedLocaleRef,
    fallbackLocaleRef,
    globalFallbackLocaleRef,
  ]);

  const linkVariablesHrefs = useMemo(() => {
    return props.phrase?.linkVariables?.map((linkVariable) => {
      const selectedLinkVarirable = linkVariable.translations?.find(
        (t) => t.id == selectedLocaleRef
      );
      if ((selectedLinkVarirable?.linkHrefValue?.plainText ?? "") != "") {
        const hrefValue = Object.keys(varReplacementMap ?? {}).reduce((s, v) => {
          return s.replaceAll(`{${v}}`, varReplacementMap[v]?.toString() ?? "");
        }, selectedLinkVarirable?.linkHrefValue?.plainText ?? "");
        return {
          hrefValue,
          linkVariableName: linkVariable.linkName,
        };
      }
      const fallbackLinkVarirable = linkVariable.translations?.find(
        (t) => t.id == fallbackLocaleRef
      );
      if ((fallbackLinkVarirable?.linkHrefValue?.plainText ?? "") != "") {
        const hrefValue = Object.keys(varReplacementMap ?? {}).reduce((s, v) => {
          return s.replaceAll(`{${v}}`, varReplacementMap[v]?.toString() ?? "");
        }, fallbackLinkVarirable?.linkHrefValue?.plainText ?? "");
        return {
          hrefValue,
          linkVariableName: linkVariable.linkName,
        };
      }
      const globalFallbackLinkVarirable = linkVariable.translations?.find(
        (t) => t.id == fallbackLocaleRef
      );
      const hrefValue = Object.keys(varReplacementMap ?? {}).reduce((s, v) => {
        return s.replaceAll(`{${v}}`, varReplacementMap[v]?.toString() ?? "");
      }, globalFallbackLinkVarirable?.linkHrefValue?.plainText ?? "");
      return {
        hrefValue,
        linkVariableName: linkVariable.linkName,
      };
    });
  }, [
    applicationState,
    props.phrase?.interpolationVariants,
    props.phrase?.linkVariables,
    props.phrase?.variables,
    varReplacementMap,
    mockValues,
    selectedLocaleRef,
    fallbackLocaleRef,
    globalFallbackLocaleRef,
  ]);

  const styledContentsDisplayValueReplacementMap = useMemo(() => {
    return props.phrase?.styledContents?.reduce(
      (acc, styledContent) => {
        const styledContentLocaleRule = styledContent?.localeRules?.find(
          (lv) => lv.id == selectedLocaleRef
        );
        if ((styledContentLocaleRule?.displayValue?.plainText ?? "").trim() != "") {
          const richTextWithInterpolations = Object.keys(
            interpolationVariantReplacementMap ?? {}
          ).reduce((s, iv) => {
            return s.replaceAll(
              `{${iv}}`,
              interpolationVariantReplacementMap[iv]?.richText ?? ""
            );
          }, styledContentLocaleRule?.displayValue?.richTextHtml ?? "");

          const richText = Object.keys(
            linkVariablesDisplayValueReplacementMap ?? {}
          ).reduce((s, l) => {
            return s.replaceAll(
              `{${l}}`,
              `<span style="color: ${ColorPalette.linkBlue};">${
                linkVariablesDisplayValueReplacementMap[l]?.richText ?? ""
              }</span>`
            );
          }, richTextWithInterpolations);

          return {
            ...acc,
            [styledContent.name]: {
              richText,
              plainText: styledContentLocaleRule?.displayValue?.plainText ?? "",
            },
          };
        }

        const fallbackStyledContentLocaleRule = styledContent?.localeRules?.find(
          (lv) => lv.id == fallbackLocaleRef
        );
        if (
          (fallbackStyledContentLocaleRule?.displayValue?.plainText ?? "").trim() !=
          ""
        ) {
          const richTextWithInterpolations = Object.keys(
            interpolationVariantReplacementMap ?? {}
          ).reduce((s, iv) => {
            return s.replaceAll(
              `{${iv}}`,
              interpolationVariantReplacementMap[iv]?.richText ?? ""
            );
          }, fallbackStyledContentLocaleRule?.displayValue?.richTextHtml ?? "");

          const richText = Object.keys(
            linkVariablesDisplayValueReplacementMap ?? {}
          ).reduce((s, l) => {
            return s.replaceAll(
              `{${l}}`,
              `<span style="color: ${ColorPalette.linkBlue};">${
                linkVariablesDisplayValueReplacementMap[l]?.richText ?? ""
              }</span>`
            );
          }, richTextWithInterpolations);

          return {
            ...acc,
            [styledContent.name]: {
              richText,
              plainText:
                fallbackStyledContentLocaleRule?.displayValue?.plainText ?? "",
            },
          };
        }

        const globalFallbackStyledContentLocaleRule = styledContent?.localeRules?.find(
          (lv) => lv.id == globalFallbackLocaleRef
        );
        if (
          (
            globalFallbackStyledContentLocaleRule?.displayValue?.plainText ?? ""
          ).trim() != ""
        ) {
          const richTextWithInterpolations = Object.keys(
            interpolationVariantReplacementMap ?? {}
          ).reduce((s, iv) => {
            return s.replaceAll(
              `{${iv}}`,
              interpolationVariantReplacementMap[iv]?.richText ?? ""
            );
          }, globalFallbackStyledContentLocaleRule?.displayValue?.richTextHtml ?? "");
          const richText = Object.keys(
            linkVariablesDisplayValueReplacementMap ?? {}
          ).reduce((s, l) => {
            return s.replaceAll(
              `{${l}}`,
              `<span style="color: ${ColorPalette.linkBlue};">${
                linkVariablesDisplayValueReplacementMap[l]?.richText ?? ""
              }</span>`
            );
          }, richTextWithInterpolations);
          return {
            ...acc,
            [styledContent.name]: {
              richText,
              plainText:
                globalFallbackStyledContentLocaleRule?.displayValue?.plainText ??
                "",
            },
          };
        }
        return {
          ...acc,
          [styledContent.name]: {
            plainText: "",
            richText: "",
          },
        };
      },
      {} as {
        [key: string]: {
          plainText: string;
          richText: string;
        };
      }
    );
  }, [
    applicationState,
    props.phrase?.interpolationVariants,
    props.phrase?.linkVariables,
    props.phrase?.variables,
    interpolationVariantReplacementMap,
    linkVariablesDisplayValueReplacementMap,
    varReplacementMap,
    contentVarReplacementMap,
    mockValues,
    selectedLocaleRef,
    fallbackLocaleRef,
    globalFallbackLocaleRef,
  ]);

  const phraseSectionsResult = useMemo(() => {
    return props.phrase.phraseSections.map(phraseSection => {
      const phraseSectionTranslation = phraseSection.localeRules?.find(
        (t) => t.id == selectedLocaleRef
      );

      if ((phraseSectionTranslation?.displayValue?.plainText ?? "").trim() != "") {
        const richTextWithInterpolations = Object.keys(
          interpolationVariantReplacementMap ?? {}
        ).reduce((s, iv) => {
          return s.replaceAll(
            `{${iv}}`,
            interpolationVariantReplacementMap[iv]?.richText ?? ""
          );
        }, phraseSectionTranslation?.displayValue?.richTextHtml ?? "");
        const richTextWithLinks = Object.keys(
          linkVariablesDisplayValueReplacementMap ?? {}
        ).reduce((s, l) => {
          return s.replaceAll(
            `{${l}}`,
            `<span style="color: ${ColorPalette.linkBlue};">${
              linkVariablesDisplayValueReplacementMap[l]?.richText ?? ""
            }</span>`
          );
        }, richTextWithInterpolations);

        const richTextWithStyledContents = Object.keys(
          styledContentsDisplayValueReplacementMap ?? {}
        ).reduce((s, l) => {
          return s.replaceAll(
            `{${l}}`,
            `<span style="color: ${theme.colors.warningTextColor};">${
              styledContentsDisplayValueReplacementMap[l]?.richText ?? ""
            }</span>`
          );
        }, richTextWithLinks);

        const richTextWithVars = Object.keys(varReplacementMap ?? {}).reduce((s, v) => {
          return s.replaceAll(`{${v}}`, varReplacementMap[v]?.toString() ?? "");
        }, richTextWithStyledContents);
        return Object.keys(contentVarReplacementMap ?? {}).reduce((s, v) => {
          return s.replaceAll(`{${v}}`, contentVarReplacementMap[v]?.toString() ?? "");
        }, richTextWithVars)
      }

      const fallbackPhraseSectionTranslation = phraseSection?.localeRules?.find(
        (t) => t.id == fallbackLocaleRef
      );
      if ((fallbackPhraseSectionTranslation?.displayValue?.plainText ?? "").trim() != "") {
        const richTextWithInterpolations = Object.keys(
          interpolationVariantReplacementMap ?? {}
        ).reduce((s, iv) => {
          return s.replaceAll(
            `{${iv}}`,
            interpolationVariantReplacementMap[iv]?.richText ?? ""
          );
        }, fallbackPhraseSectionTranslation?.displayValue?.richTextHtml ?? "");
        const richTextWithLinks = Object.keys(
          linkVariablesDisplayValueReplacementMap ?? {}
        ).reduce((s, l) => {
          return s.replaceAll(
            `{${l}}`,
            `<span style="color: ${ColorPalette.linkBlue};">${
              linkVariablesDisplayValueReplacementMap[l]?.richText ?? ""
            }</span>`
          );
        }, richTextWithInterpolations);

        const richTextWithStyledContents = Object.keys(
          styledContentsDisplayValueReplacementMap ?? {}
        ).reduce((s, l) => {
          return s.replaceAll(
            `{${l}}`,
            `<span style="color: ${ColorPalette.variableRed};">${
              styledContentsDisplayValueReplacementMap[l]?.richText ?? ""
            }</span>`
          );
        }, richTextWithLinks);
        const richTextWithVars = Object.keys(varReplacementMap ?? {}).reduce((s, v) => {
          return s.replaceAll(`{${v}}`, varReplacementMap[v]?.toString() ?? "");
        }, richTextWithStyledContents);
        return Object.keys(contentVarReplacementMap ?? {}).reduce((s, v) => {
          return s.replaceAll(`{${v}}`, contentVarReplacementMap[v]?.toString() ?? "");
        }, richTextWithVars)
      }
      const globalFallbackPhraseSectionTranslation =
        phraseSection.localeRules?.find((t) => t.id == fallbackLocaleRef);
      if ((globalFallbackPhraseSectionTranslation?.displayValue?.plainText ?? "").trim() != "") {
        const richTextWithInterpolations = Object.keys(
          interpolationVariantReplacementMap ?? {}
        ).reduce((s, iv) => {
          return s.replaceAll(
            `{${iv}}`,
            interpolationVariantReplacementMap[iv]?.richText ?? ""
          );
        }, globalFallbackPhraseSectionTranslation?.displayValue?.richTextHtml ?? "");
        const richTextWithLinks = Object.keys(
          linkVariablesDisplayValueReplacementMap ?? {}
        ).reduce((s, l) => {
          return s.replaceAll(
            `{${l}}`,
            `<span style="color: ${ColorPalette.linkBlue};">${
              linkVariablesDisplayValueReplacementMap[l]?.richText ?? ""
            }</span>`
          );
        }, richTextWithInterpolations);

        const richTextWithStyledContents = Object.keys(
          styledContentsDisplayValueReplacementMap ?? {}
        ).reduce((s, l) => {
          return s.replaceAll(
            `{${l}}`,
            `<span style="color: ${ColorPalette.variableRed};">${
              styledContentsDisplayValueReplacementMap[l]?.richText ?? ""
            }</span>`
          );
        }, richTextWithLinks);
        const richTextWithVars = Object.keys(varReplacementMap ?? {}).reduce((s, v) => {
          return s.replaceAll(`{${v}}`, varReplacementMap[v]?.toString() ?? "");
        }, richTextWithStyledContents);
        return Object.keys(contentVarReplacementMap ?? {}).reduce((s, v) => {
          return s.replaceAll(`{${v}}`, contentVarReplacementMap[v]?.toString() ?? "");
        }, richTextWithVars)
      }
      return "";
    }).join("<br/>");
  }, [
    props.phrase?.linkVariables,
    props.phrase?.variables,
    props.phrase?.phraseTranslations,
    props.phrase?.phraseSections,
    linkVariablesDisplayValueReplacementMap,
    interpolationVariantReplacementMap,
    styledContentsDisplayValueReplacementMap,
    varReplacementMap,
    contentVarReplacementMap,
    mockValues,
    selectedLocaleRef,
    fallbackLocaleRef,
    globalFallbackLocaleRef,
    theme.colors
  ])

  const phraseResult = useMemo(() => {
    const phraseTranslation = props.phrase?.phraseTranslations?.find(
      (t) => t.id == selectedLocaleRef
    );
    if ((phraseTranslation?.plainText ?? "").trim() != "") {
      const richTextWithInterpolations = Object.keys(
        interpolationVariantReplacementMap ?? {}
      ).reduce((s, iv) => {
        return s.replaceAll(
          `{${iv}}`,
          interpolationVariantReplacementMap[iv]?.richText ?? ""
        );
      }, phraseTranslation?.richTextHtml ?? "");
      const richTextWithLinks = Object.keys(
        linkVariablesDisplayValueReplacementMap ?? {}
      ).reduce((s, l) => {
        return s.replaceAll(
          `{${l}}`,
          `<span style="color: ${ColorPalette.linkBlue};">${
            linkVariablesDisplayValueReplacementMap[l]?.richText ?? ""
          }</span>`
        );
      }, richTextWithInterpolations);

      const richTextWithStyledContents = Object.keys(
        styledContentsDisplayValueReplacementMap ?? {}
      ).reduce((s, l) => {
        return s.replaceAll(
          `{${l}}`,
          `<span style="color: ${theme.colors.warningTextColor};">${
            styledContentsDisplayValueReplacementMap[l]?.richText ?? ""
          }</span>`
        );
      }, richTextWithLinks);

      const richTextWithVars = Object.keys(varReplacementMap ?? {}).reduce((s, v) => {
        return s.replaceAll(`{${v}}`, varReplacementMap[v]?.toString() ?? "");
      }, richTextWithStyledContents);
      return Object.keys(contentVarReplacementMap ?? {}).reduce((s, v) => {
        return s.replaceAll(`{${v}}`, contentVarReplacementMap[v]?.toString() ?? "");
      }, richTextWithVars)
    }

    const fallbackPhraseTranslation = props.phrase?.phraseTranslations?.find(
      (t) => t.id == fallbackLocaleRef
    );
    if ((fallbackPhraseTranslation?.plainText ?? "").trim() != "") {
      const richTextWithInterpolations = Object.keys(
        interpolationVariantReplacementMap ?? {}
      ).reduce((s, iv) => {
        return s.replaceAll(
          `{${iv}}`,
          interpolationVariantReplacementMap[iv]?.richText ?? ""
        );
      }, fallbackPhraseTranslation?.richTextHtml ?? "");
      const richTextWithLinks = Object.keys(
        linkVariablesDisplayValueReplacementMap ?? {}
      ).reduce((s, l) => {
        return s.replaceAll(
          `{${l}}`,
          `<span style="color: ${ColorPalette.linkBlue};">${
            linkVariablesDisplayValueReplacementMap[l]?.richText ?? ""
          }</span>`
        );
      }, richTextWithInterpolations);

      const richTextWithStyledContents = Object.keys(
        styledContentsDisplayValueReplacementMap ?? {}
      ).reduce((s, l) => {
        return s.replaceAll(
          `{${l}}`,
          `<span style="color: ${ColorPalette.variableRed};">${
            styledContentsDisplayValueReplacementMap[l]?.richText ?? ""
          }</span>`
        );
      }, richTextWithLinks);
      const richTextWithVars = Object.keys(varReplacementMap ?? {}).reduce((s, v) => {
        return s.replaceAll(`{${v}}`, varReplacementMap[v]?.toString() ?? "");
      }, richTextWithStyledContents);
      return Object.keys(contentVarReplacementMap ?? {}).reduce((s, v) => {
        return s.replaceAll(`{${v}}`, contentVarReplacementMap[v]?.toString() ?? "");
      }, richTextWithVars)
    }

    const globalFallbackPhraseTranslation =
      props.phrase?.phraseTranslations?.find((t) => t.id == fallbackLocaleRef);
    if ((globalFallbackPhraseTranslation?.plainText ?? "").trim() != "") {
      const richTextWithInterpolations = Object.keys(
        interpolationVariantReplacementMap ?? {}
      ).reduce((s, iv) => {
        return s.replaceAll(
          `{${iv}}`,
          interpolationVariantReplacementMap[iv]?.richText ?? ""
        );
      }, globalFallbackPhraseTranslation?.richTextHtml ?? "");
      const richTextWithLinks = Object.keys(
        linkVariablesDisplayValueReplacementMap ?? {}
      ).reduce((s, l) => {
        return s.replaceAll(
          `{${l}}`,
          `<span style="color: ${ColorPalette.linkBlue};">${
            linkVariablesDisplayValueReplacementMap[l]?.richText ?? ""
          }</span>`
        );
      }, richTextWithInterpolations);

      const richTextWithStyledContents = Object.keys(
        styledContentsDisplayValueReplacementMap ?? {}
      ).reduce((s, l) => {
        return s.replaceAll(
          `{${l}}`,
          `<span style="color: ${ColorPalette.variableRed};">${
            styledContentsDisplayValueReplacementMap[l]?.richText ?? ""
          }</span>`
        );
      }, richTextWithLinks);
      const richTextWithVars = Object.keys(varReplacementMap ?? {}).reduce((s, v) => {
        return s.replaceAll(`{${v}}`, varReplacementMap[v]?.toString() ?? "");
      }, richTextWithStyledContents);
      return Object.keys(contentVarReplacementMap ?? {}).reduce((s, v) => {
        return s.replaceAll(`{${v}}`, contentVarReplacementMap[v]?.toString() ?? "");
      }, richTextWithVars)
    }

    return "";
  }, [
    props.phrase?.linkVariables,
    props.phrase?.variables,
    props.phrase?.phraseTranslations,
    linkVariablesDisplayValueReplacementMap,
    interpolationVariantReplacementMap,
    styledContentsDisplayValueReplacementMap,
    varReplacementMap,
    contentVarReplacementMap,
    mockValues,
    selectedLocaleRef,
    fallbackLocaleRef,
    globalFallbackLocaleRef,
    theme.colors
  ]);

  const diffColor = useDiffColor(props.localeTestRef);

  return (
    <div style={{ marginBottom: 24 }}>
      <TitleRow>
        <RowTitle
          style={{
            marginTop: 15,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <span
            style={{
              marginLeft: 8,
              color: diffColor,
              fontWeight: 600,
            }}
          >
            {`${props.localeTest.description}:`}
          </span>
        </RowTitle>
        {commandMode == "edit" && (
          <DeleteVarContainer onClick={onRemove}>
            <DeleteVar src={xIcon} />
          </DeleteVarContainer>
        )}
      </TitleRow>
      <SubContainer style={{ borderColor: diffColor }}>
        <Container>
          <TitleRow style={{ marginBottom: 24 }}>
            <RowTitle
              style={{
                fontWeight: 600,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <span style={{ color: theme.colors.contrastText }}>
                {`Mock Inputs`}
              </span>
            </RowTitle>
            <div></div>
          </TitleRow>
          <InputsContainer>
            <Container>
              <>
                {(props.phrase?.variables ?? []).map((variable, index) => {
                  const varRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"] = `${
                    props.phraseRef
                  }.variables.id<${variable.id as string}>`;
                  return (
                    <MockValueRow
                      key={`${props.localeTest}.mockValues.id<${varRef}>`}
                      varRef={varRef}
                      variable={variable}
                      index={index}
                      localeTest={props.localeTest}
                      localeTestRef={props.localeTestRef}
                    />
                  );
                })}
              </>
            </Container>
          </InputsContainer>
        </Container>
        <Container>
          <TitleRow style={{ marginTop: 12, marginBottom: 12, height: 40 }}>
            <RowTitle
              style={{
                fontWeight: 600,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <span style={{ color: theme.colors.contrastText }}>
                {`Phrase Output`}
              </span>
            </RowTitle>
          </TitleRow>
          <InputsContainer>
            <Container>
              <DisplayText
                dangerouslySetInnerHTML={{
                  __html: props.phrase.usePhraseSections
                    ? phraseSectionsResult
                    : phraseResult,
                }}
              />
            </Container>
          </InputsContainer>
        </Container>
        {(linkVariablesHrefs?.length ?? 0) > 0 && (
          <>
            <Container>
              <TitleRow style={{ marginTop: 12, marginBottom: 12, height: 40 }}>
                <RowTitle
                  style={{
                    fontWeight: 600,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: theme.colors.contrastText }}>
                    {`Link HREF Results`}
                  </span>
                </RowTitle>
                <div></div>
              </TitleRow>
            </Container>
            {linkVariablesHrefs?.map((linkVariableOutputTest) => {
              return (
                <Container key={linkVariableOutputTest.linkVariableName}>
                  <TitleRow
                    style={{ marginTop: 12, marginBottom: 12, height: 40 }}
                  >
                    <RowTitle
                      style={{
                        fontWeight: 600,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.4rem",
                          background: ColorPalette.variableBlue,
                          boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableBlueInset}`,
                          borderRadius: 8,
                          padding: 4,
                          fontWeight: 500,
                          color: ColorPalette.white,
                          marginRight: 8,
                        }}
                      >
                        {linkVariableOutputTest.linkVariableName}
                      </span>
                    </RowTitle>
                  </TitleRow>
                  <InputsContainer>
                    <Container>
                      <DisplayText>
                        {linkVariableOutputTest.hrefValue?.length == 0 && (
                          <span
                            style={{ color: theme.colors.warningTextColor }}
                          >
                            {"Not Set"}
                          </span>
                        )}
                        {linkVariableOutputTest.hrefValue?.trim()?.length >
                          0 && <>{linkVariableOutputTest.hrefValue}</>}
                      </DisplayText>
                    </Container>
                  </InputsContainer>
                </Container>
              );
            })}
          </>
        )}
      </SubContainer>
    </div>
  );
};

export default React.memo(TestCase);
