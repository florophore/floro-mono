import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";
import { useFloroContext, useHasIndication, useReferencedObject } from "../floro-schema-api";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import Button from "@floro/storybook/stories/design-system/Button";

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  margin-bottom: 24px;
  max-width: 1020px;
  width: 100%;
`;

const SectionTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.pluginTitle};
  padding: 0;
  margin: 0;
`;

const TitleRow = styled.div`
  height: 72px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const TopRow = styled.div`
  height: 72px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const AddGroupContainer = styled.div`
  margin-top: -12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 620px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const FilterUntranslated = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastTextLight};
  font-weight: 500;
  font-size: 1.4rem;
  padding: 0;
  margin-left: 12px;
`;

const Icon = styled.img`
  width: 24px;
  cursor: pointer;
`;
const ClearIconContainer = styled.div`
  height: 48px;
  width: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SubTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${ColorPalette.linkBlue};
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
`;

interface Props {
  hideTerms: boolean | null;
  onToggleTerms: (hide: boolean) => void;
  hidePhrases: boolean | null;
  onTogglePhrases: (hide: boolean) => void;
  selectedTopLevelLocale: string;
  setSelectedTopLevelLocale: (localeCode: string) => void;
  isEditLocales: boolean;
  onShowEditLocales: () => void;
  onHideEditLocales: () => void;
}

const DisplayHeader = (props: Props) => {
  const theme = useTheme();
  const locales = useReferencedObject("$(text).localeSettings.locales");
  const localesHasIndication = useHasIndication("$(text).localeSettings.locales");

  useEffect(() => {
    if (localesHasIndication) {
      props.onShowEditLocales();
    }

  }, [localesHasIndication, props.onShowEditLocales])
  const localeOptions = useMemo(() => {
    return [
      ...(locales ?? [])?.filter(v => !!v)
        ?.map((locale) => {
          return {
            label: `${locale.localeCode}`,
            value: locale.localeCode.toUpperCase(),
          };
        }) ?? []
    ];
  }, [locales]);

  return (
    <div>
      <Container>
        <TopRow>
          <TitleRow>
            <SectionTitle>{"Display Sections"}</SectionTitle>

            <div style={{ marginLeft: 24, width: 120 }}>
              {!props.isEditLocales && (
                <Button
                  onClick={props.onShowEditLocales}
                  label={"show locales"}
                  bg={"orange"}
                  size={"small"}
                  textSize={"small"}
                />
              )}
              {props.isEditLocales && (
                <Button
                  onClick={props.onHideEditLocales}
                  label={"hide locales"}
                  bg={"orange"}
                  size={"small"}
                  textSize={"small"}
                />
              )}
            </div>
          </TitleRow>

            <div
              style={{
                marginTop: -14,
                marginLeft: 24,
              }}
            >
              <InputSelector
                hideLabel
                options={localeOptions}
                value={props.selectedTopLevelLocale ?? null}
                label={"locale"}
                placeholder={"locale"}
                size="shortest"
                onChange={(option) => {
                  props.setSelectedTopLevelLocale(option?.value as string);
                }}
                maxHeight={800}
              />
            </div>
        </TopRow>
        <Row
          style={{
            marginTop: 24,
            justifyContent: "flex-start",
            alignItems: "center",
            marginLeft: 0,
            marginBottom: 12,
          }}
        >
          <FilterUntranslated
            style={{
              marginLeft: 0,
              width: 200,
              color: !props.hidePhrases
                ? theme.colors.contrastTextLight
                : theme.colors.warningTextColor,
            }}
          >
            {"Show Phrases"}
          </FilterUntranslated>
          <Checkbox
            isChecked={!props.hidePhrases}
            onChange={props.onTogglePhrases}
          />
        </Row>
        <Row
          style={{
            marginTop: 24,
            justifyContent: "flex-start",
            alignItems: "center",
            marginLeft: 0,
            marginBottom: 12,
          }}
        >
          <FilterUntranslated
            style={{
              marginLeft: 0,
              width: 200,
              color: !props.hideTerms
                ? theme.colors.contrastTextLight
                : theme.colors.warningTextColor,
            }}
          >
            {"Show Terms"}
          </FilterUntranslated>
          <Checkbox
            isChecked={!props.hideTerms}
            onChange={props.onToggleTerms}
          />
        </Row>
      </Container>
    </div>
  );
};

export default React.memo(DisplayHeader);
