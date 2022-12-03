import React, { useMemo } from 'react'
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import MembersIconLight from '@floro/common-assets/assets/images/icons/members.light.svg';
import MembersIconDark from '@floro/common-assets/assets/images/icons/members.dark.svg';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    width: 100%;
`;

const TextContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 0;
`;

const MemberIcon = styled.img`
    width: 24px;
    margin-right: 8px;
`;

const MemberText = styled.p`
    font-size: 0.9rem;
    font-family: "MavenPro";
    font-weight: 600;
    color: ${props => props.theme.colors.followerTextColor};
`;

const MemberNumeral = styled.span`
    font-weight: 400;
`;

const accountRound = (count: number): string => {
    if (count >= 1000) {
        return Math.floor(count/1000) + "K";
    }

    if (count >= 1000) {
        return Math.floor(count/1000) + "K";
    }
    return count.toString();
};

export interface Props {
  membersCount: number;
  invitedCount: number;
}

const MembersInfoTab = (props: Props): React.ReactElement => {
    const theme = useTheme();
    const membersIcon = useMemo(() => {
        if (theme.name == 'light') {
            return MembersIconLight;
        }
        return MembersIconDark;
    }, [theme.name]);

    const memberCount = useMemo(() => accountRound(props.membersCount), [props.membersCount]);
    const invitedCount = useMemo(() => accountRound(props.invitedCount), [props.invitedCount]);

  return (
    <Container>
        <MemberIcon src={membersIcon}/>
        <TextContainer>
            <MemberText style={{marginRight: 8}}>Members <MemberNumeral>{memberCount}</MemberNumeral></MemberText>
            <MemberText>Invited <MemberNumeral>{invitedCount}</MemberNumeral></MemberText>
        </TextContainer>
    </Container>
  );
};

export default React.memo(MembersInfoTab);