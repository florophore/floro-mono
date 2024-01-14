import React, { useEffect, useState, useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import {
  SchemaTypes,
  makeQueryRef,
  useExtractQueryArgs,
  useFloroState,
  useReferencedObject,
} from "../floro-schema-api";
import InputSelector, {
  Option,
} from "@floro/storybook/stories/design-system/InputSelector";

import Button from "@floro/storybook/stories/design-system/Button";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

const LocaleTitle = styled.h4`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  text-align: center;
  padding: 0;
  margin: 0;
`;

const DefaultTitle = styled.p`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 1rem;
  font-style: italic;
  color: ${(props) => props.theme.colors.pluginTitle};
  text-align: center;
  padding: 0;
  margin: 0 16px 0 16px;
`;

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

const RightInfo = styled.div`
  display: flex;
  flex-direction: row;
`;

const HeaderTitle = styled.h1`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.modalHeaderTitleColor};
  font-weight: 700;
  font-size: 2rem;
`;

const ManualDefinedInstruction = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastTextLight};
  font-weight: 500;
  font-size: 1.4rem;
  padding: 0;
  margin-right: 12px;
`;

const SubPropTitle = styled.h4`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
  text-align: center;
  padding: 0;
  margin: 0;
`;

interface Props {
  show: boolean;
  onDismiss: () => void;
  locale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
}

const UpdateLocaleModal = (props: Props) => {
  const locales = useReferencedObject("$(text).localeSettings.locales");
  const [localeSettings, setLocaleSettings] = useFloroState(
    "$(text).localeSettings"
  );
  const localeRef = makeQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props.locale.localeCode
  );

  const [fallbackCode] = useExtractQueryArgs(
    props?.locale?.defaultFallbackLocaleRef
  );
  const [translateFromCode] = useExtractQueryArgs(
    props?.locale?.defaultTranslateFromLocaleRef
  );

  const [makeGlobalDefault, setMakeGlobalDefault] = useState(
    localeSettings?.defaultLocaleRef == localeRef
  );
  const [selectedFallback, setSelectedFallback] = useState<string | null>(null);
  const [selectedTranslateFrom, setSelectedTranslateFrom] =
    useState<string | null>(null);

  useEffect(() => {
    if (props.show) {
      setMakeGlobalDefault(localeSettings?.defaultLocaleRef == localeRef);
      setSelectedFallback(fallbackCode ?? null);
      setSelectedTranslateFrom(translateFromCode ?? null);
    }
  }, [
    props.show,
    props.locale,
    props.locale?.defaultFallbackLocaleRef,
    props.locale?.defaultTranslateFromLocaleRef,
    localeSettings?.defaultLocaleRef,
    localeRef,
    fallbackCode,
    translateFromCode,
  ]);

  const existingLocaleOptions = useMemo(() => {
    return [
      ...locales
        ?.map((locale) => {
          return {
            label: `${locale.localeCode} (${locale.name})`,
            value: locale.localeCode.toUpperCase(),
          };
        })
        ?.filter((option) => option.value != props.locale.localeCode),
      { label: "None/(Global Default Locale)", value: null },
    ];
  }, [locales, props?.locale?.localeCode]);

  const onToggleMakeDefault = useCallback(() => {
    setMakeGlobalDefault(!makeGlobalDefault);
  }, [makeGlobalDefault]);

  const onUpdate = useCallback(() => {
    const defaultTranslateFromLocaleRef = !selectedTranslateFrom
      ? undefined
      : makeQueryRef(
          "$(text).localeSettings.locales.localeCode<?>",
          selectedTranslateFrom
        );
    const defaultFallbackLocaleRef = !selectedFallback
      ? undefined
      : makeQueryRef(
          "$(text).localeSettings.locales.localeCode<?>",
          selectedFallback
        );
    if (!props.locale?.name || !props.locale?.localeCode) {
      return;
    }
    if (makeGlobalDefault) {
      setLocaleSettings({
        defaultLocaleRef: localeRef,
        locales: (localeSettings?.locales ?? [])?.map((l) => {
          if (l.localeCode == props.locale.localeCode) {
            return {
              name: props.locale?.name,
              localeCode: props.locale?.localeCode,
              defaultFallbackLocaleRef,
              defaultTranslateFromLocaleRef,
            };
          }
          return l;
        }),
      });
    } else {
      if (!localeSettings?.defaultLocaleRef) {
        return;
      }
      setLocaleSettings({
        defaultLocaleRef: localeSettings?.defaultLocaleRef,
        locales: (localeSettings?.locales ?? [])?.map((l) => {
          if (l.localeCode == props.locale.localeCode) {
            return {
              name: props.locale?.name,
              localeCode: props.locale?.localeCode,
              defaultFallbackLocaleRef,
              defaultTranslateFromLocaleRef,
            };
          }
          return l;
        }),
      });
    }
    props.onDismiss();
  }, [
    localeSettings?.locales,
    localeSettings?.defaultLocaleRef,
    localeRef,
    props.locale,
    setLocaleSettings,
    props.onDismiss,
    props.locale,
    selectedFallback,
    selectedTranslateFrom,
    makeGlobalDefault,
  ]);

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismiss}
      disableBackgroundDismiss
      headerSize={"small"}
      topOffset={80}
      zIndex={4}
      headerChildren={
        <HeaderWrapper>
          <HeaderTitle>{"update locale"}</HeaderTitle>
        </HeaderWrapper>
      }
    >
      <OuterContainer>
        <div>
          <Row>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "flex-end",
              }}
            >
              <LocaleTitle>
                {`${props.locale.name} (${props?.locale?.localeCode})`}
              </LocaleTitle>
              {localeSettings?.defaultLocaleRef ==
                props?.locale?.localeCode && (
                <DefaultTitle>{"(default locale)"}</DefaultTitle>
              )}
            </div>
          </Row>
          <Row
            style={{
              marginTop: 32,
            }}
          >
            <SubPropTitle
              style={{ marginTop: 8, width: 160, textAlign: "left" }}
            >
              {"Fallback Locale:"}
            </SubPropTitle>
            <InputSelector
              size={"shorter"}
              label={"fallback locale"}
              placeholder={"select locale to fallback to"}
              options={existingLocaleOptions}
              value={selectedFallback}
              onChange={(option: Option<unknown> | null) => {
                setSelectedFallback((option?.value as string) ?? null);
              }}
            />
          </Row>
          <Row
            style={{
              marginTop: 16,
            }}
          >
            <SubPropTitle
              style={{ marginTop: 8, width: 160, textAlign: "left" }}
            >
              {"Source Locale:"}
            </SubPropTitle>
            <InputSelector
              size={"shorter"}
              label={"translate from locale"}
              placeholder={"select locale to translate from"}
              options={existingLocaleOptions}
              value={selectedTranslateFrom}
              onChange={(option: Option<unknown> | null) => {
                setSelectedTranslateFrom((option?.value as string) ?? null);
              }}
            />
          </Row>
          {localeRef != localeSettings?.defaultLocaleRef && (
            <Row
              style={{
                marginTop: 32,
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <ManualDefinedInstruction>
                {"Make global default locale (be careful)"}
              </ManualDefinedInstruction>
              <Checkbox
                isChecked={makeGlobalDefault}
                onChange={onToggleMakeDefault}
              />
            </Row>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Button
            label={"update locale"}
            bg={"orange"}
            size={"extra-big"}
            onClick={onUpdate}
          />
        </div>
      </OuterContainer>
    </RootLongModal>
  );
};

export default React.memo(UpdateLocaleModal);
