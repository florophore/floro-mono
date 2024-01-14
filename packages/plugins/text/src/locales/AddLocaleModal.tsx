import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import {
  SchemaTypes,
  makeQueryRef,
  useReferencedObject,
} from "../floro-schema-api";
import InputSelector, {
  Option,
} from "@floro/storybook/stories/design-system/InputSelector";

import Button from "@floro/storybook/stories/design-system/Button";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

import deepLSourceLocales from "../deep_l_source_locales.json";
import Input from "@floro/storybook/stories/design-system/Input";

const DeepLSourceTargetLocales: { [code: string]: string } = deepLSourceLocales;

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
  onCreate: (
    locale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"],
    makeDefaultLocale: boolean
  ) => void;
}

const AddLocaleModal = (props: Props) => {
  const locales = useReferencedObject("$(text).localeSettings.locales");

  const [usePredefined, setUsePredefined] = useState(true);
  const [makeGlobalDefault, setMakeGlobalDefault] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<string | null>(null);
  const [selectedFallback, setSelectedFallback] = useState<string | null>(null);
  const [selectedTranslateFrom, setSelectedTranslateFrom] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [localeCode, setLocaleCode] = useState("");

  useEffect(() => {
    if (!props.show) {
      setUsePredefined(true);
      setMakeGlobalDefault(false);
      setSelectedLocale(null);
      setSelectedFallback(null);
      setSelectedTranslateFrom(null);
      setName("");
      setLocaleCode("");
    }
  }, [props.show])

  const usedCodes = useMemo(() => {
    return new Set(locales?.map((locale) => locale.localeCode.toUpperCase()) ?? []);
  }, [locales]);
  const usedNames = useMemo(() => {
    return new Set(locales?.map((locale) => locale.name.toUpperCase()) ?? []);
  }, [locales]);

  const predefinedChoices = useMemo(() => {
    return Object.keys(DeepLSourceTargetLocales)
      .map((localeCode) => {
        return {
          label: `${DeepLSourceTargetLocales[localeCode]} (${localeCode})`,
          value: localeCode.toUpperCase(),
        };
      })
      ?.filter((v) => !usedCodes.has(v.value)) ?? [];
  }, [usedCodes, locales]);

  const existingLocaleOptions = useMemo(() => {
    return [
      ...locales?.map((locale) => {
        return {
          label: `${locale.localeCode} (${locale.name})`,
          value: locale.localeCode.toUpperCase(),
        };
      }) ?? [],
      { label: "None/(Global Default Locale)", value: null },
    ];
  }, [locales]);

  const localeNameIsValid = useMemo(() => {
    if (name == "") {
      return true;
    }
    if (name.trim() == "") {
      return false;
    }
    if (name.length > 30) {
      return false;
    }
    if (usedNames.has(name.toUpperCase())) {
      return false;
    }
    return true;
  }, [name, usedNames]);

  const localeCodeIsValid = useMemo(() => {
    if (localeCode == "") {
      return true;
    }
    if (localeCode.trim() == "") {
      return true;
    }
    if (!/^[a-z]{2}(-[A-Z]{2})?$/i.test(localeCode)) {
      return false;
    }

    if (usedCodes.has(localeCode.toUpperCase())) {
      return false;
    }
    return true;
  }, [localeCode, usedCodes]);

  const isCreateEnabled = useMemo(() => {
    if (usePredefined) {
      return !!selectedLocale;
    }
    if (localeCode.trim() == "" || name.trim() == "") {
      return false;
    }
    if (!localeNameIsValid) {
      return false;
    }
    if (!localeCodeIsValid) {
      return false;
    }
    return true;
  }, [selectedLocale, usePredefined, localeNameIsValid, localeCodeIsValid, localeCode, name])

  const onToggleUsePredefined = useCallback(() => {
    setUsePredefined(!usePredefined);
  }, [usePredefined]);

  const onToggleMakeDefault = useCallback(() => {
    setMakeGlobalDefault(!makeGlobalDefault);
  }, [makeGlobalDefault]);

  const onCreate = useCallback(() => {
    if (!isCreateEnabled) {
      return;
    }
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
    const locale: SchemaTypes['$(text).localeSettings.locales.localeCode<?>'] = usePredefined && selectedLocale ? {
      name: DeepLSourceTargetLocales[selectedLocale],
      localeCode: selectedLocale,
      defaultTranslateFromLocaleRef,
      defaultFallbackLocaleRef
    } : {
      name,
      localeCode,
      defaultTranslateFromLocaleRef,
      defaultFallbackLocaleRef
    }
    props.onCreate(locale, makeGlobalDefault)
  }, [
    props.onCreate,
    isCreateEnabled,
    selectedLocale,
    usePredefined,
    localeNameIsValid,
    localeCodeIsValid,
    localeCode,
    name,
    selectedFallback,
    selectedTranslateFrom,
    makeGlobalDefault
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
          <HeaderTitle>{"add locale"}</HeaderTitle>
        </HeaderWrapper>
      }
    >
      <OuterContainer>
        <div>
          <Row>
            <InputSelector
              isDisabled={!usePredefined}
              size="short"
              options={predefinedChoices}
              label={"predefined locales"}
              placeholder={
                !usePredefined ? "Select disabled" : "Select a locale"
              }
              value={usePredefined ? selectedLocale : null}
              maxHeight={500}
              onChange={(option: Option<unknown> | null) => {
                setSelectedLocale((option?.value as string) ?? null);
              }}
            />
            <RightInfo style={{ paddingTop: 8 }}>
              <ManualDefinedInstruction>
                {"create locale manually"}
              </ManualDefinedInstruction>
              <Checkbox
                isChecked={!usePredefined}
                onChange={onToggleUsePredefined}
              />
            </RightInfo>
          </Row>
          {!usePredefined && (
            <>
              <Row
                style={{
                  marginTop: 32,
                }}
              >
                <SubPropTitle
                  style={{ marginTop: 8, width: 120, textAlign: "left" }}
                >
                  {"Locale Name:"}
                </SubPropTitle>
                <Input
                  value={name}
                  onTextChanged={setName}
                  widthSize={"shorter"}
                  label={"locale name"}
                  placeholder={'locale name (e.g. "English")'}
                  isValid={localeNameIsValid}
                />
              </Row>
              <Row
                style={{
                  marginTop: 16,
                }}
              >
                <SubPropTitle
                  style={{ marginTop: 8, width: 120, textAlign: "left" }}
                >
                  {"Locale Code:"}
                </SubPropTitle>
                <Input
                  value={localeCode}
                  onTextChanged={setLocaleCode}
                  widthSize={"shorter"}
                  label={"locale code"}
                  placeholder={'locale code (e.g. "EN")'}
                  isValid={localeCodeIsValid}
                />
              </Row>
            </>
          )}
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
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Button
            isDisabled={!isCreateEnabled}
            label={"add locale"}
            bg={"purple"}
            size={"extra-big"}
            onClick={onCreate}
          />
        </div>
      </OuterContainer>
    </RootLongModal>
  );
};

export default React.memo(AddLocaleModal);
