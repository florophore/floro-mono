import React, { useCallback, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import Button from "@floro/storybook/stories/design-system/Button";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useFloroContext,
  useFloroState,
} from "../floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import LocaleBox from "./LocaleBox";
import AddLocaleModal from "./AddLocaleModal";

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  margin-bottom: 24px;
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
  margin-bottom: 24px;
`;

interface Props {}

const LocalesSection = (props: Props) => {
  const { commandMode, applicationState } = useFloroContext();
  const [localeSettings, setLocaleSettings] = useFloroState("$(text).localeSettings");
  const [_isDragging, setIsDragging] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onShowAdd = useCallback(() => {
    setShowAdd(true);
  }, []);

  const onHideAdd = useCallback(() => {
    setShowAdd(false);
  }, []);

  const onReOrderIcons = useCallback(
    (values: SchemaTypes["$(text).localeSettings.locales"]) => {
      if (applicationState) {
        setLocaleSettings({
          defaultLocaleRef:
            localeSettings?.defaultLocaleRef as PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
          locales: values,
        });

      }
    },
    [applicationState, setLocaleSettings, localeSettings]
  );

  const onCreate = useCallback(
    (
      locale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"],
      makeDefault: boolean
    ) => {
      const locales = [...(localeSettings?.locales ?? []), locale];
      if (makeDefault) {
        const defaultLocaleRef = makeQueryRef(
          "$(text).localeSettings.locales.localeCode<?>",
          locale?.localeCode
        );
        setLocaleSettings({
          defaultLocaleRef,
          locales,
        });
      } else {
        setLocaleSettings({
          defaultLocaleRef:
            localeSettings?.defaultLocaleRef as PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
          locales,
        });
      }
      setShowAdd(false);
    },
    [localeSettings?.locales, setLocaleSettings, localeSettings]
  );

  const onRemove = useCallback(
    (
      localeCode: string,
    ) => {
      const locales = localeSettings?.locales?.filter(locale => localeCode != locale?.localeCode) ?? [];
      setLocaleSettings({
        defaultLocaleRef:
          localeSettings?.defaultLocaleRef as PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
        locales,
      });
    },
    [localeSettings?.locales, setLocaleSettings, localeSettings]
  );

  return (
    <div>
      <AddLocaleModal show={showAdd && commandMode == "edit"} onDismiss={onHideAdd} onCreate={onCreate}/>
      <Container>
        <TitleRow>
          <SectionTitle>{"Locales"}</SectionTitle>
          {commandMode == "edit" && (
            <div style={{ marginLeft: 24, width: 120 }}>
              <Button onClick={onShowAdd} label={"add locale"} bg={"orange"} size={"small"} />
            </div>
          )}
        </TitleRow>
        <div>
            <Reorder.Group
              axis="y"
              values={localeSettings?.locales ?? []}
              onReorder={onReOrderIcons}
              style={{listStyle: "none", margin: 0, padding: 0 }}
            >
              <AnimatePresence>
                {localeSettings?.locales?.map((locale, index) => {
                    return (
                      <LocaleBox
                        locale={locale}
                        key={locale.localeCode}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        index={index}
                        onRemove={onRemove}
                      />
                    );
                })}
              </AnimatePresence>
            </Reorder.Group>
        </div>
      </Container>
    </div>
  );
};

export default React.memo(LocalesSection);
