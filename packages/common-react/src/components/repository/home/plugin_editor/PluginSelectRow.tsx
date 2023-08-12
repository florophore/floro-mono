import React, { useMemo, useCallback } from "react";
import {
  Repository,
  PluginVersion,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { useSearchParams } from "react-router-dom";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  width: 100%;
`;

const LeftSide = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const CenterInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  flex: 5;
  height: 56px;
`;

const RightSide = styled.div`
  flex: 2.5;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  height: 56px;
`;

const Icon = styled.img`
  height: 56px;
  width: 56px;
  margin-right: 24px;
`;

const DisplayName = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.connectionTextColor};
  &:hover {
    color: ${(props) => props.theme.colors.titleText};
    cursor: pointer;
  }
`;

interface Props {
  repository: Repository;
  pluginVersion: PluginVersion;
}

const PluginSelectRow = (props: Props) => {
  const theme = useTheme();

  const icon = useMemo(() => {
    if (theme.name == "light") {
      return props.pluginVersion?.selectedLightIcon as string;
    }

    return props.pluginVersion?.selectedDarkIcon as string;
  }, [props.pluginVersion, theme.name]);

  const [searchParams, setSearchParams] = useSearchParams();

  const onClick = useCallback(() => {
    const params = {};
    for(let [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    params["plugin"] = props.pluginVersion.name;
    setSearchParams(params)
  }, [searchParams, props?.pluginVersion?.name]);


  return (
    <Row>
      <LeftSide>
        <Icon src={icon} />
      </LeftSide>
      <CenterInfo>
        <DisplayName onClick={onClick}>
          {props.pluginVersion?.displayName}
        </DisplayName>
      </CenterInfo>
      <RightSide>
      </RightSide>
    </Row>
  );
};

export default React.memo(PluginSelectRow);
