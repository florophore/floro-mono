import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useFetchEmailAuthQuery } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import SubPageLoader from "@floro/storybook/stories/common-components/SubPageLoader";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { protectedTrpc } from "../../../trpc";

const CredentialAuthCallback = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const authCode: string | null = searchParams.get("authorization_code");

  const { data, error, loading } = useFetchEmailAuthQuery({
    variables: {
      authCode
    }
  });
  console.log(data?.fetchEmailAuth, error, loading)
  //const login = protectedTrpc.useMutation('login');
  //console.log("LOGIN", login);


  if (!authCode) {
    return (
      <SubPageLoader hideLoad>
        <div style={{marginTop: 24}}>
            <WarningLabel label="Invalid authorization code" size={"large"} />
        </div>
      </SubPageLoader>
    );
  }
  return <SubPageLoader/>;
};

export default CredentialAuthCallback;