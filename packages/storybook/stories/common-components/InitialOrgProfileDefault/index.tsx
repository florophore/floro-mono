import React, { useMemo } from 'react'
import styled from '@emotion/styled';
import ColorPalette from '@floro/styles/ColorPalette';

const Container = styled.div`
    border-radius: 15%;
    background-color: ${ColorPalette.teal};
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    border: 2px solid ${ColorPalette.white};
`;

const LetterContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`;

const Char = styled.span`
    font-family: "MavenPro";
    color: ${ColorPalette.white};
    font-weight: 700;
`;

export interface Props {
  size: number;
  name: string;
}

const findFirstChar = (str: string) => {
    for (let i = 0; i < str.length; ++i) {
        if (/[A-z]/.test(str[i])) return str[i].toUpperCase(); 
    }
    return "";
}

const InitialOrgProfileDefault = (props: Props): React.ReactElement => {
  const char = useMemo(
    () => findFirstChar(props.name),
    [props?.name]
  );

  const fontSize = useMemo(() => `${props.size/36}rem`,[props.size]);

  return (
    <Container style={{height: props.size, width: props.size}}>
      <LetterContainer>
        <Char style={{fontSize}}>{char}</Char>
      </LetterContainer>
    </Container>
  );
};

export default React.memo(InitialOrgProfileDefault);