import React, { useMemo } from 'react'
import styled from '@emotion/styled';
import ColorPalette from '@floro/styles/ColorPalette';

const Container = styled.div`
    border-radius: 50%;
    background-color: ${ColorPalette.orange};
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
  firstName: string;
  lastName: string;
}

const findFirstChar = (str: string) => {
    for (let i = 0; i < str.length; ++i) {
        if (/[A-z]/.test(str[i])) return str[i].toUpperCase();
    }
    return str?.[0] ?? "";
}

const InitialProfileDefault = (props: Props): React.ReactElement => {
  const firstChar = useMemo(
    () => findFirstChar(props.firstName),
    [props?.firstName]
  );
  const lastChar = useMemo(
    () => findFirstChar(props.lastName),
    [props?.lastName]
  );

  const fontSize = useMemo(() => `${props.size/36}rem`,[props.size]);

  return (
    <Container style={{height: props.size, width: props.size}}>
      <LetterContainer>
        <Char style={{fontSize}}>{firstChar}</Char>
        <Char style={{fontSize}}>{lastChar}</Char>
      </LetterContainer>
    </Container>
  );
};

export default React.memo(InitialProfileDefault);