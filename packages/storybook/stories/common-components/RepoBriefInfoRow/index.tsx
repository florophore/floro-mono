import React, { useMemo, useState, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import LockLight from "@floro/common-assets/assets/images/icons/lock.medium_gray.svg";
import LockDark from "@floro/common-assets/assets/images/icons/lock.dark.svg";
import LockHovered from "@floro/common-assets/assets/images/icons/lock.hovered.svg";
import OpenbookLight from "@floro/common-assets/assets/images/icons/openbook.medium_gray.svg";
import OpenbookDark from "@floro/common-assets/assets/images/icons/openbook.dark.svg";
import OpenbookHovered from "@floro/common-assets/assets/images/icons/openbook.hovered.svg";
import { Repository } from "@floro/graphql-schemas/build/generated/main-graphql";
import TimeAgo from "javascript-time-ago";
import { Link } from "react-router-dom";

// English.
import ColorPalette from "@floro/styles/ColorPalette";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  user-select: none;
  width: 100%;
  margin-bottom: 12px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const IconWrapper = styled.div`
  margin-left: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
`;

const PrivateIcon = styled.img`
  height: 24px;
  cursor: pointer;
`;

const PublicIcon = styled.img`
  height: 20px;
  cursor: pointer;
  padding-top: 2px;
  margin-bottom: -2px;
`;

const TextWrap = styled.div`
  display: flex;
  flex-direction: row;
`;

const RepoTitle = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  cursor: pointer;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-x: hidden;
  max-width: 200px;
`;

const TextContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  margin: 0;
  padding: 0;
`;

const ElapseText = styled.p`
  padding: 4px;
  margin: 0;
  font-size: 0.9rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.repoBriefRowUpdateColor};
`;

const ElapseSince = styled.span`
  font-weight: 400;
`;

export interface Props {
  repo: Repository;
  isLocal: boolean;
}

const RepoBriefInfoRow = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);
  const [isHovering, setIsHovering] = useState(false);
  const privateIcon = useMemo(() => {
    if (isHovering) {
      return LockHovered;
    }
    return theme.name == "light" ? LockLight : LockDark;
  }, [theme.name, isHovering]);

  const publicIcon = useMemo(() => {
    if (isHovering) {
      return OpenbookHovered;
    }
    return theme.name == "light" ? OpenbookLight : OpenbookDark;
  }, [theme.name, isHovering]);

  const titleColor = useMemo(() => {
    if (isHovering) {
      return ColorPalette.linkBlue;
    }
    return theme.colors.repoBriefRowColor;
  }, [theme.name, isHovering]);

  const elapsedTime = useMemo(
    () => timeAgo.format(new Date(props.repo.lastRepoUpdateAt as string)),
    [timeAgo, props.repo.lastRepoUpdateAt]
  );

  const linkLocation = useMemo(() => {
    const searchParams = props.isLocal ? "?from=local" : "?from=remote";
    if (props.repo.repoType == "user_repo") {
      return `/repo/@/${props.repo.user?.username}/${props.repo.name}${searchParams}`;
    }
    return `/repo/@/${props.repo.organization?.handle}/${props.repo.name}${searchParams}`;
  }, [props.repo, props.isLocal]);

  const onStartHover = useCallback(() => {
    setIsHovering(true);
  }, []);

  const onStopHover = useCallback(() => {
    setIsHovering(false);
  }, []);

  return (
    <Container>
      <Link to={linkLocation}>
        <Row onMouseEnter={onStartHover} onMouseLeave={onStopHover}>
          <IconWrapper>
            {props.repo.isPrivate && <PrivateIcon src={privateIcon} />}
            {!props.repo.isPrivate && <PublicIcon src={publicIcon} />}
          </IconWrapper>
          <TextWrap>
            <RepoTitle style={{ color: titleColor }}>
              {props.repo.name}
            </RepoTitle>
          </TextWrap>
        </Row>
      </Link>
      <Row>
        <TextContainer>
          <ElapseText>
            {"Last Updated "}
            <ElapseSince>{elapsedTime}</ElapseSince>
          </ElapseText>
        </TextContainer>
      </Row>
    </Container>
  );
};

export default React.memo(RepoBriefInfoRow);
