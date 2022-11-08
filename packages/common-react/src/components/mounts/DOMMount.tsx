import React from "react";
import { NavigationAnimatorProvider } from '../../navigation/navigation-animator';
import { useTheme } from '@emotion/react';

export interface Props {
  children: React.ReactElement;
}
const DOMMount = (props: Props) => {
  const theme = useTheme();
  return (
    <NavigationAnimatorProvider>
      {props?.children}
    </NavigationAnimatorProvider>
  );
};

export default React.memo(DOMMount);
