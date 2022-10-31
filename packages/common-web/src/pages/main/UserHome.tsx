import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet';
import { useFetchSessionQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { useRedirect } from '../../ssr/RedirectProvider';
import SubPageLoader from '@floro/storybook/stories/common-components/SubPageLoader';

function UserHome() {
  const { data, loading } = useFetchSessionQuery();
  const redirect = useRedirect();


  if (!data?.session && !loading) {
    return redirect("/");
  }

  if (loading) {
    return <SubPageLoader/>
  }

  return (
    <div>
      <Helmet>
        <title>{"User Home"}</title>
      </Helmet>
      <p>{"User Home"}</p>
    </div>
  );
}

export default UserHome;