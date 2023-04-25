import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Link, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import { useSession } from "../../../../session/session-context";
import CommitSelector from "@floro/storybook/stories/repo-components/CommitSelector";
import {
  useOfflinePhoto,
  useOfflinePhotoMap,
} from "../../../../offline/OfflinePhotoContext";
import { useUserOrganizations } from "../../../../hooks/offline";
import AdjustExtend from "@floro/common-assets/assets/images/icons/adjust.extend.svg";
import AdjustShrink from "@floro/common-assets/assets/images/icons/adjust.shrink.svg";
import LaptopWhite from "@floro/common-assets/assets/images/icons/laptop.white.svg";
import GlobeWhite from "@floro/common-assets/assets/images/icons/globe.white.svg";
import Button from "@floro/storybook/stories/design-system/Button";
import LocalRemoteToggle from "@floro/storybook/stories/common-components/LocalRemoteToggle";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from 'axios';
import { useDaemonIsConnected } from "../../../../pubsub/socket";
import { useCurrentRepoState } from "../hooks/local-hooks";
import LocalVCSViewMode from "./LocalVCSViewMode";
import { useLocalVCSNavContext } from "./LocalVCSContext";
import LocalBranchesNavPage from "./LocalBranchesNavPage";
import { useSourceGraphIsShown } from "../../ui-state-hook";
import SourceGraphMount from "../../sourcegraph/SourceGraphMount";
import NewBranchNavPage from "./NewBranchNavPage";
import LocalVCSEditMode from "./LocalVCSEditMode";
import LocalVCSCompareMode from "./LocalVCSCompareMode";
import WriteCommitNavPage from "./WriteCommitNavPage";
import EditBranchNavPage from "./EditBranchNavPage";
import LocalVCSCompareMergeMode from "./LocalVCSCompareMergeMode";
import SourceGraphNav from "./SourceGraphNav";

const Container = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: border 400ms;
  position: relative;
`;

const InnerContainer = styled.div`
  display: flex;
  height: 100%;
  width: 502px;
  overflow: hidden;
  transition: width 400ms;
`;

const InnerContainerContent = styled.div`
  display: flex;
  height: 100%;
  width: 502px;
  flex-direction: column;
  justify-content: space-between;
`;

const InnerContent = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  align-items: center;
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  position: relative;
  align-items: center;
  padding: 24px;
`;

interface Props {
  repository: Repository;
}

const LocalVCSNavController = (props: Props) => {

  const { data } = useCurrentRepoState(props.repository);
  const { subAction} = useLocalVCSNavContext();

  if (data) {
    if (subAction == "branches") {
        return <LocalBranchesNavPage apiResponse={data} repository={props.repository}/>
    }
    if (subAction == "new_branch") {
      return <NewBranchNavPage apiResponse={data} repository={props.repository}/>
    }

    if (subAction == "edit_branch") {
      return <EditBranchNavPage apiResponse={data} repository={props.repository}/>
    }

    if (subAction == "write_commit") {
      return <WriteCommitNavPage apiResponse={data} repository={props.repository}/>
    }

    if (subAction == "source_graph") {
      return <SourceGraphNav apiResponse={data} repository={props.repository}/>
    }
  }
  if (data?.repoState.commandMode == "view") {
    return <LocalVCSViewMode apiResponse={data} repository={props.repository} />;
  }

  if (data?.repoState.commandMode == "compare") {
    if (data?.repoState?.comparison?.against == "merge") {
    return <LocalVCSCompareMergeMode apiResponse={data} repository={props.repository} />;
    }
    return <LocalVCSCompareMode apiResponse={data} repository={props.repository} />;
  }

  if (data?.repoState.commandMode == "edit") {
    return <LocalVCSEditMode apiResponse={data} repository={props.repository} />;
  }
  return null;
};

export default React.memo(LocalVCSNavController);