import { createContext, useState, useContext } from "react";

interface IMergeRequestNavContext {
    isEditting: boolean;
    setIsEditting: (isEditting: boolean) => void;
}

const MergeRequestNavContext = createContext({
    isEditting: false,
    setIsEditting: (isEditting: boolean) => {}

} as IMergeRequestNavContext);

interface Props {
    children: React.ReactElement;
}

export const MergeRequestNavProvider = (props: Props) => {
    const [isEditting, setIsEditting] = useState<IMergeRequestNavContext["isEditting"]>(false);

    const value: IMergeRequestNavContext = {
      isEditting,
      setIsEditting,
    };
    return (
        <MergeRequestNavContext.Provider value={value}>
            {props.children}
        </MergeRequestNavContext.Provider>
    )
}

export const useMergeRequestNavContext = () => {
    return useContext(MergeRequestNavContext);
}