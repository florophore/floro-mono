import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from 'axios';
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { useCurrentRepoState, useUpdateCurrentCommand } from './hooks/local-hooks';
import DotsLoader from '@floro/storybook/stories/design-system/DotsLoader';
import Button from '@floro/storybook/stories/design-system/Button';


const Container = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    width: 100%;
    height: 72px;
    border-bottom: 1px solid ${props => props.theme.colors.localRemoteBorderColor};
    box-sizing: border-box;
    padding-left: 40px;
    padding-right: 40px;
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

    return (
        <>
        {repoData?.repoState?.commandMode == "view" &&
            <Container>
                <div style={{height: '100%', width: 72}}></div>
                <Button label={"edit"} bg={'orange'} size={'small'} onClick={updateToEditMode}/>
            </Container>
        }
        {repoData?.repoState?.commandMode == "edit" &&
            <Container>
                <div style={{height: '100%', width: 72}}></div>
                <Button label={"preview"} bg={'purple'} size={'small'} onClick={updateToViewMode}/>
            </Container>
        }
        </>
    );
};

export default React.memo(LocalRepoSubHeader);