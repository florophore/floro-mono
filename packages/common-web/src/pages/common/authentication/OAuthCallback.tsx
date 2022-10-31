import React, { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom';
import { CompleteSignupAction, PassedLoginAction, useSubmitOAuthCodeQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import SubPageLoader from '@floro/storybook/stories/common-components/SubPageLoader';
import { useMutation } from 'react-query';
import axios from 'axios';
import { setClientSession } from '@floro/common-react/src/session/client-session';
import WarningLabel from '@floro/storybook/stories/design-system/WarningLabel';


const OAuthCallback = (): React.ReactElement => {
    const params = useParams<{provider: 'github'|'google'}>();
    const [searchParams] = useSearchParams();
    const error = searchParams.get('error');
    const code = searchParams.get('code') as string;

  const { data, error: graphqlError}  = useSubmitOAuthCodeQuery({
    variables: {
      provider: params.provider as string,
      code,
      loginClient: 'desktop'
    },
    ssr: false
  });

  const completeSignupMutation = useMutation(async (completeSignupInfo: CompleteSignupAction) => {
     try {
      await axios.post('http://localhost:63403/complete_signup', completeSignupInfo);
      return true;
     } catch(e) {
      return false;
     }
  });

  const loginMutation = useMutation(async (loginInfo: PassedLoginAction) => {
     try {
      setClientSession(loginInfo);
      await axios.post('http://localhost:63403/login', loginInfo);
      return true;
     } catch(e) {
      return false;
     }
  });

  useEffect(() => {
    if (data?.submitOAuthForAction?.type == "COMPLETE_SIGNUP") {
      completeSignupMutation.mutate(data?.submitOAuthForAction?.action as CompleteSignupAction);
    }
    if (data?.submitOAuthForAction?.type == "LOGIN") {
      loginMutation.mutate(data?.submitOAuthForAction?.action as PassedLoginAction);
    }
  }, [data?.submitOAuthForAction]);

  if (graphqlError) {
    return (
      <SubPageLoader hideLoad>
        <div style={{ marginTop: 24 }}>
          <WarningLabel label="Server Error" size={"large"} />
        </div>
      </SubPageLoader>
    );
  }

  if (error) {
    return (
      <SubPageLoader hideLoad>
        <div style={{ marginTop: 24 }}>
          <WarningLabel label="Authorization Code Error" size={"large"} />
        </div>
      </SubPageLoader>
    );
  }

  return (
    <SubPageLoader/>
  );
}

export default OAuthCallback;