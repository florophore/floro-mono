import { useMemo } from "react";
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useFloroPalette } from '../../floro_listener/FloroPaletteProvider';
import { useIsDebugMode } from '../../floro_listener/FloroDebugProvider';
import { useFloroIcons } from '../../floro_listener/FloroIconsProvider';
import { getIcon } from '@floro/common-generators/floro_modules/icon-generator';
import { useTheme} from "@emotion/react";

function Home() {

  const theme = useTheme();

  const palette = useFloroPalette();
  const icons = useFloroIcons();
  const isDebugMode = useIsDebugMode();
  const icon = useMemo(() => {
    return getIcon(icons, theme.name as "light"|"dark", "main.discard", "hovered");
  }, [theme.name, icons])
  return (
    <div>
        <Helmet>
          <title>{'Floro'}</title>
        </Helmet>
        <p>
            {'Home'}
        </p>
        <Link to={'/about'}>Go to About</Link>
        <p>Testing the waters</p>
      <div style={{width: 100, background: palette.purple.light ?? 'transparent'}}>
        {isDebugMode ? 'debug': 'normal'}
        <img style={{width: 100, height: 100}} src={icon}/>
      </div>
    </div>
  )
}

export default Home;