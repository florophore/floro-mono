import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import styled from "@emotion/styled";
import Input from "../Input";
import DotsLoader from "../DotsLoader";
import DropdownArrowLight from "@floro/common-assets/assets/images/icons/dropdown_arrow.light.svg";
import DropdownArrowDark from "@floro/common-assets/assets/images/icons/dropdown_arrow.dark.svg";
import { useTheme } from "@emotion/react";

const Container = styled.div`
  position: relative;
  width: 436px;
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: 82px;
  display: inline-block;
  width: 100%;
  border-radius: 8px;
  box-sizing: border-box;
  z-index: 1;
  background: ${(props) => props.theme.background};
  box-shadow: ${(props) => `0px 4px 8px ${props.theme.shadows.outerDropdown}`};
`;
const InnerContainer = styled.div`
  max-height: 250px;
  width: 100%;
  border-radius: 8px;
  padding: 24px;
  box-sizing: border-box;
  box-shadow: ${(props) =>
    `inset 0 0 3px ${props.theme.shadows.innerDropdown}`};
  overflow-y: scroll;
  scroll-behavior: smooth;
`;

const OptionContainer = styled.div`
  height: 32px;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 12px;
  cursor: pointer;
`;

const OptionText = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.optionTextColor};
`;

const LoaderWrapper = styled.div`
  padding: 0px 12px;
  display: flex;
  justify-context: center;
  align-items: center;
  height: 100%;
  width: 48px;
`;

const DropdownIconWrapper = styled.div`
  height: 100%;
  width: 48px;
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const DropdownDivider = styled.div`
  height: 32px;
  width: 2px;
  border-radius: 2px;
  background: ${(props) => props.theme.colors.dropdownDividerColor};
`;

const ArrowContainer = styled.div`
  display: flex;
  height: 30px;
  width: 30px;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
`;

const Arrow = styled.img`
  width: 16px;
`;

const NoOptionContainer = styled.div`
  height: 32px;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 12px;
  text-align: center;
`;

const NoOptionText = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.optionTextColor};
  text-align: center;
  width: 100%;
`;

export interface OptionProps {
  isHighlighted: boolean;
}

export interface Option<T> {
  value: T;
  textValue?: string;
  searchValue?: string;
  label: string | ((props: OptionProps) => React.ReactElement);
}

export interface Props<T> {
  options: Option<T>[];
  label: string;
  value?: string|null;
  placeholder: string;
  isLoading?: boolean;
  isValid?: boolean;
  onTextChanged?: (text: string) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  onChange?: (option: Option<T> | null) => void;
  tabIndex?: number;
  filterInput?: boolean;
  isDropdown?: boolean;
}

const InputSelector = <T,>({
  value,
  label,
  onTextChanged,
  onFocus,
  onBlur,
  onChange,
  filterInput = true,
  isValid = true,
  isDropdown = true,
  isLoading,
  placeholder,
  ...rest
}: Props<T>) => {

  const initTextValue = useMemo(() => {
    if (!value) return "";
    const option = rest.options.find?.(option => option.value == value);
    if (!option) return "";
    if (typeof option.label == "string") {
      return option.label;
    }
    return option.textValue ?? "";
  }, [value, rest.options])

  const [text, setText] = useState(initTextValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isHoveringList, setIsHoveringList] = useState(false);
  const [isTapping, setIsTapping] = useState(false);
  const [disableHover, setDisableHover] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const theme = useTheme();
  const input = useRef(null);
  const optionContainer = useRef(null);

  const onFocusInput = useCallback(() => {
    setIsFocused(true);
    setText("");
    onChange?.(null);
  }, [onChange]);

  const onBlurInput = useCallback(() => {
    setIsFocused(false);
    setHighlightIndex(null);
  }, []);

  const onStartHoveringList = useCallback(() => {
    setIsHoveringList(true);
  }, []);

  const onStopHoveringList = useCallback(() => {
    setIsHoveringList(false);
  }, []);

  const onInputChanged = useCallback(
    (text) => {
    setHighlightIndex(null);
    setDisableHover(true);
      setText(text);
      onTextChanged?.(text);
    },
    [onTextChanged]
  );

  const showList = useMemo(
    () => isFocused || isHoveringList,
    [isFocused, isHoveringList]
  );

  const filteredOptions = useMemo(() => {
    if (!filterInput) {
      return options;
    }
    return rest.options.filter((option) => {
      if (typeof option.label == "string") {
        return (
          option?.label?.toLowerCase()?.indexOf(text.toLowerCase().trim()) !==
          -1
        );
      }
      return (
        option?.searchValue
          ?.toLowerCase()
          ?.indexOf?.(text.toLowerCase().trim()) !== -1
      );
    });
  }, [rest.options, filterInput, text]);

  const onSelect = useCallback(
    (option: Option<T>, index: number) => {
      setIsHoveringList(false);
      onChange?.(option);
      if (typeof option.label == "string") {
        setText(option.label);
      } else {
        setText(option.textValue ?? "");
      }
    },
    [filteredOptions, onChange]
  );

  const options = useMemo(() => {
    return filteredOptions.map((option, index) => {
      if (typeof option.label == "string") {
        return (
          <OptionContainer
            key={index}
            onMouseEnter={() => {
              if (disableHover) return;
              setHighlightIndex(index);
              setIsTapping(false);
            }}
            onClick={() => onSelect(option, index)}
            style={{
              ...(highlightIndex == index
                ? {
                    background: theme.colors.highlightedOptionBackgroundColor,
                  }
                : {}),
            }}
          >
            <OptionText>{option.label}</OptionText>
          </OptionContainer>
        );
      }
      return (
        <div
          key={index}
          onClick={() => onSelect(option, index)}
          onMouseEnter={() => {
            if (disableHover) return;
            setIsTapping(false);
          }}
        >
          {option.label({ isHightlighted: highlightIndex == index })}
        </div>
      );
    });
  }, [filteredOptions, onSelect, disableHover, highlightIndex, theme.name]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key == "ArrowDown") {
        event.preventDefault();
        event.stopPropagation();
        setIsTapping(true);
        setDisableHover(true);
        if (filteredOptions?.length > 0) {
          if (highlightIndex == null) {
            setHighlightIndex(0);
          } else {
            if (highlightIndex == filteredOptions?.length - 1) {
              setHighlightIndex(0);
            } else {
              setHighlightIndex(highlightIndex + 1);
            }
          }
        }
      }
      if (event.key == "ArrowUp") {
        event.preventDefault();
        event.stopPropagation();
        setIsTapping(true);
        setDisableHover(true);
        if (filteredOptions?.length > 0) {
          if (highlightIndex == null) {
            setHighlightIndex(filteredOptions?.length - 1);
          } else {
            if (highlightIndex == 0) {
              setHighlightIndex(filteredOptions?.length - 1);
            } else {
              setHighlightIndex(highlightIndex - 1);
            }
          }
        }
      }

      if (event.key == "Enter" && highlightIndex !== null) {
        event.preventDefault();
        event.stopPropagation();
        (input?.current as HTMLInputElement | null)?.blur?.();
        onSelect(filteredOptions[highlightIndex], highlightIndex);
      }
    },
    [highlightIndex, filteredOptions, onSelect]
  );

  const onReEnableHover = useCallback(() => {
    setDisableHover(false);
  }, []);

  const DropdownArrow = useMemo(() => {
    if (theme.name == "light") {
      return DropdownArrowLight;
    }
    return DropdownArrowDark;
  }, [theme.name]);

  const Loader = useMemo(() => {
    if (!isLoading) {
      return null;
    }
    return (
      <LoaderWrapper>
        <DotsLoader size="small" color="purple" />
      </LoaderWrapper>
    );
  }, [isLoading, theme.name]);

  const NoResults = useMemo(() => {
    if ((filteredOptions.length ?? 0) > 0) {
      return null;
    }
    return (
      <NoOptionContainer>
        <NoOptionText>{isLoading ? "Loading..." : "No results found..."}</NoOptionText>
      </NoOptionContainer>
    );
  }, [filteredOptions, theme.name, isLoading]);

  const RightElement = useMemo(() => {
    if (isDropdown) {
      return (
        <DropdownIconWrapper>
          <DropdownDivider />
          <ArrowContainer>
            <Arrow src={DropdownArrow} />
          </ArrowContainer>
        </DropdownIconWrapper>
      );
    }
    return Loader;
  }, [isDropdown, Loader, DropdownArrow, theme.name]);

  useEffect(() => {
    if (!isTapping) {
      return;
    }
    if (highlightIndex !== null) {
      const child = (optionContainer.current as HTMLDivElement | null)
        ?.children?.[highlightIndex];
      child?.scrollIntoView?.({block: "center", inline: "center"});
    }
  }, [highlightIndex, isTapping]);

  return (
    <div style={{ display: "flex" }}>
      <Container>
        <Input
          value={text}
          label={label}
          onTextChanged={onInputChanged}
          onFocus={onFocusInput}
          onBlur={onBlurInput}
          isValid={isValid}
          isLoading={isLoading}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          rightElement={RightElement}
          ref={input}
        />
        {showList && (
          <DropdownContainer
            onMouseEnter={onStartHoveringList}
            onMouseLeave={onStopHoveringList}
          >
            <InnerContainer onMouseMove={onReEnableHover} ref={optionContainer}>
              {options}
              {NoResults}
            </InnerContainer>
          </DropdownContainer>
        )}
      </Container>
    </div>
  );
};

export default React.memo(InputSelector);
