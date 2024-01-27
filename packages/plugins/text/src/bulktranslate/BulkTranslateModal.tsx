import React, {
  useRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import { useTheme } from "@emotion/react";

import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import { PointerTypes, SchemaTypes, makeQueryRef, useFloroContext, useReferencedObject } from "../floro-schema-api";
import { useDeepLContext } from "../deepl/DeepLContext";
import { getFilteredPhrasesGroups, getPhrasesFilteredForPhraseGroup } from "../phrasegroups/filterhooks";
import BackIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";
import FilterList from "./FilterList";
import JobList from "./JobList";
import { translatePhraseJob } from "./job";


const OuterContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const HeaderWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h1`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.modalHeaderTitleColor};
  font-weight: 700;
  font-size: 2rem;
`;

const SelectParagraphOption = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.linkColor};
  font-weight: 700;
  font-size: 1.44rem;
  text-decoration: underline;
  cursor: pointer;
`;

const TranslationCount = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.titleText};
  font-weight: 600;
  font-size: 1.7rem;
`;

const BackArrow = styled.img`
  height: 40px;
  width: 40px;
  cursor: pointer;
`;

const planOptions = [
  {
    label: "Free Plan",
    value: "free",
  },
  {
    label: "Pro Plan",
    value: "pro",
  },
];

interface Props {
  show: boolean;
  onDismiss: () => void;
  selectedLocale?: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale?:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
}

const BulkTranslateModal = (props: Props) => {
  const { currentPluginAppState, lastEditKey, applicationState, saveState, commandMode } = useFloroContext();
  const theme = useTheme();
  const { apiKey, setApiKey, isFreePlan, setIsFreePlan } = useDeepLContext();

  const phraseGroups = useReferencedObject("$(text).phraseGroups");

  const [page, setPage] = useState<"choose" | "filter" | "job">("choose");
  const [filterPlan, setFilterPlan] =
    useState<"all" | "untranslated" | "requires_update">("all");
  const [selectedPhraseRefs, setSelectedPhraseRefs] = useState<
    PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"][]
  >([]);
  const visitedRefs = useRef<Array<string>>([]);

  const backIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackIconLight;
    }
    return BackIconDark;
  }, [theme.name]);

  useEffect(() => {
    if (props.show) {
      setFilterPlan("all");
      setPage("choose");
      setSelectedPhraseRefs([]);
    }
  }, [props.show]);

  const untraslatedGroups = useMemo(() => {
    if (
      !props.show ||
      !applicationState ||
      !props?.selectedLocale?.localeCode
    ) {
      return [];
    }
    return getFilteredPhrasesGroups(
      applicationState,
      phraseGroups,
      makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        props.selectedLocale?.localeCode
      ),
      [],
      false,
      null,
      false,
      true,
      ""
    ).map(phraseGroup => {
      const filteredPhrases = getPhrasesFilteredForPhraseGroup(
        applicationState,
        makeQueryRef("$(text).phraseGroups.id<?>", phraseGroup.id),
        phraseGroup.phrases ?? [],
        makeQueryRef(
          "$(text).localeSettings.locales.localeCode<?>",
          props.selectedLocale?.localeCode as string
        ),
        [],
        false,
        null,
        false,
        true,
        ""
      );
      return {
        ...phraseGroup,
        phrases: filteredPhrases,
      };
    });
  }, [
    props.show,
    applicationState,
    phraseGroups,
    props.selectedLocale?.localeCode,
    page
  ]);

  const untranslatedPhraseCount = useMemo(() => {
    let count = 0;
    for (let phraseGroup of untraslatedGroups ?? []) {
      count += phraseGroup?.phrases.length ?? 0;
    }
    return count;
  }, [untraslatedGroups]);

  const requiresUpdatesGroups = useMemo(() => {
    if (
      !props.show ||
      !applicationState ||
      !props?.selectedLocale?.localeCode
    ) {
      return [];
    }
    return getFilteredPhrasesGroups(
      applicationState,
      phraseGroups,
      makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        props.selectedLocale?.localeCode
      ),
      [],
      false,
      null,
      true,
      false,
      ""
    ).map(phraseGroup => {
      const filteredPhrases = getPhrasesFilteredForPhraseGroup(
        applicationState,
        makeQueryRef("$(text).phraseGroups.id<?>", phraseGroup.id),
        phraseGroup.phrases ?? [],
        makeQueryRef(
          "$(text).localeSettings.locales.localeCode<?>",
          props.selectedLocale?.localeCode as string
        ),
        [],
        false,
        null,
        true,
        false,
        ""
      );
      return {
        ...phraseGroup,
        phrases: filteredPhrases,
      };
    });
  }, [
    props.show,
    applicationState,
    phraseGroups,
    props.selectedLocale?.localeCode,
    page
  ]);

  const requiresUpdatePhraseCount = useMemo(() => {
    let count = 0;
    for (let phraseGroup of requiresUpdatesGroups ?? []) {
      count += phraseGroup?.phrases.length ?? 0;
    }
    return count;
  }, [requiresUpdatesGroups]);
  const [phraseGroupsToSelect, setPhraseGroupsToSelect] = useState<SchemaTypes["$(text).phraseGroups"]>([]);

  useEffect(() => {
    if (filterPlan == "untranslated") {
      setPhraseGroupsToSelect([...untraslatedGroups]);
      return;

    }
    if (filterPlan == "requires_update") {
      setPhraseGroupsToSelect([...requiresUpdatesGroups]);
      return;
    }
    setPhraseGroupsToSelect([...phraseGroups]);
  }, [filterPlan, page, untraslatedGroups, requiresUpdatesGroups, phraseGroups]);

  const allRefs = useMemo(() => {
    return phraseGroupsToSelect.flatMap((phraseGroup) => {
      return phraseGroup.phrases.map((phrase) => {
        return makeQueryRef(
          "$(text).phraseGroups.id<?>.phrases.id<?>",
          phraseGroup.id,
          phrase.id
        );
      });
    });
  }, [phraseGroupsToSelect, filterPlan, page]);

  useEffect(() => {
    if (page == 'filter') {
      setSelectedPhraseRefs([]);
    }
  }, [page, filterPlan])

  const jobPhraseGroups = useMemo(() => {
    if (page != "job") {
      return [];
    }
    return phraseGroupsToSelect
      .map((phraseGroup) => {
        const phrases = phraseGroup.phrases.filter((phrase) => {
          const phraseRef = makeQueryRef(
            "$(text).phraseGroups.id<?>.phrases.id<?>",
            phraseGroup.id,
            phrase.id
          );
          return selectedPhraseRefs.includes(phraseRef);
        });
        return {
          ...phraseGroup,
          phrases,
        };
      })
      .filter((phraseGroup) => phraseGroup.phrases.length > 0);
  }, [page, phraseGroupsToSelect, selectedPhraseRefs]);

  const jobList = useMemo(() => {
    return jobPhraseGroups.flatMap((phraseGroup) => {
      return phraseGroup.phrases.map((phrase) => {
        return makeQueryRef(
          "$(text).phraseGroups.id<?>.phrases.id<?>",
          phraseGroup.id,
          phrase.id
        );
      });
    });
  }, [jobPhraseGroups]);

  const [jobStatuses, setJobStatuses] = useState<
    Record<
      PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"],
      "succeeded" | "failed" | "enqueued" | "processing"
    >
  >({});

  useEffect(() => {
    const jobs = jobList.reduce((acc, phraseRef) => {
      return {
        ...acc,
        [phraseRef]: "enqueued",
      };
    }, {} as Record<PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"], "succeeded" | "failed" | "enqueued" | "processing">);
    setJobStatuses(jobs);
  }, [jobList]);

  const completedJobs = useMemo(() => {
    let count = 0;
    for (let phraseRef in jobStatuses) {
      if (
        jobStatuses[phraseRef] != "enqueued" &&
        jobStatuses[phraseRef] != "processing"
      ) {
        count++;
      }
    }
    return count;
  }, [jobStatuses]);

  const [currentRef, setCurrentRef] =
    useState<null | PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"]>(
      null
    );
  const [jobState, setJobState] = useState<"running" | "stopped">("stopped");

  useEffect(() => {
    if (page != "job") {
      setJobState("stopped");
    }
  }, [page]);

  useEffect(() => {
    if (page != "job") {
      setCurrentRef(null);
    } else {
      setCurrentRef(jobList[0]);
      setJobState("running");
      visitedRefs.current = [];
    }
  }, [jobList, page]);

  useEffect(() => {
    if (commandMode != "edit") {
      return;
    }
    if (!applicationState || !saveState || !props.selectedLocale || !props.systemSourceLocale || !apiKey) {
      return
    }
    if (!currentRef || jobState == "stopped") {
      return;
    }
    let isMounted = {
      value: true
    };
    setJobStatuses({
      ...jobStatuses,
      [currentRef]: "processing",
    });
    translatePhraseJob(
      currentPluginAppState,
      applicationState,
      lastEditKey,
      currentRef,
      props.selectedLocale,
      props.systemSourceLocale,
      filterPlan,
      apiKey,
      isFreePlan,
      visitedRefs.current
    ).then((didSucceed) => {
      if (!isMounted.value) {
        return;
      }
      setJobStatuses({
        ...jobStatuses,
        [currentRef]: didSucceed ? "succeeded" : "failed",
      });
      const index = jobList.indexOf(currentRef);
      const nextRef = jobList?.[index + 1] ?? null;
      setCurrentRef(nextRef);
    });
    return () => {
      isMounted.value = false;
    };
  }, [currentRef, jobState]);

  const onChangePlan = useCallback(
    (option) => {
      if (option.value) {
        setIsFreePlan(option.value == "free");
      }
    },
    [setIsFreePlan]
  );

  const onSetApiKey = useCallback(
    (value) => {
      setApiKey(value ? value : "");
    },
    [setApiKey]
  );

  const onSelectUntranlsated = useCallback(() => {
    setFilterPlan("untranslated");
    setPage("filter");
  }, []);

  const onSelectRequiresUpdate = useCallback(() => {
    setFilterPlan("requires_update");
    setPage("filter");
  }, []);

  const onSelectAll = useCallback(() => {
    setFilterPlan("all");
    setPage("filter");
  }, []);

  const onSubmitJob = useCallback(() => {
    setPage("job");
  }, []);

  const onCancelJob = useCallback(() => {
    setPage('filter');
    setCurrentRef(null);
    setJobState("stopped");
  }, [])

  const onPause = useCallback(() => {
    setJobState("stopped");
    if (applicationState) {
      saveState("text", applicationState);
    }
    if (currentRef) {
      setJobStatuses({
        ...jobStatuses,
        [currentRef]: "enqueued",
      });
    }
  }, [currentRef, jobStatuses, applicationState]);

  const onResume = useCallback(() => {
    setJobState("running");
  }, [currentRef, jobStatuses]);

  const isDone = useMemo(() => {
    return completedJobs == jobList.length;
  }, [completedJobs, jobList]);

  useEffect(() => {
    if (isDone && applicationState) {
      saveState("text", applicationState);
    }

  }, [isDone, applicationState])

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismiss}
      disableBackgroundDismiss
      headerSize={"small"}
      topOffset={80}
      width={1040}
      zIndex={5}
      showExitIcon={page != "job" || isDone || jobState == "stopped"}
      headerChildren={
        <HeaderWrapper>
          <HeaderTitle>{`Bulk Translate (${props.selectedLocale?.localeCode})`}</HeaderTitle>
        </HeaderWrapper>
      }
    >
      <OuterContainer>
        {page == "choose" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              maxWidth: 470,
              alignSelf: "center",
            }}
          >
            <div>
              <Row
                style={{
                  justifyContent: "center",
                }}
              >
                <InputSelector
                  options={planOptions}
                  value={isFreePlan ? "free" : "pro"}
                  label={"DeepL plan type"}
                  placeholder={"select your DeepL Plan Type"}
                  onChange={onChangePlan}
                  size="wide"
                />
              </Row>
              <Row
                style={{
                  marginTop: 12,
                  justifyContent: "center",
                }}
              >
                <Input
                  value={apiKey ?? ""}
                  onTextChanged={onSetApiKey}
                  widthSize={"wide"}
                  label={"DeepL api key"}
                  placeholder={"DeepL API Key"}
                />
              </Row>
            </div>
            <div
              style={{
                maxHeight: 500,
                flexGrow: 1,
                display: "flex",
                width: "100%",
                justifyContent: "space-evenly",
                flexDirection: "column",
              }}
            >
              <Button
                onClick={onSelectUntranlsated}
                label={"translate un-translated phrases"}
                bg={"orange"}
                size={"extra-big"}
                isDisabled={!apiKey || untranslatedPhraseCount == 0}
              />
              <Button
                onClick={onSelectRequiresUpdate}
                label={"translate phrases requiring update"}
                bg={"teal"}
                size={"extra-big"}
                isDisabled={!apiKey || requiresUpdatePhraseCount == 0}
              />
              <Button
                onClick={onSelectAll}
                label={"translate all phrases"}
                bg={"purple"}
                size={"extra-big"}
                isDisabled={!apiKey}
              />
            </div>
          </div>
        )}
        {page == "filter" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                height: 72,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginLeft: 24,
                }}
              >
                <TranslationCount>
                  {filterPlan == "all" && <>{`Page: (all)`}</>}
                  {filterPlan == "requires_update" && (
                    <>{`Page: (Requiring Update)`}</>
                  )}
                  {filterPlan == "untranslated" && (
                    <>{`Page: (Untranslated)`}</>
                  )}
                </TranslationCount>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginLeft: 24,
                  }}
                >
                  <SelectParagraphOption
                    onClick={() => {
                      setSelectedPhraseRefs(allRefs);
                    }}
                  >
                    {"select all"}
                  </SelectParagraphOption>
                  <SelectParagraphOption
                    style={{ marginLeft: 24 }}
                    onClick={() => {
                      setSelectedPhraseRefs([]);
                    }}
                  >
                    {"unselect all"}
                  </SelectParagraphOption>
                </div>
              </div>
              <BackArrow
                src={backIcon}
                onClick={() => {
                  setPage("choose");
                }}
              />
            </div>
            <div
              style={{
                width: "100%",
                height: 540,
              }}
            >
              <FilterList
                phraseGroups={phraseGroupsToSelect ?? []}
                selectedPhraseRefs={selectedPhraseRefs}
                onUpdateSelectedPhraseRefs={setSelectedPhraseRefs}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                width: "100%",
                height: 72,
              }}
            >
              <Button
                label={"submit job"}
                bg={"orange"}
                size={"medium"}
                isDisabled={selectedPhraseRefs.length == 0}
                onClick={onSubmitJob}
              />
            </div>
          </div>
        )}
        {page == "job" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                height: 72,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <TranslationCount>
                  {`Translated: ${completedJobs}/${jobList.length}`}
                </TranslationCount>
              </div>
            </div>
            <div
              style={{
                width: "100%",
                height: 540,
              }}
            >
              <JobList phraseGroups={jobPhraseGroups} jobs={jobStatuses} />
            </div>
            {!isDone && (
              <>
                {jobState == "running" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      width: "100%",
                      height: 72,
                    }}
                  >
                    <Button
                      label={"pause"}
                      bg={"red"}
                      size={"medium"}
                      onClick={onPause}
                    />
                  </div>
                )}
                {jobState == "stopped" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      height: 72,
                    }}
                  >
                    <Button
                      label={"cancel"}
                      bg={"gray"}
                      size={"medium"}
                      onClick={onCancelJob}
                    />
                    <Button
                      label={"resume"}
                      bg={"orange"}
                      size={"medium"}
                      onClick={onResume}
                    />
                  </div>
                )}
              </>
            )}
            {isDone && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  width: "100%",
                  height: 72,
                }}
              >
                <Button
                  label={"done!"}
                  bg={"teal"}
                  size={"medium"}
                  onClick={props.onDismiss}
                />
              </div>
            )}
          </div>
        )}
      </OuterContainer>
    </RootLongModal>
  );
};

export default React.memo(BulkTranslateModal);
