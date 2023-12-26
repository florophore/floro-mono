import React, { useEffect, useMemo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useFloroContext,
  useFloroState,
  useReferencedObject,
} from "../../floro-schema-api";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";

import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { useDeepLContext } from "../../deepl/DeepLContext";
import SourceDisplay from "./SourceDisplay";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import { useDeepLFetch } from "../../deepl/deepLHelpers";

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

const planOptions = [
  {
    label: "Free Plan",
    value: "free",
  },
  {
    label: "Pro Plan",
    value: "pro",
  },
];

interface Props {
  show: boolean;
  onDismiss: () => void;
  richText: string;
  phrase: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>'];
  phraseRef: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>'];
}

const CreateInitialPhraseSectionModal = (props: Props) => {
  const { applicationState } = useFloroContext();
  const [name, setName] = useState("");
  const [phraseSections, setPhraseSections] = useFloroState(`${props.phraseRef}.phraseSections`);

  useEffect(() => {
    if (props.show) {
      setName("");
    }

  }, [props.show])


  const onAddSection = useCallback(() => {
    const localeRules: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules"] =
      [];
    for (const phraseTranslation of props.phrase.phraseTranslations) {
      const copyTranslation: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>"] =
        JSON.parse(JSON.stringify(phraseTranslation));
      const localeRule: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>"] =
        {
          id: copyTranslation.id,
          displayValue: {
            enabledTerms: copyTranslation.enabledTerms,
            json: copyTranslation.json,
            plainText: copyTranslation.plainText,
            richTextHtml: copyTranslation.richTextHtml,
            sourceAtRevision: copyTranslation.sourceAtRevision,
          },
        };
      localeRules.push(localeRule);
    }
    const section: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>"] =
      {
        name,
        localeRules,
      };
    setPhraseSections([section]);
    props.onDismiss();
  }, [props.phrase, phraseSections, setPhraseSections, name, props.onDismiss]);

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismiss}
      disableBackgroundDismiss
      headerSize={"small"}
      topOffset={80}
      headerChildren={
        <HeaderWrapper>
          <HeaderTitle>{"Create Phrase Section"}</HeaderTitle>
        </HeaderWrapper>
      }
    >
      <OuterContainer>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <div>
            <Row
              style={{
                justifyContent: "center",
              }}
            >
              <Input
                value={name ?? ""}
                onTextChanged={setName}
                widthSize={"wide"}
                label={"initial section name"}
                placeholder={"initial section name"}
              />
            </Row>
            <Row
              style={{
                marginTop: 24,
                flexDirection: "row",
                justifyContent: "center",
                width: "100%",
                alignSelf: "center",
              }}
            >
              <div style={{ width: 470 }}>
                <SourceDisplay
                  value={props.richText}
                  label={"phrase translation"}
                  maxHeight={400}
                />
              </div>
            </Row>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div style={{ width: 470 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Button
                  label={"cancel"}
                  bg={"gray"}
                  size={"medium"}
                  onClick={props.onDismiss}
                />
                <Button
                  isDisabled={name.trim() == ""}
                  label={"create section"}
                  bg={"purple"}
                  size={"medium"}
                  onClick={onAddSection}
                />
              </div>
            </div>
          </div>
        </div>
      </OuterContainer>
    </RootLongModal>
  );
};

export default React.memo(CreateInitialPhraseSectionModal);