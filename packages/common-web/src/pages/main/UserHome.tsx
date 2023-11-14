import { useMemo } from 'react'
import { Helmet } from 'react-helmet';
import { useTheme} from "@emotion/react";
import { useFetchSessionQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { useRedirect } from '../../ssr/RedirectProvider';
import SubPageLoader from '@floro/storybook/stories/common-components/SubPageLoader';
import { useFloroPalette } from '../../floro_listener/FloroPaletteProvider';
import { useIsDebugMode } from '../../floro_listener/FloroDebugProvider';
import { useFloroIcons } from '../../floro_listener/FloroIconsProvider';
import { getIcon } from '@floro/common-generators/floro_modules/icon-generator';

function UserHome() {
  const { data, loading } = useFetchSessionQuery();
  const redirect = useRedirect();
  const theme = useTheme();

  //if (!data?.session && !loading) {
  //  return redirect("/");
  //}

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