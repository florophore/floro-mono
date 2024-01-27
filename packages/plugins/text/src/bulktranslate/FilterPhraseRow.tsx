import React, {
  useMemo,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { PointerTypes, SchemaTypes } from "../floro-schema-api";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

const PhraseTitle = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastText};
  font-weight: 500;
  font-size: 1.44rem;
  padding: 0;
  text-align: center;
  word-break: break-word;
`;

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  selectedPhraseRefs: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"][];
  onUpdateSelectedPhraseRefs: (
    selectedPhraseRefs: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"][]
  ) => void;
}

const FilterPhraseRow = (props: Props) => {
  const theme = useTheme();
  const isSelected = useMemo(() => {
    return props.selectedPhraseRefs.includes(props.phraseRef);
  }, [props.selectedPhraseRefs, props.phraseRef]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        marginTop: 8,
        marginBottom: 8,
      }}
    >
        <div style={{
            width: 40
        }}>
        <Checkbox
            isChecked={isSelected}
            onChange={function (): void {
              if (isSelected) {
                props.onUpdateSelectedPhraseRefs(
                  props.selectedPhraseRefs.filter(v => v != props.phraseRef)
                )
              } else {
                props.onUpdateSelectedPhraseRefs(
                  [...props.selectedPhraseRefs, props.phraseRef]
                )
              }
            }}
        />

        </div>
      <PhraseTitle>{props.phrase.phraseKey}</PhraseTitle>
    </div>
  );
};

export default React.memo(FilterPhraseRow);
