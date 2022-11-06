import React, {
  useMemo,
  useCallback,
  useRef,
  useImperativeHandle,
  useState
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import SearchIconPlaceholderLight from '@floro/common-assets/assets/images/icons/search_glass_placeholder.light.svg';
import SearchIconPlaceholderDark from '@floro/common-assets/assets/images/icons/search_glass_placeholder.dark.svg';
import SearchIconActiveLight from '@floro/common-assets/assets/images/icons/search_glass_active.light.svg';
import SearchIconActiveDark from '@floro/common-assets/assets/images/icons/search_glass_active.dark.svg';

export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  borderColor?: string;
  placeholder: string;
  onTextChanged: (text: string) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  tabIndex?: number;
}

const Container = styled.div`
  position: relative;
  height: 48px;
  width: 400px;
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  transition: 500ms border-color;
  cursor: pointer;
`;

const IconContainer =styled.div`
    position: absolute;
    left: 0;
    top: 0;
    height: 48px;
    width: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
`; 
const Icon = styled.img`
  width: 24px;
`;

const InputElement = styled.input`
  position: relative;
  width: calc(100% - 48px);
  background: ${(props) => props.theme.background};
  box-sizing: border-box;
  top: 6px;
  left: 48px;
  height: 32px;
  border: none;
  outline: none;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  padding: 0 16px 0 0;
  color: ${(props) => props.theme.colors.inputEntryTextColor};
  ::placeholder {
    color: ${(props) => props.theme.colors.inputPlaceholderTextColor};
  }
  /* clears the ‘X’ from Internet Explorer */
  ::-ms-clear {
    display: none;
    width: 0;
    height: 0;
  }
  ::-ms-reveal {
    display: none;
    width: 0;
    height: 0;
  }
  /* clears the ‘X’ from Chrome */
  ::-webkit-search-decoration,
  ::-webkit-search-cancel-button,
  ::-webkit-search-results-button,
  ::-webkit-search-results-decoration {
    display: none;
  }
`;

const SearchInput = React.forwardRef(
  (
    {
      value,
      borderColor = ColorPalette.purple,
      onTextChanged,
      onFocus,
      onBlur,
      placeholder,
      ...rest
    }: Props,
    ref: React.ForwardedRef<HTMLInputElement | null>
  ): React.ReactElement => {
    const theme = useTheme();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const isActive = useMemo(() => (value?.length ?? 0) > 0 || isFocused, [isFocused, value]);

    const icon = useMemo(() => {
        if (theme.name == 'light') {
            return isActive ? SearchIconActiveLight : SearchIconPlaceholderLight;
        }

        return isActive ? SearchIconActiveDark : SearchIconPlaceholderDark;
    }, [isActive, theme.name])

    useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(
      ref,
      () => inputRef.current
    );

    const onClickContainer = useCallback(() => {
      inputRef?.current?.focus?.();
    }, []);

    const onInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onTextChanged(event.target.value);
      },
      [onTextChanged]
    );

    const onInputFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement, Element>): void => {
        setIsFocused(true);
        onFocus?.(event);
      },
      [onFocus]
    );

    const onInputBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement, Element>): void => {
        setIsFocused(false);
        onBlur?.(event);
      },
      [onBlur]
    );

    return (
      <Container
        onClick={onClickContainer}
        style={{ border: `2px solid ${borderColor}` }}
      >
        <IconContainer>
            <Icon src={icon}/>
        </IconContainer>
        <InputElement
          value={value}
          ref={inputRef}
          onChange={onInputChange}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          placeholder={placeholder}
          spellCheck={'false'}
          type={'search'}
          {...rest}
        />
      </Container>
    );
  }
);

export default React.memo(SearchInput);