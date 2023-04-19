import React, {
  useMemo,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";

export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  sha?: string|null;
  message?: string|null;
  label: string;
  isValid?: boolean;
  button?: React.ReactElement|null;
  widthSize?: 'regular'|'wide';
  shaBackground?: string|null;
}

const Container = styled.div`
  margin-top: 14px;
  position: relative;
  height: 64px;
  width: 432px;
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  transition: 500ms border-color;
  cursor: pointer;
`;

const LabelContainer = styled.div`
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

const LabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  transition: 500ms color;
  user-select: none;
`;

const LabelBorderEnd = styled.div`
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
  align-items: center;
  justify-content: space-between;
  margin-top: -16px;
`;

const ShaDot = styled.div`
    border: 2px solid ${props => props.theme.colors.inputBorderColor};
    height: 32px;
    width: 32px;
    margin-left: 8px;
    border-radius: 50%;
`

const NoSha = styled.p`
  margin: 0 0 0 0;
  padding: 0 0 0 0;
  color: ${props => props.theme.colors.inputBorderColor};
  margin-left: 12px;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  transition: 500ms color;
  user-select: none;
`;

const Sha = styled.p`
  margin: 0 0 0 0;
  padding: 0 0 0 0;
  color: ${props => props.theme.colors.contrastText};
  margin-left: 12px;
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 1.2rem;
  transition: 500ms color;
`;

const Message = styled.p`
  margin: 0 0 0 0;
  padding: 0 0 0 0;
  color: ${props => props.theme.colors.contrastText};
  margin-left: 8px;
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  transition: 500ms color;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LeftText = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-grow: 1;
`

const SelectedShaDisplay = ({
  value,
  label,
  isValid = true,
  widthSize = "regular",
  ...rest
}: Props): React.ReactElement => {
  const theme = useTheme();

  const borderColor = useMemo(() => {
    if (!isValid) {
      return theme.colors.inputInvalidBorderColor;
    }
    return theme.colors.inputBorderColor;
  }, [theme.name, isValid]);

  const labelTextColor = useMemo(() => {
    if (!isValid) {
      return theme.colors.inputInvalidLabelTextColor;
    }
    return theme.colors.inputLabelTextColor;
  }, [theme.name, isValid]);

  return (
    <Container
      style={{
        border: `2px solid ${borderColor}`,
        width: widthSize == "regular" ? 432 : 470,
      }}
    >
      <LabelContainer>
        <LabelBorderEnd style={{ left: -1, background: borderColor }} />
        <LabelText style={{ color: labelTextColor }}>{label}</LabelText>
        <LabelBorderEnd style={{ right: -1 }} />
      </LabelContainer>
      <InputRowWrapper>
        <ShaDot style={{ background: rest.shaBackground ?? "tranparent" }} />
        <LeftText>
          <>
            {rest?.sha && <>
                <Sha>{`(${rest.sha?.substring(0, 4)})`}</Sha>
                <Message style={{maxWidth: !!rest?.button ? (widthSize == "regular" ? 160 : 200): (widthSize == "regular" ? 280 : 320)}}>
                    {rest?.message ?? ""}
                </Message>
            </>}
            {!rest?.sha && <NoSha>{"No commit selected"}</NoSha>}
          </>
        </LeftText>
        {!!rest.button && (
          <div style={{ marginRight: 12, width: 120 }}>{rest.button}</div>
        )}
      </InputRowWrapper>
    </Container>
  );
};
export default React.memo(SelectedShaDisplay);