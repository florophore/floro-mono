import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from 'axios';
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { useCurrentRepoState } from './hooks/local-hooks';
import DotsLoader from '@floro/storybook/stories/design-system/DotsLoader';
import LocalRepoSubHeader from './LocalRepoSubHeader';
import HomeRead from '../home/HomeRead';
import HomeWrite from '../home/HomeWrite';


const LoadingContainer = styled.div`
  display: flex;
  flex-stretch: 1;
  flex: 1;
  justify-content: center;
  align-items: center;
  height: 100%;
  height: 100%;
`;


interface Props {
    repository: Repository;
    plugin?: string;
}

const LocalRepoController = (props: Props) => {
    const theme = useTheme();
    const loaderColor = useMemo(() => theme.name == "light" ? "purple" : "lightPurple",[theme.name])
    const { data } = useCurrentRepoState(props.repository);

    return (
        <>
        {!data && (
            <LoadingContainer>
                <DotsLoader color={loaderColor} size={'large'}/>
            </LoadingContainer>
        )}
        {data && (
            <>
                <LocalRepoSubHeader repository={props.repository}/>
                {props.plugin == "home" && data?.repoState?.commandMode == "view" && (
                    <HomeRead repository={props.repository} apiResponse={data}/>
                )}
                {props.plugin == "home" && data?.repoState?.commandMode == "edit" && (
                    <HomeWrite repository={props.repository} apiResponse={data}/>
                )}
            </>
        )}
        </>
    );
};

export default React.memo(LocalRepoController);