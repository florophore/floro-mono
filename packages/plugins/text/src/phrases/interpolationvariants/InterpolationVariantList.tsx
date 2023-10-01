import React, { useMemo, useCallback, useState } from "react";
import { useTheme } from "@emotion/react";
import { PointerTypes, SchemaTypes, makeQueryRef, useFloroContext, useFloroState, useReferencedObject } from "../../floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";

import InputSelector, { Option } from "@floro/storybook/stories/design-system/InputSelector";
import InterpolationVariantReOrderRow from "./InterpolationVariantReOrderRow";
import InterpolationVariant from "./InterpolationVariant";
import ColorPalette from "@floro/styles/ColorPalette";


const Container = styled.div`
    margin-top: 24px;
`;

const AddVariableContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
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

const ToggleEditTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${ColorPalette.linkBlue};
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
`;

const MissingTranslationsPill = styled.div`
  height: 24px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${props => props.theme.colors.warningTextColor};
  padding-left: 12px;
  padding-right: 12px;
  margin-left: 12px;
`;

const MissingTranslationsTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1rem;
  color: ${ColorPalette.white};
`;

const BusinessLogicDisclaimer = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${props => props.theme.colors.contrastText};
`;

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]|null;
  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
}

const InterpolationVariantsList = (props: Props) => {
  const theme = useTheme();

  const [name, setName] = useState<string>("");
  const [variableRef, setVariableRef] = useState<PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']|null>(null);
  const { commandMode, applicationState} = useFloroContext();

  const [isDragging, setIsDragging] = useState(false);

  const [interpolationVariants, setInterpolationVariants] = useFloroState(`${props.phraseRef}.interpolationVariants`);
  const variables = useReferencedObject(`${props.phraseRef}.variables`)
  const linkVariables = useReferencedObject(`${props.phraseRef}.linkVariables`)

  const varSet = useMemo(() => {
    return new Set([
      ...variables?.map?.((v) => v.name?.toLowerCase?.() as string) ?? [],
      ...interpolationVariants?.map?.((iv) => iv.name?.toLowerCase() as string) ?? [],
      ...linkVariables?.map?.((l) => l.linkName?.toLowerCase() as string) ?? [],
    ]);
  }, [variables, linkVariables, interpolationVariants]);


  const options = useMemo(() => {
    return variables?.map(iv => {
        const ref = `${props.phraseRef}.variables.id<${iv.id}>`;
        return {
            label: iv.name,
            value: ref,
        }
    }) ?? [];
  }, [variables, props.phraseRef]);

  const isNameTaken = useMemo(() => {
    return varSet.has(name?.toLowerCase());
  }, [name, varSet])

  const showNameInputInvalid = useMemo(() => {
    if (name == "") {
        return true;
    }
    if (isNameTaken) {
        return false;
    }
    return name.trim() != "";
  }, [name, isNameTaken]);

  const onChangeName = useCallback((name) => {
    setName(name);
  },[]);

  const isEnabled = useMemo(() => {
    if (isNameTaken) {
        return false;
    }
    if (!variableRef) {
        return false;
    }
    return name.trim() != "";
  }, [name, isNameTaken, variableRef]);

  const onAppendInterpolationVariant = useCallback(() => {
    if (!isEnabled || !variableRef) {
        return;
    }
    setInterpolationVariants([...(props.phrase.interpolationVariants ? props.phrase.interpolationVariants : []), {
        name: name.trim(),
        variableRef,
        localeRules: []
      }]
    );
    setName("");
    setVariableRef(null);
  }, [props.phrase.interpolationVariants, setInterpolationVariants, name, variableRef, isEnabled]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    //save();
  }, []);


  const onReOrderVariables = useCallback(
    (values: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants']) => {
        if (values) {
            setInterpolationVariants(values);
        }
    },
    [setInterpolationVariants, variables]
  );

  const onRemoveInterpolationVariant = useCallback(
    (interpolationVariant: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>']) => {
        setInterpolationVariants(interpolationVariants?.filter(v => v?.name != interpolationVariant?.name) ?? []);
    },
    [setInterpolationVariants, linkVariables]
  )

  const [isReOrderMode, setIsReOrderMode] = useState(false);

  const onToggleReOrder = useCallback(() => {
    setIsReOrderMode(!isReOrderMode);
  }, [isReOrderMode]);

  const isMissingValues = useMemo(() => {
    const localeRef = `$(text).localeSettings.locales.localeCode<${props.selectedLocale.localeCode}>`;
    for (const iv of interpolationVariants ?? []) {
      for (const localeRule of iv?.localeRules ?? []) {
        if (localeRule.id != localeRef) {
          continue;
        }
        if ((localeRule.defaultValue?.plainText ?? "") == "") {
          return true;
        }
        for (const condition of localeRule.conditionals) {
            if ((condition?.resultant?.plainText ?? "") == "") {
                return true;
            }
        }
      }
    }
    return false;
  }, [interpolationVariants, applicationState, props.selectedLocale.localeCode])

  if (commandMode != "edit" && (interpolationVariants?.length ?? 0) == 0) {
    return null;
  }

  return (
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
            {`Conditional Variants`}
          </span>
          <span>
            {isMissingValues && (
                <MissingTranslationsPill>
                    <MissingTranslationsTitle>{`missing ${props.selectedLocale.localeCode} vairants`}</MissingTranslationsTitle>
                </MissingTranslationsPill>
            )}
          </span>
        </RowTitle>
        {(interpolationVariants?.length ?? 0) > 0 && commandMode == "edit" && (
          <ToggleEditTitle onClick={onToggleReOrder}>{isReOrderMode ? 'done organizing' : 'organize conditional variants'}</ToggleEditTitle>
        )}
      </TitleRow>
      {isReOrderMode && commandMode == "edit" && (
        <Reorder.Group
          axis="y"
          values={variables ?? []}
          onReorder={onReOrderVariables}
          className={css(`
            padding: 0px 0px 0px 0px;
        `)}
        >
          <AnimatePresence>
            {interpolationVariants?.map((interpolationVariant, index) => {
              return (
                <InterpolationVariantReOrderRow
                  key={interpolationVariant.name}
                  interpolationVariant={interpolationVariant}
                  index={index}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      )}
      {(!isReOrderMode || commandMode != "edit") && (
        <div>
          {commandMode == "edit" && (
            <div>
              <BusinessLogicDisclaimer>
                <b>{'Disclaimer:'}</b>
                <span>{'We strongly discourage putting business logic in conditional variants. Conditional variants should be used for addressing grammatical rules (e.g. pluralization/genderization), not application logic.'}</span>
              </BusinessLogicDisclaimer>
            </div>
          )}
          {interpolationVariants?.map((interpolationVariable) => {
            return (
              <InterpolationVariant
                key={`${props.phraseRef}.interpolationVariants.name<${interpolationVariable.name}>`}
                interpolationVariant={interpolationVariable}
                phrase={props.phrase}
                interpolationVariantRef={`${props.phraseRef}.interpolationVariants.name<${interpolationVariable.name}>`}
                selectedLocale={props.selectedLocale}
                systemSourceLocale={props.systemSourceLocale}
                globalFilterUntranslated={props.globalFilterUntranslated}
                pinnedPhrases={props.pinnedPhrases}
                setPinnedPhrases={props.setPinnedPhrases}
                isPinned={props.isPinned}
                phraseRef={props.phraseRef}
                onRemove={onRemoveInterpolationVariant}
              />
            );
          })}
        </div>
        )}
      {commandMode == "edit" && (
        <AddVariableContainer
          style={{ justifyContent: "space-between", alignItems: "center", marginTop: 12 }}
        >
            <AddVariableContainer
            style={{ justifyContent: "space-between", alignItems: "center", marginTop: 12 }}
            >
            <div>
              <Input
                value={name}
                label={
                  showNameInputInvalid
                    ? "variant name"
                    : isNameTaken
                    ? `variant name (name taken)`
                    : `variant name (invalid name)`
                }
                placeholder={"variant name"}
                onTextChanged={onChangeName}
                widthSize="shorter"
                isValid={showNameInputInvalid}
              />
            </div>
            <div style={{ marginLeft: 24}}>
              <InputSelector
                options={options}
                label={"variable"}
                placeholder={"select a variable"}
                size="short"
                value={variableRef}
                onChange={(option) => {
                  if (option?.value) {
                    setVariableRef(option?.value as PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']);
                  }
                }}
              />
            </div>
          </AddVariableContainer>
          <div style={{ marginTop: 24 }}>
            <Button
              size="medium"
              label={"add variant"}
              bg={"orange"}
              isDisabled={!isEnabled}
              onClick={onAppendInterpolationVariant}
              style={{
                width: 200
              }}
            />
          </div>
        </AddVariableContainer>

      )}
    </Container>
  );
};

export default React.memo(InterpolationVariantsList);