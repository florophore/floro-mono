import React, { useMemo, useCallback } from "react";
import { SourceCommitNodeWithGridDimensions } from "@floro/storybook/stories/common-components/SourceGraph/grid";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Button from "@floro/storybook/stories/design-system/Button";
import ExitIconLight from "@floro/common-assets/assets/images/icons/exit_icon.light.svg";
import ExitIconDark from "@floro/common-assets/assets/images/icons/exit_icon.dark.svg";
import { Branch } from "floro/dist/src/repo";
import { Link } from "react-router-dom";

const InnerContent = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

const TopContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
`;

const BottomContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 12px;
`;

const TextRow = styled.span`
  display: inline-block;
  height: 100%;
  width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Label = styled.span`
  display: inline;
  font-weight: 600;
  font-size: 1.2rem;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.titleText};
`;

const Value = styled.span`
  display: inline;
  margin-left: 16px;
  font-weight: 500;
  font-size: 1rem;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
`;

const UsernameValue = styled.span`
  display: inline;
  margin-left: 16px;
  font-weight: 500;
  font-size: 1rem;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
  &:hover {
    color: ${(props) => props.theme.colors.linkColor};
    cursor: pointer;
  }
`;

const ExitIcon = styled.img`
  height: 24px;
  width: 24px;
  cursor: pointer;
`;

interface Props {
  onHidePopup?: () => void;
  sourceCommit?: SourceCommitNodeWithGridDimensions;
  terminalBranches?: Array<Branch>;
  onSelectHead?: (
    sourceCommit: SourceCommitNodeWithGridDimensions | null
  ) => void;
  currentSha?: string | null;
  isLoading?: boolean;
}
const SGSelectShaModal = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    if (theme.name == "light") {
      return ExitIconLight;
    }
    return ExitIconDark;
  }, [theme.name]);

  const onSelectHead = useCallback(() => {
    props?.onSelectHead?.(props?.sourceCommit ?? null);
    props?.onHidePopup?.();
  }, [props?.onSelectHead, props?.sourceCommit, props?.onHidePopup]);

  const timestamp = useMemo(() => {
    const date = new Date(props.sourceCommit?.timestamp ?? "");
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
  }, [props.sourceCommit?.timestamp])

  return (
    <InnerContent>
      <TopContainer>
        <Row>
          <TextRow>
            <Label>{"Sha:"}</Label>
            <Value>{props.sourceCommit?.sha?.substring(0, 8)}</Value>
          </TextRow>
          <ExitIcon onClick={props.onHidePopup} src={icon} />
        </Row>
        <Row>
          <TextRow>
            <Label>{"Message:"}</Label>
            <Value>{props.sourceCommit?.message}</Value>
          </TextRow>
        </Row>
        <Row>
          <TextRow>
            <Label>{"User:"}</Label>
            <Link to={`/user/@/${props.sourceCommit?.username}`}>
              <UsernameValue>
                {`@${props.sourceCommit?.username}`}
              </UsernameValue>
            </Link>
          </TextRow>
        </Row>
        <Row>
          <TextRow>
            <Label>{"Time:"}</Label>
            <Value>{timestamp}</Value>
          </TextRow>
        </Row>
      </TopContainer>

      <BottomContainer>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={onSelectHead}
            label={"select commit"}
            bg={"purple"}
            size={"small"}
            textSize="small"
            isDisabled={props.sourceCommit?.sha == props?.currentSha}
            isLoading={props.isLoading}
          />
        </div>
      </BottomContainer>
    </InnerContent>
  );
};

export default React.memo(SGSelectShaModal);
