import React, { useMemo } from 'react'
import styled from '@emotion/styled';
import InitialProfileDefault from '../InitialProfileDefault';
import ColorPalette from '@floro/styles/ColorPalette';

const Container = styled.div`
    width: 263px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Fullname = styled.p`
    font-family: "MavenPro";
    font-size: 1.44rem;
    font-weight: 600;
    text-align: center;
    color: ${props => props.theme.colors.profileInfoNameTextColor};
    padding: 0;
    margin: 24px 0 12px 0;
`;

const Username = styled.p`
    font-family: "MavenPro";
    font-size: 1.2rem;
    font-weight: 600;
    text-align: center;
    color: ${props => props.theme.colors.profileInfoUsernameTextColor};
    padding: 0;
    margin: 0 0 24px 0;
`;



const upcaseFirst = (str: string) => {
    const rest = str.substring(1);
    return (str?.[0]?.toUpperCase() ?? "") + rest;
}

export interface Props {
    firstName: string;
    lastName: string;
    username: string;
}

const ProfileInfo = (props: Props): React.ReactElement => {
    const firstName = useMemo(() => upcaseFirst(props.firstName), [props.firstName]);
    const lastName = useMemo(() => upcaseFirst(props.lastName), [props.lastName]);
    const fullname = useMemo(() => firstName + ' ' + lastName, [firstName, lastName]);
    const username = useMemo(() => '@' + props.username, [props.username]);
  return (
    <Container>
        <InitialProfileDefault
            firstName={props.firstName}
            lastName={props.lastName}
            size={168}
        />
        <Fullname>
            {fullname}
        </Fullname>
        <Username>
            {username}
        </Username>
    </Container>
  );
};

export default React.memo(ProfileInfo);