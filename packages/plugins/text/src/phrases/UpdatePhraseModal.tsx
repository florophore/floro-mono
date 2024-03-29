import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import styled from "@emotion/styled";
import RootModal from "@floro/common-react/src/components/RootModal";
import {
  SchemaTypes,
  makeQueryRef,
  useFloroContext,
  useFloroState,
  useReferencedObject,
  extractQueryArgs
} from "../floro-schema-api";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";

import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";

const OuterContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const HeaderWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h1`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.modalHeaderTitleColor};
  font-weight: 700;
  font-size: 2rem;
`;

const createPhraseCopyWithUpdatedVariableRefs = (
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"],
  newGroupId: string,
  newId: string,
  ): SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"] => {
  const interpolationVariants = phrase.interpolationVariants.map(interpolationVariant => {
    const oldVariableRef = interpolationVariant.variableRef;
    const [, , variableId] = extractQueryArgs(oldVariableRef)
    const variableRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>",
      newGroupId,
      newId,
      variableId
    );
    const localeRules = interpolationVariant.localeRules.map(localeRule => {
      const conditionals = localeRule.conditionals.map(conditional => {
        const subconditions = conditional.subconditions.map(subcondition => {
          const oldVariableRef = subcondition.variableRef;
          const [, , variableId] = extractQueryArgs(oldVariableRef)
          const variableRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>",
            newGroupId,
            newId,
            variableId
          );
          return {
            ...subcondition,
            variableRef
          }
        });
        return {
          ...conditional,
          subconditions
        }
      });
      return {
        ...localeRule,
        conditionals
      }

    })
    return {
      ...interpolationVariant,
      localeRules,
      variableRef
    }
  });

  const styledContents = phrase.styledContents.map(
    (styledContent) => {
      const oldStyleClassRef = styledContent.styleClassRef;
      const [, , variableId] = extractQueryArgs(oldStyleClassRef);
      const styleClassRef = makeQueryRef(
        "$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>",
        newGroupId,
        newId,
        variableId
      );
      const localeRules = styledContent.localeRules.map((localeRule) => {
        return {
          ...localeRule,
        };
      });
      return {
        ...styledContent,
        localeRules,
        styleClassRef,
      };
    }
  );

  const testCases = phrase.testCases.map(testCase => {
    const localeTests = testCase.localeTests.map(localeTest => {
      const mockValues = localeTest.mockValues.map(mockValue => {
        const [, , variableId] = extractQueryArgs(mockValue.variableRef);
        const variableRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>",
          newGroupId,
          newId,
          variableId
        );
        return {
          ...mockValue,
          variableRef
        }
      });
      return {
        ...localeTest,
        mockValues
      }
    });
    return {
      ...testCase,
      localeTests
    }
  });

  return  {
    ...phrase,
    interpolationVariants,
    styledContents,
    testCases
  }
}

interface Props {
  show: boolean;
  onDismiss: () => void;
  phraseGroup: SchemaTypes["$(text).phraseGroups.id<?>"];
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
}

const UpdatePhraseModal = (props: Props) => {
  const { applicationState } = useFloroContext();

  const phraseGroups = useReferencedObject(`$(text).phraseGroups`);

  const phraseGroupOptions = useMemo(() => {
    return phraseGroups?.map(phraseGroup => {
      return {
        label: phraseGroup.name,
        value: phraseGroup.id,
      }
    }) ?? [];
  }, [phraseGroups, props.show])

  const [phraseGroupId, setPhraseGroupId] = useState(props.phraseGroup.id as string);
  const [phraseKey, setPhraseKey] = useState(props.phrase.phraseKey);

  useEffect(() => {
    if (props.show) {
      setPhraseGroupId(props.phraseGroup.id);
      setPhraseKey(props.phrase.phraseKey);
    }
  }, [props.show])

  const currentPhraseGroupRef = makeQueryRef(
    "$(text).phraseGroups.id<?>",
    props.phraseGroup.id
  );

  const selectedPhraseGroupRef = makeQueryRef(
    "$(text).phraseGroups.id<?>",
    phraseGroupId
  );

  const onUpdateSelectedPhraseGroup = useCallback((option) => {
    if (option?.value == null) {
      return null;
    }
    setPhraseGroupId(option?.value);
  }, [props.phrase])

  const [selectedPhraseGroup, setSelectedPhraseGroup] = useFloroState(selectedPhraseGroupRef);
  const [currentPhraseGroup, setCurrentPhraseGroup] = useFloroState(currentPhraseGroupRef);

  const onChangePhraseKey = useCallback((phraseKey: string) => {
    setPhraseKey(phraseKey.toLowerCase())
  }, []);

  const existingIds = useMemo(() => {
    if (props.phraseGroup.id == selectedPhraseGroup?.id) {
      return new Set(selectedPhraseGroup?.phrases?.filter(v => {
        return v.id != props.phrase.id
      }).map((p) => p.id));
    }
    return new Set(selectedPhraseGroup?.phrases?.map((p) => p.id));
  }, [selectedPhraseGroup?.phrases, props.phraseGroup?.id, props.phrase?.id]);

  const newId = useMemo((): string | null => {
    if (!phraseKey || (phraseKey?.trim?.() ?? "") == "") {
      return null;
    }
    return (
      phraseKey?.trim?.()?.replaceAll?.(/ +/g, "_")?.toLowerCase?.() ?? null
    );
  }, [phraseKey]);

  const canAddKey = useMemo(() => {
    if (!newId) {
      return false;
    }
    if (existingIds.has(newId)) {
      return false;
    }
    return true;
  }, [newId, existingIds]);

  const onUpdate = useCallback(() => {
    if (!newId || !phraseKey) {
      return;
    }
    if (selectedPhraseGroup?.id == currentPhraseGroup?.id && currentPhraseGroup?.phrases) {
      const nextPhrases =  currentPhraseGroup?.phrases?.map((p): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>'] => {
        if (p.id != props.phrase.id) {
          return p;
        }
        const copy = createPhraseCopyWithUpdatedVariableRefs(
          p,
          currentPhraseGroup?.id,
          newId
        );
        return {
          ...copy,
          phraseKey,
          id: newId,
        }
      });
      if (nextPhrases) {
        setCurrentPhraseGroup({
          ...currentPhraseGroup,
          phrases: nextPhrases
        });
      }
      props.onDismiss();
      return;
    }
    if (!selectedPhraseGroup) {
      return;
    }

    const copy = createPhraseCopyWithUpdatedVariableRefs(
      props.phrase,
      selectedPhraseGroup.id,
      newId
    );
    const nextPhrases = [
      {
        ...copy,
        phraseKey,
        id: newId,
      },
      ...(selectedPhraseGroup?.phrases ?? []),
    ];
    if (nextPhrases && selectedPhraseGroup) {
      setSelectedPhraseGroup({
        ...selectedPhraseGroup,
        phrases: nextPhrases
      });
    }
    const nextCurrentPhrases = currentPhraseGroup?.phrases?.filter(p => {
      return p.id != props.phrase.id
    });
    if (nextCurrentPhrases && currentPhraseGroup) {
      setCurrentPhraseGroup({
        ...currentPhraseGroup,
        phrases: nextCurrentPhrases
      })
    }
    props.onDismiss();
  }, [
    newId,
    phraseKey,
    props.phrase,
    props.phrase?.id,
    selectedPhraseGroup,
    selectedPhraseGroup?.id,
    selectedPhraseGroup?.phrases,
    setSelectedPhraseGroup,
    currentPhraseGroup,
    currentPhraseGroup?.id,
    currentPhraseGroup?.phrases,
    setCurrentPhraseGroup,
    props.onDismiss,
    applicationState
  ]);

  return (
    <RootModal
      show={props.show}
      onDismiss={props.onDismiss}
      disableBackgroundDismiss
      headerSize={"small"}
      topOffset={80}
      zIndex={5}
      headerChildren={
        <HeaderWrapper>
          <HeaderTitle>{"update phrase key"}</HeaderTitle>
        </HeaderWrapper>
      }
    >
      <OuterContainer>
        <div>
          <Row
            style={{
              justifyContent: "center",
            }}
          >
            <InputSelector
              options={phraseGroupOptions}
              value={selectedPhraseGroup?.id}
              label={'phrase group'}
              placeholder={'selected phrase group'}
              onChange={onUpdateSelectedPhraseGroup}
              size="wide"
            />
          </Row>
          <Row
            style={{
              marginTop: 32,
              justifyContent: "center",
            }}
          >
            <Input
              value={phraseKey}
              onTextChanged={onChangePhraseKey}
              widthSize={"wide"}
              label={(!newId || !existingIds.has(newId)) ? "phrase key" : "phrase key (taken)"}
              placeholder={'Phrase Key (e.g. "home page greeting")'}
              isValid={!newId || !existingIds.has(newId)}
            />
          </Row>
          <Row
            style={{
              marginTop: 32,
              justifyContent: "center",
            }}
          >
            <WarningLabel label="Altering the phrase key and/or group is a risky operation that will affect code that depends upon this phrase." size={"small"}/>
          </Row>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Button
            label={"update phrase key"}
            bg={"orange"}
            size={"extra-big"}
            isDisabled={!canAddKey}
            onClick={onUpdate}
          />
        </div>
      </OuterContainer>
    </RootModal>
  );
};

export default React.memo(UpdatePhraseModal);
