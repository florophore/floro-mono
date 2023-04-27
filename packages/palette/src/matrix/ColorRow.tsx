
import React, { useMemo } from "react";
import {  SchemaTypes, useFloroState, useHasConflict, useHasIndication, useIsFloroInvalid, useQueryRef, useWasAdded, useWasRemoved } from "../floro-schema-api";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import ColorCell from "./ColorCell";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

const Container = styled.div`
  padding: 0;
  margin-top: 24px;
  margin-right: 36px;
`

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${props => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const Row = styled.h1`
    display: flex;
    flex-direction: row;
    margin-top: 36px;
`;

const TitleRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const WarningIconImg = styled.img`
  height: 24px;
  width: 24x;
  margin-left: 24px;
`;

interface Props {
    color: SchemaTypes['$(palette).colors.id<?>']
}

const ColorRow = (props: Props) => {
    const theme = useTheme();
    const colorRef = useQueryRef("$(palette).colors.id<?>", props.color.id);
    const colorRowRef = useQueryRef("$(palette).palette.id<?>", colorRef);
    const isInvalid = useIsFloroInvalid(colorRef, true);
    const wasRemoved = useWasRemoved(colorRowRef, true);
    const wasAdded = useWasAdded(colorRowRef, true);
    const hasConflict = useHasConflict(colorRowRef, true);

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

    const warningIcon = useMemo(() => {
        if (theme.name == "light") {
        return WarningLight;
        }
        return WarningDark;
    }, [theme.name]);

    const title = useMemo(
      () => (isInvalid ? props.color.id : props.color.name),
      [isInvalid, props.color]
    );

    const [shades] = useFloroState("$(palette).shades", [], false);
    return (
      <Container>
        <TitleRow>
            <RowTitle style={{color}}>{title}</RowTitle>
            {isInvalid && (
                <WarningIconImg src={warningIcon}/>
            )}
        </TitleRow>
        <Row>
          {shades?.map((shade) => {
            return (
              <ColorCell key={shade.id} shade={shade} color={props.color} />
            );
          })}
        </Row>
      </Container>
    );
}

export default React.memo(ColorRow);