import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import {
  useCurrentRepoState,
  useUpdateCurrentCommand,
} from "./hooks/local-hooks";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import Button from "@floro/storybook/stories/design-system/Button";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import XCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import XCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import DualToggle from "@floro/storybook/stories/design-system/DualToggle";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  width: 100%;
  height: 72px;
  border-bottom: 1px solid
    ${(props) => props.theme.colors.localRemoteBorderColor};
  box-sizing: border-box;
  padding-left: 24px;
  padding-right: 40px;
`;

const LeftContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 72px;
`;

const InvalidState = styled.img`
  height: 32px;
  width: 32px;
`;

const InvalidText = styled.span`
  color: ${(props) => props.theme.colors.contrastText};
  font-weight: 500;
  font-size: 1rem;
  font-family: "MavenPro";
  margin-left: 8px;
`;

interface Props {
  repository: Repository;
  plugin?: string;
}

const LocalRepoSubHeader = (props: Props) => {
  const theme = useTheme();
  const loaderColor = useMemo(
    () => (theme.name == "light" ? "purple" : "lightPurple"),
    [theme.name]
  );
  const { data: repoData } = useCurrentRepoState(props.repository);
  const updateCommand = useUpdateCurrentCommand(props.repository);

  const updateToViewMode = useCallback(() => {
    updateCommand.mutate("view");
  }, [updateCommand]);

  const updateToEditMode = useCallback(() => {
    updateCommand.mutate("edit");
  }, [updateCommand]);

  const xCircle = useMemo(() => {
    if (theme.name == "light") {
      return XCircleLight;
    }
    return XCircleDark;
  }, [theme.name]);

  const warning = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name]);

  const isInvalid = useMemo(() => {
    return (
      (repoData?.apiStoreInvalidity?.[props?.plugin ?? ""]?.length ?? 0) > 0
    );
  }, [repoData?.apiStoreInvalidity, props.plugin]);

  return (
    <>
      {repoData?.repoState?.commandMode == "view" && (
        <Container>
          <LeftContainer>
            {false &&
              <div style={{marginRight: 12}}>
                <DualToggle onChange={function (value: string): void {
                  throw new Error("Function not implemented.");
                } } value={"before"} leftOption={{
                  label: "before",
                  value: "before"
                }} rightOption={{
                  label: "after",
                  value: "after"
                }}/>
              </div>
            }
            {isInvalid && (
              <>
                <InvalidState src={warning} />
                <InvalidText>{`(invalid)`}</InvalidText>
              </>
            )}
          </LeftContainer>
          <Button
            label={"edit"}
            bg={"orange"}
            size={"small"}
            onClick={updateToEditMode}
          />
        </Container>
      )}
      {repoData?.repoState?.commandMode == "edit" && (
        <Container>
          <LeftContainer>
            {isInvalid && (
              <>
                <InvalidState src={warning} />
                <InvalidText>{`(invalid)`}</InvalidText>
              </>
            )}
          </LeftContainer>

          <Button
            label={"preview"}
            bg={"purple"}
            size={"small"}
            onClick={updateToViewMode}
          />
        </Container>
      )}
    </>
  );
};

export default React.memo(LocalRepoSubHeader);
