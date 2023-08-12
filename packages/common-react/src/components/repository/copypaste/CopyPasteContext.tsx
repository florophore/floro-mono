import { createContext, useState, useContext, useMemo } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useLocalReposInfos } from "../../../hooks/repos";
import { RepoInfo } from "floro/dist/src/repo";
import { useDaemonIsConnected } from "../../../pubsub/socket";
import { CopyInstructions } from "floro/dist/src/plugins";

interface SubContext {
  showCopyPaste: boolean;
  setShowCopyPaste: (show: boolean) => void;
  copyInstructions: CopyInstructions;
  setCopyInstructions: (copyInstructions: CopyInstructions) => void;
  isSelectMode: boolean;
  setIsSelectMode: (isSelectMode: boolean) => void;
  repoInfos: Array<RepoInfo>;
  isCopyEnabled: boolean;
  selectedRepoInfo: RepoInfo|null,
  setSelectedRepoInfo: (repoInfo: RepoInfo|null) => void,
}

interface ICopyPasteContext {
  local: SubContext;
  remote: SubContext;
}

const SubContextDefault: SubContext = {
  showCopyPaste: false,
  setShowCopyPaste: (_: boolean) => {},
  copyInstructions: {},
  setCopyInstructions: (_: CopyInstructions) => {},
  isSelectMode: false,
  setIsSelectMode: (_: boolean) => {},
  repoInfos: [],
  isCopyEnabled: false,
  selectedRepoInfo: null,
  setSelectedRepoInfo: (_: RepoInfo|null) => {},
};

const CopyPasteContext = createContext({
  local: SubContextDefault,
  remote: SubContextDefault,
} as ICopyPasteContext);

interface Props {
  children: React.ReactElement;
  repository: Repository;
}

declare type SubContextType<T> = {
  remote: T;
  local: T;
};

const defaultType = <T,>(t: T): SubContextType<T> => {
  return {
    remote: t,
    local: t,
  };
};

const currySetter = <T,>(
  client: "local" | "remote",
  subContext: SubContextType<T>,
  setter: (subContext: SubContextType<T>) => void
): ((t: T) => void) => {
  return (t: T) => {
    const next = { ...subContext, [client]: t };
    setter(next);
  };
};

export const CopyPasteProvider = (props: Props) => {
  const [showCopyPaste, setShowCopyPaste] = useState<
    SubContextType<SubContext["showCopyPaste"]>
  >(defaultType(false));
  const [isSelectMode, setIsSelectMode] = useState<
    SubContextType<SubContext["isSelectMode"]>
  >(defaultType(false));
  const [selectedRepoInfo, setSelectedRepoInfo] = useState<
    SubContextType<SubContext["selectedRepoInfo"]>
  >(defaultType(null));
  const [copyInstructions, setCopyInstructions] = useState<
    SubContextType<SubContext["copyInstructions"]>
  >(defaultType({}));
  const repoInfos = useLocalReposInfos();

  const isDaemonConnected = useDaemonIsConnected();
  const localRepoInfos = useMemo(() => {
    return repoInfos.filter((ri) => ri.id != props?.repository.id);
  }, [repoInfos, props.repository]);

  const local = useMemo((): SubContext => {
    return {
      showCopyPaste: showCopyPaste.local,
      setShowCopyPaste: currySetter("local", showCopyPaste, setShowCopyPaste),
      isSelectMode: isSelectMode.local,
      setIsSelectMode: currySetter("local", isSelectMode, setIsSelectMode),
      copyInstructions: copyInstructions.local,
      setCopyInstructions: currySetter("local", copyInstructions, setCopyInstructions),
      repoInfos: localRepoInfos,
      isCopyEnabled: (isDaemonConnected && localRepoInfos.length > 0) ?? false,
      selectedRepoInfo: selectedRepoInfo.local,
      setSelectedRepoInfo: currySetter("local", selectedRepoInfo, setSelectedRepoInfo)
    };
  }, [showCopyPaste, copyInstructions, isDaemonConnected, localRepoInfos, selectedRepoInfo, isSelectMode]);

  const remote = useMemo((): SubContext => {
    return {
      showCopyPaste: showCopyPaste.remote,
      setShowCopyPaste: currySetter("remote", showCopyPaste, setShowCopyPaste),
      isSelectMode: isSelectMode.remote,
      setIsSelectMode: currySetter("remote", isSelectMode, setIsSelectMode),
      copyInstructions: copyInstructions.remote,
      setCopyInstructions: currySetter("remote", copyInstructions, setCopyInstructions),
      repoInfos,
      isCopyEnabled: (isDaemonConnected && repoInfos.length > 0) ?? false,
      selectedRepoInfo: selectedRepoInfo.remote,
      setSelectedRepoInfo: currySetter("remote", selectedRepoInfo, setSelectedRepoInfo)
    };
  }, [showCopyPaste, copyInstructions, isDaemonConnected, repoInfos, selectedRepoInfo, isSelectMode]);

  const value: ICopyPasteContext = {
    local,
    remote,
  };
  return (
    <CopyPasteContext.Provider value={value}>
      {props.children}
    </CopyPasteContext.Provider>
  );
};

export const useCopyPasteContext = (client: "local" | "remote") => {
  const context = useContext(CopyPasteContext);
  return context[client];
};
