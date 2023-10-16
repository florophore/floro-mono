import { useMemo, useState, useCallback } from "react";
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useFloroPalette } from '../../floro_listener/FloroPaletteProvider';
import { useIsDebugMode } from '../../floro_listener/FloroDebugProvider';
import { useFloroIcons } from '../../floro_listener/FloroIconsProvider';
import { getIcon } from '@floro/common-generators/floro_modules/icon-generator';
import { useTheme} from "@emotion/react";
import { useFloroText } from "../../floro_listener/FloroTextProvider";
import { getDebugInfo, getPhraseValue } from "@floro/common-generators/floro_modules/text-generator";
import { renderers } from "../../floro_listener/FloroTextRenderer";
import { renderers as plainTextRenderers } from "../../floro_listener/FloroPlainTextRenderer";
import { useLocales, usePlainText, useRichText } from "../../floro_listener/hooks/locales";

function Home() {

  const theme = useTheme();

  const palette = useFloroPalette();
  const icons = useFloroIcons();
  const [username, setUsername] = useState("jamie");
  const icon = useMemo(() => {
    return getIcon(icons, theme.name as "light"|"dark", "main.discard", "hovered");
  }, [theme.name, icons])

  const { selectedLocaleCode, setSelectedLocaleCode} = useLocales();

  const rt = useRichText("main.new_phrase", {username})
  const pt = usePlainText("main.new_phrase", {username})

  const onChange = useCallback((event) => {
    setUsername(event.target.value);
  }, []);
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
        {selectedLocaleCode == "EN" && (
          <button onClick={() => setSelectedLocaleCode("ES")}>{"ES"}</button>
        )}
        {selectedLocaleCode == "ES" && (
          <button onClick={() => setSelectedLocaleCode("EN")}>{"EN"}</button>
        )}
        <p></p>
        <input type="text" onChange={onChange} value={username}/>
      <div style={{width: 100, background: palette.purple.light ?? 'transparent'}}>
        <img style={{width: 100, height: 100}} src={icon}/>
      </div>
      <div style={{fontFamily: 'Helvetica'}}>
        {rt}
      </div>
      <h1>{'plain text'}</h1>
      <div style={{fontFamily: 'Helvetica'}}>
        <pre>
          {pt}
        </pre>
      </div>
    </div>
  )
}

export default Home;