import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useFloroContext,
  useFloroState,
  useHasConflict,
  useHasIndication,
  useIsFloroInvalid,
  useQueryRef,
  useReferencedObject,
  useWasAdded,
  useWasRemoved,
} from "../floro-schema-api";
import { AnimatePresence, Reorder, motion, useDragControls } from "framer-motion";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { css } from "@emotion/css";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import Input from "@floro/storybook/stories/design-system/Input";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

import XCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import XCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";
import ThemeDefCell from "./ThemeDefCell";
import ThemeDefVariantCell from "./ThemeDefVariantCell";
import Button from "@floro/storybook/stories/design-system/Button";

const Container = styled.div`
  padding: 0;
  margin-bottom: 8px;
  margin-right: 20px;
  margin-left: 16px;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
`;

const RowWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;


interface Props {
  themeColor: SchemaTypes["$(theme).themeColors.id<?>"];
  index: number;
  remappedSVG?: string;
  themingHex?: string;
  defaultIconTheme: string;
  selectedVariants?: {[key: string]: boolean};
  appliedThemes?: {[key: string]: PointerTypes['$(theme).themeColors.id<?>']};
  onSelect?: (themeColorRef: PointerTypes['$(theme).themeColors.id<?>']) => void;
  onNoTheme?: (hex: string) => void;
}

const ThemeRow = (props: Props) => {
  const theme = useTheme();
  const themeColorRef = useQueryRef(
    "$(theme).themeColors.id<?>",
    props.themeColor.id
  );

  const onSelect = useCallback(() => {
    if (themeColorRef) {
      props?.onSelect?.(themeColorRef);
    }
  }, [props.onSelect, themeColorRef]);

  const onNoTheme = useCallback(() => {
    if (props.themingHex) {
      props?.onNoTheme?.(props.themingHex);
    }
  }, [props.onNoTheme, props.themingHex])

  const themeColor = useReferencedObject(themeColorRef);
  const defaultThemeRef = makeQueryRef("$(theme).themes.id<?>", props.defaultIconTheme);
  const defaultThemeColorDefRef = makeQueryRef(
    "$(theme).themeColors.id<?>.themeDefinitions.id<?>",
    props.themeColor.id,
    defaultThemeRef
  );
  const defaultThemeColorDef = useReferencedObject(defaultThemeColorDefRef);
  const paletteColor = useReferencedObject(defaultThemeColorDef?.paletteColorShade);

  const isInvalid = useIsFloroInvalid(themeColorRef, false);
  const wasRemoved = useWasRemoved(themeColorRef, false);
  const wasAdded = useWasAdded(themeColorRef, false);
  const hasConflict = useHasConflict(themeColorRef, false);

  const color = useMemo(() => {
    if (hasConflict) {
      return theme.colors.conflictText;
    }
    if (wasRemoved) {
      return theme.colors.removedText;
    }
    if (wasAdded) {
      return theme.colors.addedText;
    }
    return theme.colors.contrastText;
  }, [theme, wasRemoved, wasAdded, hasConflict]);

  const title = useMemo(
    () => (isInvalid ? props.themeColor.id : props.themeColor.name),
    [isInvalid, props.themeColor]
  );

  const themes = useReferencedObject("$(theme).themes");
  const stateVariants = useReferencedObject("$(theme).stateVariants");
  const includeVariants = useMemo(() => Object.keys(props.selectedVariants ?? {}).reduce((hasVariant, k) => {
    if (hasVariant || props.selectedVariants?.[k]) {
      return true;
    }
    return false;

  }, false), [props.selectedVariants]);

  const isApplied = useMemo(() => {
    if (!props.themingHex || !props?.appliedThemes?.[props.themingHex]) {
      return false;
    }
    return themeColorRef == props.appliedThemes[props.themingHex]
  }, [props.appliedThemes, props.themingHex, themeColorRef])

  if (!paletteColor?.hexcode || paletteColor?.hexcode != props.themingHex?.substring(0, 7)) {
    return null;
  }

  return (
    <Container>
      <TitleRow>
        <RowTitle style={{ color, marginTop: 12 }}>{title}</RowTitle>
        {isApplied && (
          <Button
            label={"undo apply"}
            bg={"gray"}
            size={"small"}
            style={{ marginTop: 16, marginLeft: 16 }}
            onClick={onNoTheme}
          />
        )}
        {!isApplied && (
          <Button
            label={"apply"}
            bg={"orange"}
            size={"small"}
            style={{ marginTop: 16, marginLeft: 16 }}
            onClick={onSelect}
          />
        )}
      </TitleRow>
      <div>
        <RowWrapper>
          <Row>
            {!includeVariants && (
              <>
                {themes?.map((themeObject) => {
                  return (
                    <ThemeDefCell
                      key={`${themeObject.id}-${props.themeColor.id}`}
                      themeObject={themeObject}
                      themeColor={props.themeColor}
                      themingHex={props.themingHex}
                      defaultIconTheme={props.defaultIconTheme}
                      remappedSVG={props.remappedSVG}
                      appliedThemes={props.appliedThemes}
                    />
                  );
                })}
              </>
            )}
            {includeVariants && (
              <>
                <Col>
                  {themes?.map((themeObject) => {
                    return (
                      <ThemeDefCell
                        key={`${themeObject.id}-${props.themeColor.id}`}
                        themeObject={themeObject}
                        themeColor={props.themeColor}
                        themingHex={props.themingHex}
                        defaultIconTheme={props.defaultIconTheme}
                        remappedSVG={props.remappedSVG}
                        appliedThemes={props.appliedThemes}
                      />
                    );
                  })}
                </Col>
                {stateVariants
                  ?.filter((s) => {
                    return !!props?.selectedVariants?.[s.id];
                  })
                  ?.map((variant) => {
                    return (
                      <Col key={variant.id}>
                        {themes?.map((themeObject) => {
                          const variantDefinitionRef = makeQueryRef(
                            "$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>",
                            props.themeColor.id,
                            makeQueryRef(
                              "$(theme).stateVariants.id<?>",
                              variant.id
                            ),
                            makeQueryRef(
                              "$(theme).themes.id<?>",
                              themeObject.id
                            )
                          );
                          return (
                            <ThemeDefVariantCell
                              key={`${variantDefinitionRef}`}
                              variantDefinitionRef={variantDefinitionRef}
                              selectedVariants={props.selectedVariants}
                              themingHex={props.themingHex}
                              defaultIconTheme={props.defaultIconTheme}
                              remappedSVG={props.remappedSVG}
                              appliedThemes={props.appliedThemes}
                            />
                          );
                        })}
                      </Col>
                    );
                  })}
              </>
            )}
          </Row>
        </RowWrapper>
      </div>
    </Container>
  );
};

export default React.memo(ThemeRow);
