import { createContext, useState, useContext } from "react";

interface ILocalVCSNavContext {
    subAction: null|"branches"|"edit_branch"|"new_branch";
    setSubAction: React.Dispatch<React.SetStateAction<ILocalVCSNavContext["subAction"]>>;
}

const LocalVCSNavContext = createContext({
    setSubAction: (_: ILocalVCSNavContext["subAction"]) => {
        //void
    }

} as ILocalVCSNavContext);

interface Props {
    children: React.ReactElement;
}

export const LocalVCSNavProvider = (props: Props) => {
    const [subAction, setSubAction] = useState<ILocalVCSNavContext["subAction"]>(null);

    const value: ILocalVCSNavContext = {
      subAction,
      setSubAction,
    };
    return (
        <LocalVCSNavContext.Provider value={value}>
            {props.children}
        </LocalVCSNavContext.Provider>
    )
}

export const useLocalVCSNavContext = () => {
    return useContext(LocalVCSNavContext);
}