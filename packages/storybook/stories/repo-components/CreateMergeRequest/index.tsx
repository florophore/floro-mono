import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette, { Opacity } from "@floro/styles/ColorPalette";
import { Branch } from "floro/dist/src/repo";
import XCircleLight from "@floro/common-assets/assets/images/icons/x_circle.light.svg";
import { Link } from "react-router-dom";
import XCircleDark from "@floro/common-assets/assets/images/icons/x_circle.light.svg";
import Button from "../../design-system/Button";
import { RepoBranch } from "@floro/graphql-schemas/build/generated/main-graphql";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 64px;
  box-sizing: border-box;
`;

const XIcon = styled.img`
  height: 32px;
  width: 32px;
  margin-left: 12px;
  cursor: pointer;
  background: ${ColorPalette.white};
  border-radius: 50%;
  transition: box-shadow 300ms;
  box-shadow: 0px 2px 4px 2px
    ${(props) =>
      props.theme.name == "light"
        ? ColorPalette.gray.substring(0, 7) + Opacity[50]
        : ColorPalette.black.substring(0, 7) + Opacity[50]};
  &:hover {
    box-shadow: 0px 1px 2px 1px
      ${(props) =>
        props.theme.name == "light"
          ? ColorPalette.gray.substring(0, 7) + Opacity[50]
          : ColorPalette.black.substring(0, 7) + Opacity[50]};
  }
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  flex-grow: 1;
  box-sizing: border-box;
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  border-radius: 8px;
  padding: 10px 8px;
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  box-shadow: 0px 2px 4px 2px
    ${(props) =>
      props.theme.name == "light"
        ? ColorPalette.gray.substring(0, 7) + Opacity[50]
        : ColorPalette.black.substring(0, 7) + Opacity[50]};
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  flex-grow: 1;
`;

const ButtonContainer = styled.div`
  width: 100px;
  margin-left: 16px;
`;

const TitleText = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.1rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
`;

const BranchNameText = styled.p`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.linkColor};
  line-clamp: 1;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: underline;
`;

export interface Props {
  branch: RepoBranch;
  ignoreLoading?: boolean;
  onIgnore?: (branch: RepoBranch) => void;
  onCreate?: (branch: RepoBranch) => void;
  homeLink: string;
}

const CreateMergeRequest = (props: Props) => {
  const theme = useTheme();

  const onIgnore = useCallback(() => {
    props?.onIgnore?.(props.branch);
  }, [props.branch, props.onIgnore]);
  const onCreate = useCallback(() => {
    props?.onCreate?.(props.branch);
  }, [props.branch, props.onIgnore]);


  return (
    <Container>
      <InnerContainer>
        <TextContainer>
          <TitleText>{"create merge request for"}</TitleText>
          <Link to={props.homeLink + "&branch=" + props.branch.id}>
            <BranchNameText>{props.branch.name}</BranchNameText>
          </Link>
        </TextContainer>
        <ButtonContainer>
          <Button
            onClick={onCreate}
            isLoading={props.ignoreLoading}
            label={"create"}
            bg={"orange"}
            size={"small"}
          />
        </ButtonContainer>
      </InnerContainer>
      <XIcon onClick={onIgnore} src={XCircleLight} />
    </Container>
  );
};

export default React.memo(CreateMergeRequest);
