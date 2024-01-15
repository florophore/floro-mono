import React, { useMemo, useCallback, useState } from "react";
import { useTheme } from "@emotion/react";
import { PointerTypes, SchemaTypes, useFloroContext, useFloroState, useReferencedObject } from "../../floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import styled from "@emotion/styled";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";
import ColorPalette from "@floro/styles/ColorPalette";
import { useDiffColor } from "../../diff";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import CreateInitialPhraseSectionModal from "../createinitialphrasesection/CreateInitialPhraseSectionModal";

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
  cursor: pointer;
  padding: 0;
`;
const FeatureName = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;



function isVarName(str) {
  if (typeof str !== "string") {
    return false;
  }

  if (str.trim() !== str) {
    return false;
  }

  try {
    new Function(str, "var " + str);
  } catch (_) {
    return false;
  }

  return true;
}

interface Props {
  onHide: () => void;
  mockRichText: string;
  isEmpty: boolean;
  phraseRef: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>'];
  phrase: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>'];
  setPhrase: (phrase: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>']) => void;
}

const FeatureEnabler = (props: Props) => {
  const theme = useTheme();
  const { commandMode} = useFloroContext();
  const [showCreateSection, setShowCreateSection] = useState(false);
  const phrase = props.phrase;
  const setPhrase = props.setPhrase;

  const onHideCreateSection = useCallback(() => {
    setShowCreateSection(false);
  }, []);

  const onToggleUseSections = useCallback(() => {
    if (!props.phrase) {
      return;
    }
    if (!props?.phrase?.usePhraseSections) {
      setPhrase({
        ...phrase,
        usePhraseSections: true,
      });
      if ((phrase?.phraseSections?.length ?? 0) == 0 && !props.isEmpty) {
        setShowCreateSection(true);
      }
      return;
    }
    setPhrase({
      ...phrase,
      usePhraseSections: false,
    });
  }, [phrase, phrase?.usePhraseSections, phrase?.phraseSections, setPhrase, props.isEmpty]);

  const onToggleTagsEnabled = useCallback(() => {
    if (!phrase) {
        return;
    }
    if (!phrase?.tagsEnabled) {
        setPhrase({
            ...phrase,
            tagsEnabled: true
        })
        return;
    }
    if (phrase?.tags?.length == 0) {
        setPhrase({
            ...phrase,
            tagsEnabled: false
        })
    }
  }, [phrase, phrase?.tagsEnabled, phrase?.tags, setPhrase])

  const onTogglePhraseVariablesEnabled = useCallback(() => {
    if (!phrase) {
        return;
    }
    if (!phrase?.phraseVariablesEnabled) {
        setPhrase({
            ...phrase,
            phraseVariablesEnabled: true
        })
        return;
    }
    if (phrase?.variables?.length == 0) {
        setPhrase({
            ...phrase,
            phraseVariablesEnabled: false
        })
    }
  }, [phrase, phrase?.phraseVariablesEnabled, phrase?.variables, setPhrase])

  const onToggleContentVariablesEnabled = useCallback(() => {
    if (!phrase) {
        return;
    }
    if (!phrase?.contentVariablesEnabled) {
        setPhrase({
            ...phrase,
            contentVariablesEnabled: true
        })
        return;
    }
    if (phrase?.contentVariables?.length == 0) {
        setPhrase({
            ...phrase,
            contentVariablesEnabled: false
        })
    }
  }, [phrase, phrase?.contentVariablesEnabled, phrase?.contentVariables, setPhrase])

  const onToggleStyledContentEnabled = useCallback(() => {
    if (!phrase) {
      return;
    }
    if (!phrase?.styledContentEnabled) {
      setPhrase({
        ...phrase,
        styledContentEnabled: true,
      });
      return;
    }
    if (
      phrase?.styleClasses?.length == 0 &&
      phrase?.styledContents?.length == 0
    ) {
      setPhrase({
        ...phrase,
        styledContentEnabled: false,
      });
    }
  }, [
    phrase,
    phrase?.styledContentEnabled,
    phrase?.styledContents,
    phrase?.styleClasses,
    setPhrase,
  ]);

  const onToggleLinksEnabled = useCallback(() => {
    if (!phrase) {
        return;
    }
    if (!phrase?.linkVariablesEnabled) {
        setPhrase({
            ...phrase,
            linkVariablesEnabled: true
        })
        return;
    }
    if (phrase?.linkVariables?.length == 0) {
        setPhrase({
            ...phrase,
            linkVariablesEnabled: false
        })
    }
  }, [phrase, phrase?.linkVariablesEnabled, phrase?.linkVariables, setPhrase])

  const onToggleConditionalVariantsEnabled = useCallback(() => {
    if (!phrase) {
        return;
    }
    if (!phrase?.interpolationsEnabled) {
        setPhrase({
            ...phrase,
            interpolationsEnabled: true
        })
        return;
    }
    if (phrase?.interpolationVariants?.length == 0) {
        setPhrase({
            ...phrase,
            interpolationsEnabled: false
        })
    }
  }, [phrase, phrase?.interpolationsEnabled, phrase?.interpolationVariants, setPhrase])

  return (
    <Container>
      {phrase && (
        <CreateInitialPhraseSectionModal
          show={showCreateSection}
          onDismiss={onHideCreateSection}
          richText={props.mockRichText}
          phrase={phrase}
          phraseRef={props.phraseRef}
        />
      )}
      <TitleRow style={{ marginTop: 12, marginBottom: 12, height: 40 }}>
        <RowTitle
          style={{
            fontWeight: 600,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <span>{`Phrase Features`}</span>
        </RowTitle>
        <ToggleEditTitle onClick={props.onHide}>
          {"- hide features"}
        </ToggleEditTitle>
      </TitleRow>
      <div>
        <div
          style={{
            height: 56,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Checkbox
            isChecked={!!phrase?.usePhraseSections}
            onChange={onToggleUseSections}
          />
          <span style={{ marginLeft: 12 }}>
            <FeatureName>{"Use Phrase Sections"}</FeatureName>
          </span>
        </div>
        <div
          style={{
            height: 56,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Checkbox
            disabled={(phrase?.tags?.length ?? 0) > 0}
            isChecked={!!phrase?.tagsEnabled}
            onChange={onToggleTagsEnabled}
          />
          <span style={{ marginLeft: 12 }}>
            <FeatureName>{"Phrase Tags"}</FeatureName>
          </span>
        </div>
        <div
          style={{
            height: 56,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Checkbox
            disabled={
              (phrase?.variables?.length ?? 0) > 0 &&
              phrase?.phraseVariablesEnabled
            }
            isChecked={!!phrase?.phraseVariablesEnabled}
            onChange={onTogglePhraseVariablesEnabled}
          />
          <span style={{ marginLeft: 12 }}>
            <FeatureName>{"Phrase Variables"}</FeatureName>
          </span>
        </div>
        {(phrase?.phraseVariablesEnabled ||
          (phrase?.variables?.length ?? 0) > 0) && (
          <div
            style={{
              height: 56,
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: 40,
            }}
          >
            <Checkbox
              disabled={
                (phrase?.interpolationVariants?.length ?? 0) > 0 &&
                phrase?.interpolationsEnabled
              }
              isChecked={!!phrase?.interpolationsEnabled}
              onChange={onToggleConditionalVariantsEnabled}
            />
            <span style={{ marginLeft: 12 }}>
              <FeatureName>
                {
                  "Conditional Interpolations (e.g. Pluralization/Genderization)"
                }
              </FeatureName>
            </span>
          </div>
        )}
        <div
          style={{
            height: 56,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Checkbox
            disabled={
              (phrase?.contentVariables?.length ?? 0) > 0 &&
              phrase?.contentVariablesEnabled
            }
            isChecked={!!phrase?.contentVariablesEnabled}
            onChange={onToggleContentVariablesEnabled}
          />
          <span style={{ marginLeft: 12 }}>
            <FeatureName>{"Content Variables"}</FeatureName>
          </span>
        </div>

        <div
          style={{
            height: 56,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Checkbox
            disabled={
              (phrase?.styledContents?.length ?? 0) > 0 &&
              (phrase?.styleClasses?.length ?? 0) > 0 &&
              phrase?.styledContentEnabled
            }
            isChecked={!!phrase?.styledContentEnabled}
            onChange={onToggleStyledContentEnabled}
          />
          <span style={{ marginLeft: 12 }}>
            <FeatureName>{"Style Classes/Styled Content"}</FeatureName>
          </span>
        </div>
        <div
          style={{
            height: 56,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Checkbox
            disabled={
              (phrase?.linkVariables?.length ?? 0) > 0 &&
              phrase?.linkVariablesEnabled
            }
            isChecked={phrase?.linkVariablesEnabled ?? false}
            onChange={onToggleLinksEnabled}
          />
          <span style={{ marginLeft: 12 }}>
            <FeatureName>{"Link Variables"}</FeatureName>
          </span>
        </div>
      </div>
    </Container>
  );
};

export default React.memo(FeatureEnabler);
