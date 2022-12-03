import React, { useMemo } from 'react'
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import FollowersIconsLight from '@floro/common-assets/assets/images/icons/followers.light.svg';
import FollowersIconsDark from '@floro/common-assets/assets/images/icons/followers.dark.svg';

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

const FollowerIcon = styled.img`
    width: 24px;
    margin-right: 8px;
`;

const FollowerText = styled.p`
    font-size: 0.9rem;
    font-family: "MavenPro";
    font-weight: 600;
    color: ${props => props.theme.colors.followerTextColor};
`;

const FollowerNumeral = styled.span`
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
  followerCount: number;
  followingCount: number;
}

const FollowerInfo = (props: Props): React.ReactElement => {
    const theme = useTheme();
    const followersIcon = useMemo(() => {
        if (theme.name == 'light') {
            return FollowersIconsLight;
        }
        return FollowersIconsDark;
    }, [theme.name]);

    const followerCount = useMemo(() => accountRound(props.followerCount), [props.followerCount]);
    const followingCount = useMemo(() => accountRound(props.followingCount), [props.followingCount]);

  return (
    <Container>
        <FollowerIcon src={followersIcon}/>
        <TextContainer>
            <FollowerText style={{marginRight: 8}}>Followers <FollowerNumeral>{followerCount}</FollowerNumeral></FollowerText>
            <FollowerText>Following <FollowerNumeral>{followingCount}</FollowerNumeral></FollowerText>
        </TextContainer>
    </Container>
  );
};

export default React.memo(FollowerInfo);