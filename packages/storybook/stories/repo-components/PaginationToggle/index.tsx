import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 40px;
  width: 220px;
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.toggleColor};
  border-radius: 8px;
`;

const Option = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const OptionText = styled.div`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
`;

export interface Props {
  onNewer: () => void;
  onOlder: () => void;
  newerDisabled: boolean;
  olderDisabled: boolean;
}

const PaginationToggle = (props: Props) => {
  const theme = useTheme();
  const leftBackgrounColor = useMemo(() => {
    if (props.newerDisabled) {
      return theme.colors.paginationDisabledBackground;
    }
    return theme.colors.paginationBackground;
  }, [theme.colors, props.newerDisabled]);

  const leftColor = useMemo(() => {
    if (props.newerDisabled) {
      return theme.colors.paginationDisabledText;
    }
    return theme.colors.paginationText;
  }, [theme, props.newerDisabled]);

  const rightBackgrounColor = useMemo(() => {
    if (props.olderDisabled) {
      return theme.colors.paginationDisabledBackground;
    }
    return theme.colors.paginationBackground;
  }, [theme?.colors, props.olderDisabled]);

  const rightColor = useMemo(() => {
    if (props.olderDisabled) {
      return theme.colors.paginationDisabledText;
    }
    return theme.colors.paginationText;
  }, [theme.colors, props.olderDisabled]);

  const onClickLeft = useCallback(() => {
    if (!props.newerDisabled) {
      props.onNewer();
    }
  }, [props.onNewer, props.newerDisabled]);

  const onClickRight = useCallback(() => {
    if (!props.olderDisabled) {
      props.onOlder();
    }
  }, [props.onOlder, props.olderDisabled]);

  return (
    <Container>
      <Option
        onClick={onClickLeft}
        style={{
          backgroundColor: leftBackgrounColor,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          borderRight: `1px solid ${theme.colors.paginationBorder}`,
          cursor: props.newerDisabled ? "not-allowed" : "pointer"
        }}
      >
        <OptionText style={{ color: leftColor }}>
          {"Newer"}
        </OptionText>
      </Option>
      <Option
        onClick={onClickRight}
        style={{
          backgroundColor: rightBackgrounColor,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          borderLeft: `1px solid ${theme.colors.paginationBorder}`,
          cursor: props.olderDisabled ? "not-allowed" : "pointer"
        }}
      >
        <OptionText style={{ color: rightColor }}>
          {"Older"}
        </OptionText>
      </Option>
    </Container>
  );
};

export default React.memo(PaginationToggle);
