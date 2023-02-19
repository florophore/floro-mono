import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 32px;
  width: 190px;
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
  font-weight: 400;
  font-size: 1.1rem;
`;

export interface Props {
  onChange: (value: string) => void;
  value: string;
  leftOption: {
    label: string;
    value: string;
  };
  rightOption: {
    label: string;
    value: string;
  };
}

const DualToggle = (props: Props) => {
  const theme = useTheme();
  const leftBackgrounColor = useMemo(() => {
    if (props.value != props.leftOption.value) {
      return theme.background;
    }
    return theme.colors.toggleColor;
  }, [theme, props.value, props.leftOption]);

  const leftColor = useMemo(() => {
    if (props.value == props.leftOption.value) {
      return ColorPalette.white;
    }
    return theme.colors.toggleColor;
  }, [theme, props.value, props.leftOption]);

  const rightBackgrounColor = useMemo(() => {
    if (props.value != props.rightOption.value) {
      return theme.background;
    }
    return theme.colors.toggleColor;
  }, [theme, props.value, props.rightOption]);

  const rightColor = useMemo(() => {
    if (props.value == props.rightOption.value) {
      return ColorPalette.white;
    }
    return theme.colors.toggleColor;
  }, [theme, props.value, props.rightOption]);

  const onClickLeft = useCallback(() => {
    props.onChange(props.leftOption.value);
  }, [props.leftOption, props.onChange]);

  const onClickRight = useCallback(() => {
    props.onChange(props.rightOption.value);
  }, [props.rightOption, props.onChange]);

  return (
    <Container>
      <Option
        onClick={onClickLeft}
        style={{
          backgroundColor: leftBackgrounColor,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
        }}
      >
        <OptionText style={{ color: leftColor }}>
          {props.leftOption.label}
        </OptionText>
      </Option>
      <Option
        onClick={onClickRight}
        style={{
          backgroundColor: rightBackgrounColor,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
        }}
      >
        <OptionText style={{ color: rightColor }}>
          {props.rightOption.label}
        </OptionText>
      </Option>
    </Container>
  );
};

export default React.memo(DualToggle);
