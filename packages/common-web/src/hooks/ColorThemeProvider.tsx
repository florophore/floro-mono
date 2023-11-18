import Cookies from 'js-cookie';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';


const ColorThemeContext = createContext<{
    selectColorTheme: (themePreference: 'system'|'light'|'dark') => void;
    themePreference: 'system'|'light'|'dark';
}>({
    themePreference: 'system',
    selectColorTheme: (_themePreference: 'system'|'light'|'dark') => {}
});

interface Props {
    children: React.ReactElement;
    initThemePreference: string;
}

export const ColorThemeProvider = (props: Props): React.ReactElement => {

    console.log("T", props.initThemePreference)
    const [themePreference, setThemePreference] = useState<
      "system" | "light" | "dark"
    >(
      props.initThemePreference == "light"
        ? "light"
        : props.initThemePreference == "dark"
        ? "dark"
        : "system"
    );

    console.log("TP", themePreference);
    useEffect(() => {
        const localPreference = localStorage.get?.('theme-preference') ?? 'system';
        setThemePreference(localPreference);
    }, []);

    const selectColorTheme = useCallback((themePreference: 'system'|'light'|'dark') => {
        localStorage.set?.('theme-preference', themePreference);
        Cookies.set("theme-preference", themePreference);
        setThemePreference(themePreference);
    }, []);



    return (
        <ColorThemeContext.Provider value={{
            themePreference,
            selectColorTheme
        }}>
            {props.children}
        </ColorThemeContext.Provider>
    );
};

export const useColorTheme = () => {
    return useContext(ColorThemeContext);
};