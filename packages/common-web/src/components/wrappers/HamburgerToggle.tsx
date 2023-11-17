import React, { useMemo, useCallback} from "react";
import styled from "@emotion/styled";
import {  useIcon } from '../../floro_listener/FloroIconsProvider';
import { useRichText } from "../../floro_listener/hooks/locales";
import Button from "@floro/storybook/stories/design-system/Button";
import { Link } from "react-router-dom";
import ColorPalette from "@floro/styles/ColorPalette";

const Bar = styled.div`
  background: ${props => props.theme.colors.contrastText};
  width: 100%;
  height: 3px;
  border-radius: 6px;
  position: absolute;
  transition: opacity 200ms, transform 200ms;
`;

interface Props {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}


const HamburgerToggle = (props: Props) => {

  const size = 24;

  const onToggle = useCallback(() => {
    props?.setIsOpen?.(!props.isOpen);
  }, [props?.isOpen, props?.setIsOpen]);

  return (
    <div onClick={onToggle} style={{height: size, width: size * 1.1, position: 'relative', cursor: 'pointer'}}>
        <Bar style={{top: 0, transform: `translate(0px, ${props.isOpen ? '10px' : '0px'}) rotate(${props.isOpen ? '-45deg' : '0deg'})`}}/>
        <Bar style={{transform: ` translate(0px, 10px) rotate(${props.isOpen ? '45deg' : '0deg'})`}}/>
        <Bar style={{transform: `translate(0px, 10px) rotate(${props.isOpen ? '-45deg' : '0deg'})`}}/>
        <Bar style={{transform: `translate(0px, ${props.isOpen ? '10px' : '20px'}) rotate(${props.isOpen ? '45deg' : '0deg'})`}}/>
    </div>
  );
}

export default React.memo(HamburgerToggle);