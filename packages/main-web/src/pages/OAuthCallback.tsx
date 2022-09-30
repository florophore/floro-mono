import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom';
import styled from '@emotion/styled';
import FloroIcon from '../assets/images/floro_logo.svg';
import DotsLoader from '@floro/storybook/stories/DotsLoader';
import { useSubmitOAuthCodeQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { Helmet } from 'react-helmet';


const BackgroundWrapper = styled.div`
  background-color: ${props => props.theme.background};
  display: flex;
  flex: 1;
  height: 100vh;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const  FloroImage = styled.img`
  max-width: 200px;
  width: 100%;
  margin-bottom: 48px;
`


function OAuthCallback() {
    const params = useParams<{provider: 'github'|'google'}>();
    const [searchParams] = useSearchParams();
    const error = searchParams.get('error');
    const code = searchParams.get('code');

  const { data, error: graphqlError}  = useSubmitOAuthCodeQuery({
    variables: {
      provider: params.provider,
      code
    },
    ssr: false
  });

  useEffect(() => {
    if (error) {
      window.OAuthAPI.sendResult(false, params?.provider);
      return;
    }

    if (data?.submitOAuthForAction) {
        console.log(data?.submitOAuthForAction);
       window.OAuthAPI.sendResult(true, params?.provider, code);
       return;
    }

    if (graphqlError) {
      // update this to include error
      window.OAuthAPI.sendResult(false, params?.provider);
      return;
    }
  }, [data, error, graphqlError]);

  return (
    <BackgroundWrapper>
      <Helmet>
        <title>{'Authorizing...'}</title>
      </Helmet>
      <FloroImage
        src={FloroIcon}
      />
      <DotsLoader size={"large"} color={"purple"}/>
    </BackgroundWrapper>
  );
}

export default OAuthCallback;