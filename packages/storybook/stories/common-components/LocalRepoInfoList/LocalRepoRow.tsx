import React, { useMemo, useCallback } from "react";
import { PluginVersion } from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Link } from "react-router-dom";
import TimeAgo from "javascript-time-ago";
import Button from "../../design-system/Button";
import CheckMarkLight from "@floro/common-assets/assets/images/icons/teal_check_mark_circle.light.svg";
import RedXLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import { RepoInfo } from "floro/dist/src/repo";

const RowContainer = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  height: 42px;
  border-width: 2px;
  border-style: solid;
  border-radius: 8px;
  box-sizing: border-box;
  padding: 0 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const HandleTitle = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.titleText};
`;

const NameText = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.1rem;
  color: ${(props) => props.theme.colors.blurbText};
`;

const ReleasedText = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.releasedText};
`;

const UnReleasedText = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.unreleasedText};
`;

export interface Props {
  repoInfo: RepoInfo;
  isEven: boolean;
  isFirst: boolean;
  onSelectRepoInfo: (repoInfo: RepoInfo) => void;
}

const LocalRepoRow = (props: Props) => {
  const theme = useTheme();
  const backgroundColor = useMemo(() => {
    if (props.isEven) {
      return theme.colors.evenBackground;
    }
    return theme.colors.oddBackground;
  }, [theme, props.isEven]);

  const borderColor = useMemo(() => {
    return backgroundColor;
  }, [backgroundColor]);

  const handle = useMemo(() => {
    return `@${props?.repoInfo?.ownerHandle}`;
  }, [props?.repoInfo?.ownerHandle]);

  const onClick = useCallback(() => {
    if (!props?.repoInfo) {
      return;
    }
    props?.onSelectRepoInfo(props?.repoInfo);
  }, [props?.repoInfo, props?.onSelectRepoInfo]);
  return (
    <RowContainer style={{ backgroundColor, borderColor }}>
      <div style={{ flex: 2 }}>
        <HandleTitle>{handle}</HandleTitle>
      </div>
      <div style={{ flex: 2, paddingLeft: 12, boxSizing: "border-box" }}>
        <NameText>{props?.repoInfo?.name}</NameText>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <Button
          label={"choose"}
          bg={"teal"}
          size={"extra-small"}
          onClick={onClick}
        />
      </div>
    </RowContainer>
  );
};

export default React.memo(LocalRepoRow);