import React, { useMemo } from 'react'
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import HeartLight from '@floro/common-assets/assets/images/icons/heart.light.svg';
import HeartDark from '@floro/common-assets/assets/images/icons/heart.dark.svg';
import HeartedLight from '@floro/common-assets/assets/images/icons/hearted.light.svg';
import HeartedDark from '@floro/common-assets/assets/images/icons/hearted.dark.svg';
import Button from '../../design-system/Button';

const OuterContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    width: 100%;
`

const Container = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    user-select: none;
`;

const TextContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 0;
`;

const FollowerIcon = styled.img`
    width: 20px;
    margin-left: 2px;
    margin-right: 10px;
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
  isFollowing: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
}

const OrgFollowerTab = (props: Props): React.ReactElement => {
    const theme = useTheme();
    const heartIcon = useMemo(() => {
        if (props.isFollowing) {

            if (theme.name == 'light') {
                return HeartedLight;
            }
            return HeartedDark;
        }
        if (theme.name == 'light') {
            return HeartLight;
        }
        return HeartDark;
    }, [theme.name, props.isFollowing]);

    const followerCount = useMemo(() => accountRound(props.followerCount), [props.followerCount]);

  return (
    <OuterContainer>
        <Container>
            <FollowerIcon src={heartIcon}/>
            <TextContainer>
                <FollowerText style={{marginRight: 8}}>Followers <FollowerNumeral>{followerCount}</FollowerNumeral></FollowerText>
            </TextContainer>
        </Container>
        <Button isLoading={props.isLoading ?? false} isDisabled={props.isDisabled ?? false} size='extra-small' label={props.isFollowing ? 'unfollow' : 'follow'} bg={'orange'}/>
    </OuterContainer>
  );
};

export default React.memo(OrgFollowerTab);