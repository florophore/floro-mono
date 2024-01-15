import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import {
  SchemaTypes,
  useFloroContext,
} from "../floro-schema-api";
import XCircleLight from '@floro/common-assets/assets/images/icons/x_circle.light.svg';
import XCircleDark from '@floro/common-assets/assets/images/icons/x_circle.dark.svg';
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";

import Checkbox from "@floro/storybook/stories/design-system/Checkbox";


const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;


const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const FilterUntranslated = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastTextLight};
  font-weight: 500;
  font-size: 1.4rem;
  padding: 0;
  margin-left: 12px;
  cursor: pointer;
`;

const Icon = styled.img`
  width: 24px;
  cursor: pointer;
`;
const ClearIconContainer =styled.div`
    height: 48px;
    width: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

interface Props {
  showOnlyPinnedPhrases: boolean;
  selectedTopLevelLocale: string;
  phraseGroups: SchemaTypes['$(text).phraseGroups'];
  filteredPhraseGroups: SchemaTypes['$(text).phraseGroups'];
  filterTag: string|null;
  setFilterTag: (tag: string|null) => void;
  globalFilterUntranslated: boolean;
  globalFilterRequiresUpdate: boolean;
  setGlobalFilterUnstranslated: (filter: boolean) => void;
  setGlobalFilterRequiresUpdate: (filter: boolean) => void;
}

const PhraseFilter = (props: Props) => {
  const theme = useTheme();

  const { commandMode, applicationState, clientStorage } = useFloroContext();

  const onToggleFilterUntranslated = useCallback(() => {
    props.setGlobalFilterUnstranslated(!props.globalFilterUntranslated);
  }, [props.globalFilterUntranslated])

  const onToggleFilterRequiresUpdate = useCallback(() => {
    props.setGlobalFilterRequiresUpdate(!props.globalFilterRequiresUpdate);
  }, [props.globalFilterRequiresUpdate])

  const onClearFilterTag = useCallback(() => {
      props.setFilterTag(null);
  }, [props.setFilterTag])

  const allTags = useMemo(() => {
    const tagSet =  new Set(props.filteredPhraseGroups?.flatMap(phraseGroup => {
      return phraseGroup?.phrases?.flatMap(phrase => {
        return phrase.tags;
      })
    })?.filter(v => !!v));
    const sortedTags = Array.from(tagSet).sort();
    return [
      {
        label: "None",
        value: null,
      },
      ...sortedTags.map((tag) => {
        return {
          label: tag,
          value: tag,
        };
      }),
    ];
  }, [props.filteredPhraseGroups, applicationState]);

  const clearIcon = useMemo(() => {
      if (theme.name == 'light') {
        return XCircleLight;
      }
      return XCircleDark;
  }, [theme.name])

  return (
    <Container>
        <Row
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: 24,
            paddingRight: 48,
            paddingTop: 24,
          }}
        >
          <Row style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <FilterUntranslated style={{ marginTop: -2, marginLeft: 0 }}>
              {"Filter on tag"}
            </FilterUntranslated>
            <div
              style={{
                position: "relative",
                marginTop: -12,
                marginLeft: 12,
                display: "flex",
                flexDirection: "row",
              }}
            >
              <InputSelector
                options={allTags}
                value={props.showOnlyPinnedPhrases ? null : props.filterTag}
                label={"filter on tag"}
                placeholder={"select tag to filter on"}
                onChange={(option) => {
                  props.setFilterTag((option?.value as string) ?? null);
                }}
                size="short"
                zIndex={5}
              />
            </div>
            {props.filterTag && (
              <ClearIconContainer>
                <Icon src={clearIcon} onClick={onClearFilterTag} />
              </ClearIconContainer>
            )}
          </Row>
          <Row style={{marginTop: -12}}>
            <FilterUntranslated
              style={{
                marginLeft: 0,
                marginRight: 12,
                color: props.globalFilterUntranslated
                  ? theme.colors.warningTextColor
                  : theme.colors.contrastTextLight,
              }}
            >
              {`Filter un-translated (${props.selectedTopLevelLocale}) phrases for all groups`}
            </FilterUntranslated>
            <Checkbox
              isChecked={props.globalFilterUntranslated}
              onChange={onToggleFilterUntranslated}
            />
          </Row>
        </Row>
        <Row
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingRight: 48,
            marginTop: -8
          }}
        >
          <Row>
            <FilterUntranslated
              style={{
                marginLeft: 0,
                marginRight: 12,
                color: props.globalFilterRequiresUpdate
                  ? theme.colors.warningTextColor
                  : theme.colors.contrastTextLight,
              }}
            >
              {`Filter (${props.selectedTopLevelLocale}) phrases to update for all groups`}
            </FilterUntranslated>
            <Checkbox
              isChecked={props.globalFilterRequiresUpdate}
              onChange={onToggleFilterRequiresUpdate}
            />
          </Row>
        </Row>
    </Container>
  )
};

export default React.memo(PhraseFilter);
