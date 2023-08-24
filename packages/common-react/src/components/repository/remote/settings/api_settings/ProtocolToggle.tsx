import React, { useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import DualToggle from "@floro/storybook/stories/design-system/DualToggle";

const InputContainer = styled.div`
  margin-top: 14px;
  position: relative;
  height: 64px;
  width: 432px;
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  transition: 500ms border-color;
`;

const InputLabelContainer = styled.div`
  position: relative;
  height: 32;
  top: -16px;
  left: 32px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.colors.inputLabelTextColor};
  padding: 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const InputLabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  transition: 500ms color;
  user-select: none;
`;

const InputLabelBorderEnd = styled.div`
  position: absolute;
  height: 2px;
  width: 2px;
  border-radius: 50%;
  top: 14px;
  transition: 500ms background-color;
`;

const InputRowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding-left: 20px;
  margin-top: -10px;
`;

export interface Props {
  protocol: "http" | "https";
  onChange: (value: "http" | "https") => void;
  label: string;
}

const ProtocolToggle = (props: Props) => {
  const theme = useTheme();
  const onChangeProtocol = useCallback(
    (value: string) => props.onChange(value as "http" | "https"),
    []
  );
  return (
    <InputContainer
      style={{
        border: `2px solid ${theme.colors.inputBorderColor}`,
        width: 470,
      }}
    >
      <InputLabelContainer>
        <InputLabelBorderEnd
          style={{
            left: -1,
            background: theme.colors.inputBorderColor,
          }}
        />
        <InputLabelText style={{ color: theme.colors.inputLabelTextColor }}>
          {props.label}
        </InputLabelText>
        <InputLabelBorderEnd style={{ right: -1 }} />
      </InputLabelContainer>
      <InputRowWrapper>
        <DualToggle
          value={props.protocol}
          leftOption={{
            label: "http",
            value: "http",
          }}
          rightOption={{
            label: "https",
            value: "https",
          }}
          onChange={onChangeProtocol}
        />
      </InputRowWrapper>
    </InputContainer>
  );
};

export default React.memo(ProtocolToggle);
