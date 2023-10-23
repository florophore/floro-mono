import React, {useEffect} from 'react';
import styled from "@emotion/styled";
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import UserProfile from '@floro/common-react/src/components/userhome/UserProfile';
import {useSession} from '@floro/common-react/src/session/session-context';
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import Cookies from 'js-cookie';
import { useUserByUseranmeQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import LoadingPage from '../loader/LoadingPage';
import DotsLoader from '@floro/storybook/stories/design-system/DotsLoader';


const NotFoundContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: center;
  justify-content: center;
  align-items: center;
`;

const NotFoundTextWrapper = styled.div`
  width: 50%;
  max-width: 450px;
  flex-direction: center;
  justify-content: center;
`;

const NotFoundText = styled.h3`
  font-weight: 600;
  font-size: 2.5rem;
  font-family: "MavenPro";
  text-align: center;
  color: ${(props) => props.theme.colors.contrastText};
`;

const UserProfilePage = () => {
  const {currentUser} = useSession();
  const navigate = useNavigate();
  const params = useParams();
  const handle = params?.['handle'] ?? '';
  const title = useLinkTitle(
    {
      value: '/user/@/' + handle,
      label: '@' + handle,
    },
    [handle],
  );

  const {data, loading} = useUserByUseranmeQuery({
    variables: {
      username: handle
    },
    fetchPolicy: 'cache-and-network'
  });

  useNavigationAnimator({
    dashboardView: true,
    outerNavTab: null,
    innerNavTab: 'home',
  });

  useEffect(() => {
    if (currentUser?.username != null && handle?.toLowerCase() == currentUser?.username?.toLowerCase()) {
      navigate('/home', { replace: true});
    }
  }, [currentUser, handle]);

  return (
    <OuterNavigator outerNavTab={null} page={'profile'} title={title}>
      <>
        {loading && (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <DotsLoader color={'purple'} size={'large'}/>
          </div>
        )}
        {!loading && !data?.userByUsername?.id && (
          <NotFoundContainer>
            <NotFoundTextWrapper>
              <NotFoundText>{'user not found'}</NotFoundText>
            </NotFoundTextWrapper>
          </NotFoundContainer>
        )}
        {!loading && data?.userByUsername?.id && (
          <UserProfile user={data?.userByUsername}/>
        )}
      </>
    </OuterNavigator>
  );
};

export default React.memo(UserProfilePage);