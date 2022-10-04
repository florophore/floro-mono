import React, { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom';
import { useSubmitOAuthCodeQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import SubPageLoader from '@floro/storybook/stories/common-components/SubPageLoader';


const OAuthCallback = (): React.ReactElement => {
    const params = useParams<{provider: 'github'|'google'}>();
    const [searchParams] = useSearchParams();
    const error = searchParams.get('error');
    const code = searchParams.get('code') as string;

  const { data, error: graphqlError}  = useSubmitOAuthCodeQuery({
    variables: {
      provider: params.provider as string,
      code
    },
    ssr: false
  });

  useEffect(() => {
    if (error) {
      window.OAuthAPI.sendResult(false, params?.provider);
      return;
    }

    if (graphqlError) {
      // update this to include error
      window.OAuthAPI.sendResult(false, params?.provider);
      return;
    }

    if (data?.submitOAuthForAction) {
        console.log(data?.submitOAuthForAction);
       window.OAuthAPI.sendResult(true, params?.provider, data?.submitOAuthForAction);
       return;
    }

  }, [data, error, graphqlError]);

  return (
    <SubPageLoader/>
  );
}

export default OAuthCallback;