import { createContext, useState, useContext } from "react";

interface ILocalVCSNavContext {
    subAction: null|"branches"|"edit_branch"|"new_branch"|"write_commit"|"select_comparison_sha"|"source_graph";
    setSubAction: React.Dispatch<React.SetStateAction<ILocalVCSNavContext["subAction"]>>;

    compareFrom: "before"|"after";
    setCompareFrom: React.Dispatch<React.SetStateAction<ILocalVCSNavContext["compareFrom"]>>;
    showLocalSettings: boolean;
    setShowLocalSettings: React.Dispatch<React.SetStateAction<ILocalVCSNavContext["showLocalSettings"]>>;
    isStashing: boolean;
    setIsStashing: React.Dispatch<React.SetStateAction<ILocalVCSNavContext["isStashing"]>>;
}

const LocalVCSNavContext = createContext({
    setSubAction: (_: ILocalVCSNavContext["subAction"]) => {
        //void
    },
    compareFrom: "before",
    setCompareFrom: (_: ILocalVCSNavContext["compareFrom"]) => {
        //void
    },
    showLocalSettings: false,
    setShowLocalSettings: (_: ILocalVCSNavContext["showLocalSettings"]) => {
        //void
    },
    isStashing: false,
    setIsStashing: (_: ILocalVCSNavContext["isStashing"]) => {
        //void
    },
} as ILocalVCSNavContext);

interface Props {
    children: React.ReactElement;
}

export const LocalVCSNavProvider = (props: Props) => {
    const [subAction, setSubAction] = useState<ILocalVCSNavContext["subAction"]>(null);
    const [compareFrom, setCompareFrom] = useState<ILocalVCSNavContext["compareFrom"]>("before");
    const [showLocalSettings, setShowLocalSettings] = useState<ILocalVCSNavContext["showLocalSettings"]>(false);
    const [isStashing, setIsStashing] = useState<ILocalVCSNavContext["isStashing"]>(false);

    const value: ILocalVCSNavContext = {
      subAction,
      setSubAction,
      compareFrom,
      setCompareFrom,
      showLocalSettings,
      setShowLocalSettings,
      isStashing,
      setIsStashing
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