import { createContext, useState, useContext } from "react";

interface ILocalVCSNavContext {
    subAction: null|"branches"|"edit_branch"|"new_branch"|"write_commit"|"select_comparison_sha"|"source_graph";
    setSubAction: React.Dispatch<React.SetStateAction<ILocalVCSNavContext["subAction"]>>;

    compareFrom: "before"|"after";
    setCompareFrom: React.Dispatch<React.SetStateAction<ILocalVCSNavContext["compareFrom"]>>;
}

const LocalVCSNavContext = createContext({
    setSubAction: (_: ILocalVCSNavContext["subAction"]) => {
        //void
    },
    compareFrom: "before",
    setCompareFrom: (_: ILocalVCSNavContext["compareFrom"]) => {
        //void
    },

} as ILocalVCSNavContext);

interface Props {
    children: React.ReactElement;
}

export const LocalVCSNavProvider = (props: Props) => {
    const [subAction, setSubAction] = useState<ILocalVCSNavContext["subAction"]>(null);
    const [compareFrom, setCompareFrom] = useState<ILocalVCSNavContext["compareFrom"]>("before");

    const value: ILocalVCSNavContext = {
      subAction,
      setSubAction,
      compareFrom,
      setCompareFrom
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