import { useMemo, useState, useCallback } from "react";
import { Link } from 'react-router-dom';
import styled from "@emotion/styled";
import { Helmet } from 'react-helmet';
import { useFloroPalette } from '../../floro_listener/FloroPaletteProvider';
import { useFloroIcons } from '../../floro_listener/FloroIconsProvider';
import { getIcon } from '@floro/common-generators/floro_modules/icon-generator';
import { useTheme} from "@emotion/react";
import { useLocales, usePlainText, useRichText } from "../../floro_listener/hooks/locales";
import { useTodo } from "../../floro_listener/FloroTodoProvider";

const HomeWrapper = styled.div`
  height: 100%;
  @media screen and (min-width: 1024px) {
    background: blue;
  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    background: green;
  }
  @media screen and (max-width: 767px){
    background: red;
  }
`;

function Home() {

  const theme = useTheme();

  return (
    <HomeWrapper>
      <p style={{fontSize: '1.2rem'}}>
        {'hello world'}
      </p>
    </HomeWrapper>
  )
}

export default Home;