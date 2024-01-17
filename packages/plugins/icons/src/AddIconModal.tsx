import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { css } from "@emotion/css";
import RootModal from "./RootModal";
import {
  FileRef,
  PointerTypes,
  SchemaTypes,
  getReferencedObject,
  makeQueryRef,
  useBinaryData,
  useBinaryRef,
  useFloroContext,
  useFloroState,
  useReferencedObject,
  useUploadFile,
} from "./floro-schema-api";
import Input from "@floro/storybook/stories/design-system/Input";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import {
  extractHexvalue,
  getAverageHex,
  getColorDistance,
  useAvgColorSVGOut,
  useSVGRemap,
  useStandardizeToHex,
} from "./colorhooks";
import ColorPalette from "@floro/styles/ColorPalette";
import ColorEditRow from "./ColorEditRow";
import ColorPaletteMatrix from "./palettecolormatrix/ColorPaletteMatrix";

import CrossWhite from "@floro/common-assets/assets/images/icons/x_cross.white.svg";
import CrossGray from "@floro/common-assets/assets/images/icons/x_cross.gray.svg";
import Button from "@floro/storybook/stories/design-system/Button";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import Radio from "@floro/storybook/stories/design-system/Radio";
import ThemeEditRow from "./ThemeEditRow";
import ThemeDefMatrix from "./themedefmatrix/ThemeDefMatrix";

const OuterContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  padding: 0;
`;

const Container = styled.div`
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  padding: 24px 16px;
  box-sizing: border-box;
`;

const IconHeadRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const IconWrapper = styled.div`
  height: 154px;
  width: 154px;
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
`;

const InputContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CompareContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-left: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

const Icon = styled.img`
  max-height: 128px;
  max-width: 128px;
  width: 100%;
  height: 100%;
`;
const SVGIcon = styled.img`
  max-height: 128px;
  max-width: 128px;
  width: 100%;
  height: 100%;
`;

const SectionTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.pluginTitle};
  padding: 0;
  margin: 24px 0 8px 0;
`;
const BeforeEditsTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.1rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0px 8px;
  width: 142px;

`;

const BottomSheet = styled.div`
  position: absolute;
  left: 0;
  height: 420px;
  width: 100%;
  background: ${(props) => props.theme.background};
  border-top: 1px solid ${(props) => props.theme.colors.contrastTextLight};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: ${(props) => `0px 8px 20px ${props.theme.shadows.innerDropdown}`};
  transition: bottom 300ms;
`;

const BottomSheetHeader = styled.div`
  height: 72px;
  width: 100%;
  border-bottom: 1px solid ${(props) => props.theme.colors.contrastTextLight};
  display: flex;
  flex-direction: row;
`;
const BottomSheetSectionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginTitle};
  text-align: flex-start;
`;

const BottomHeaderSection = styled.div`
  flex: 1;
  display: flex;
`;

const BottomSheetContainer = styled.div`
  height: 100%;
  width: 100%;
  overflow: scroll;
`;

const ColorSection = styled.div`
  margin: 0 0 24px 0;
`;

const BottomSheetXIcon = styled.img`
  height: 16px;
  width: 16px;
  margin-right: 32px;
  cursor: pointer;
`;

const HexTitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Circle = styled.div`
  height: 32px;
  width: 32px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  margin-left: 16px;
  border-radius: 50%;
`;

const HexTitle = styled.p`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0 8px;
`;

const VariantRow = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  padding: 8px 0;
  align-items: center;
`;

const VariantName = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding-left: 16px;
`;


interface Props {
  show: boolean;
  onDismiss: () => void;
  fileRef: FileRef | null;
  svgFileName: string;
}

const AddIconModal = (props: Props) => {
  const { applicationState, saveState} = useFloroContext();
  const iconGroups = useReferencedObject("$(icons).iconGroups");
  const stateVariants = useReferencedObject("$(theme).stateVariants");
  const themeDefinitions = useReferencedObject("$(theme).themeColors");
  const themes = useReferencedObject("$(theme).themes") ?? [];
  const theme = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const [fileRef, setFileRef] = useState(props.fileRef);
  const binaryRef = useBinaryRef(fileRef);
  const [name, setName] = useState("");
  const [showPaletteHexSelect, setShowPaletteHexSelect] = useState(false);
  const [showAddHexToPalette, setShowAddHexToPalette] = useState(false);
  const [edittingHex, setEdittingHex] = useState<null | string>(null);
  const [themingHex, setThemingHex] = useState<null | string>(null);
  const [showReThemeModal, setShowReThemeModal] = useState(false);
  const { fileRef: nextRef, status, uploadBlob, reset } = useUploadFile();
  const [selectedVariants, setSelectedVariants] = useState({});
  const [appliedThemes, setAppliedThemes] = useState<{
    [key: string]: PointerTypes["$(theme).themeColors.id<?>"]
  }>({});
  const [iconTheme, setIconTheme] = useState(themes?.[0]?.id);

  const iconOptions = useMemo(() => {
    return (
      iconGroups?.map((g) => {
        return {
          label: g.name,
          value: g.id,
        };
      }) ?? []
    );
  }, [applicationState, iconGroups]);

  const [group, setGroup] = useState<string | null>(
    iconOptions[0]?.value ?? null
  );

  useEffect(() => {
    if (!group) {
      setGroup(iconOptions[0]?.value ?? null);
    }
  }, [iconGroups]);

  const onChangeGroups = useCallback((option) => {
    setGroup(option.value);
  }, []);

  const id = useMemo((): string | null => {
    if (!name || (name?.trim?.() ?? "") == "") {
      return null;
    }
    return (
      name?.trim?.()?.replaceAll?.(/ +/g, "-")?.toLowerCase?.() ?? null
    );
  }, [name]);

  const icons = useMemo(() => {
    if (!applicationState || !group) {
      return [];
    }
    const iconsGroupRef = makeQueryRef("$(icons).iconGroups.id<?>", group);
    return getReferencedObject(applicationState, iconsGroupRef)?.icons ?? [];
  }, [applicationState, group]);

  const isNameAvailable = useMemo(() => {
    if (!id) {
      return false;
    }
    for (const icon of icons ?? []) {
      if (id == icon.id) {
        return false;
      }
    }
    return true;
  }, [id, icons]);

  const createIcon = useCallback(() => {
    const defaultIconTheme = makeQueryRef("$(theme).themes.id<?>", iconTheme);
    if (!id || !nextRef) {
      return;
    }
    if (!isNameAvailable) {
      return;
    }

    const enabledVariants = Object.keys(selectedVariants).map((variantId) => {
      const id = makeQueryRef("$(theme).stateVariants.id<?>", variantId);
      return {
        id,
        enabled: selectedVariants[variantId]
      }
    });

    const appliedThemesList = Object.keys(appliedThemes).map((hexcode) => {
      return {
        hexcode,
        themeDefinition: appliedThemes[hexcode]
      }
    });

    const icon: SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>'] = {
      appliedThemes: appliedThemesList,
      defaultIconTheme,
      enabledVariants: enabledVariants,
      id,
      name,
      svg: nextRef
    }

    if (!applicationState || !group) {
      return;
    }

    const iconsGroupRef = makeQueryRef("$(icons).iconGroups.id<?>", group);
    const iconGroup = getReferencedObject(
      applicationState,
      iconsGroupRef
    );

    iconGroup.icons = [icon, ...(iconGroup?.icons ?? [])];
    saveState("icons", applicationState);
    reset();
    props.onDismiss?.();
  }, [
    applicationState,
    selectedVariants,
    appliedThemes,
    id,
    name,
    iconTheme,
    group,
    nextRef,
    isNameAvailable,
    props?.onDismiss
  ]);

  useEffect(() => {
    if (status == "success") {
      createIcon();
    }
  }, [status, nextRef, createIcon])

  useEffect(() => {
    setIconTheme(themes?.[0]?.id);
  }, [themes]);

  const onHideSelectColor = useCallback(() => {
    setShowPaletteHexSelect(false);
  }, []);
  const onHideAddHex = useCallback(() => {
    setShowAddHexToPalette(false);
  }, []);

  const onHideApplyTheme = useCallback(() => {
    setShowReThemeModal(false);
  }, []);

  useEffect(() => {
    if (!props.show) {
      setGroup(iconOptions[0]?.value ?? null);
      setShowPaletteHexSelect(false);
      setShowAddHexToPalette(false);
      setShowReThemeModal(false);
      setFileRef(null);
      reset();
      setRemappedColors({});
      setSelectedVariants({});
    } else {
      setSelectedVariants({});
      setGroup(iconOptions[0]?.value ?? null);
    }
  }, [props.show, iconOptions]);

  const { data: svgData } = useBinaryData(fileRef, "text");
  const [remappedColors, setRemappedColors] = useState({});
  const [addedColors, setAddedColors] = useState<{[hex: string]: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']}>({});

  const showStateVariants = useMemo(() => {
    return (stateVariants?.length ?? 0) > 0;
  }, [stateVariants]);

  const showApplyThemes = useMemo(() => {
    return (themeDefinitions?.length ?? 0) > 0;
  }, [stateVariants]);


  const standardizedData = useStandardizeToHex(svgData ?? '');
  const hexValues = useMemo(
    () => extractHexvalue(standardizedData),
    [standardizedData]
  );

  useEffect(() => {
    setName(props.svgFileName.split(".").slice(0, -1).join(" "));
  }, [props.svgFileName]);

  useEffect(() => {
    setRemappedColors(
      hexValues.reduce((acc, value) => {
        return {
          ...acc,
          [value]: value,
        };
      }, {})
    );
  }, [hexValues, props.fileRef]);

  const remappedSVG = useSVGRemap(standardizedData, remappedColors);


  const onAddIcon = useCallback(() => {
    if (remappedSVG) {
      uploadBlob([remappedSVG], "image/svg+xml");
    }
  }, [remappedSVG])

  const avgColor = useAvgColorSVGOut(remappedSVG);
  const avgOriginalColor = useAvgColorSVGOut(standardizedData);

  const iconPreviewBackground = useMemo(() => {
    const lightDistance = getColorDistance(avgColor, ColorPalette.white);
    const darkDistance = getColorDistance(avgColor, ColorPalette.black);
    if (lightDistance <= darkDistance) {
      return ColorPalette.darkModeBG;
    }
    return ColorPalette.white;
  }, [avgColor]);

  const originalIconPreviewBackground = useMemo(() => {
    const lightDistance = getColorDistance(avgOriginalColor, ColorPalette.white);
    const darkDistance = getColorDistance(avgOriginalColor, ColorPalette.black);
    if (lightDistance <= darkDistance) {
      return ColorPalette.darkModeBG;
    }
    return ColorPalette.white;
  }, [avgOriginalColor]);

  useEffect(() => {
    if (props.fileRef) {
      setFileRef(props.fileRef);
    }
  }, [props.fileRef]);

  useEffect(() => {
    if (status == "success") {
      setFileRef(nextRef);
    }
  }, [status]);

  const onChangeRemap = useCallback(
    (originalColor: string, color: string) => {
      setRemappedColors({
        ...remappedColors,
        [originalColor]: color,
      });
    },
    [remappedColors]
  );

  const onUndoRemap = useCallback(
    (originalColor: string) => {
      setRemappedColors({
        ...remappedColors,
        [originalColor]: originalColor,
      });
    },
    [remappedColors]
  );

  const onUndoCurrentRemap = useCallback(() => {
    if (edittingHex) {

      setRemappedColors({
        ...remappedColors,
        [edittingHex]: edittingHex,
      });
    }
  }, [remappedColors, edittingHex]);

  const remappedSVGUrl = useMemo(() => {
    return `data:image/svg+xml,${encodeURIComponent(remappedSVG)}`;
  }, [remappedSVG]);

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return CrossGray;
    }
    return CrossWhite;
  }, [theme.name]);

  const onEditColor = useCallback((originalColor: string) => {
    setEdittingHex(originalColor);
    if (container.current) {
      container.current?.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
    setShowPaletteHexSelect(true);
  }, []);

  const onAddHex = useCallback((originalColor: string) => {
    setEdittingHex(originalColor);
    if (container.current) {
      container.current?.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
    setShowAddHexToPalette(true);
  }, []);

  const onSelectColor = useCallback((colorRef: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']) => {
    if (showPaletteHexSelect) {
      if (applicationState && edittingHex != null) {
        const colorShade = getReferencedObject(applicationState, colorRef);
        const opacity = edittingHex.substring(edittingHex.length - 2);
        const nextHex = colorShade?.hexcode + opacity;
        onChangeRemap(edittingHex, nextHex);
      }
    }
    if (showAddHexToPalette) {
      if (applicationState && edittingHex != null) {
        const colorShade = getReferencedObject(applicationState, colorRef);
        colorShade.hexcode = edittingHex?.substring(0, 7);
        saveState("palette", applicationState);
        setShowAddHexToPalette(false);
        setAddedColors({
          ...addedColors,
          [edittingHex]: colorRef
        });
      }
    }

  }, [applicationState, addedColors, edittingHex, onChangeRemap, showPaletteHexSelect, showAddHexToPalette])

  const onUndoAdd = useCallback((hexVal: string) => {
      if (applicationState && addedColors[hexVal]) {
        const colorRef = addedColors[hexVal];
        const colorShade = getReferencedObject(applicationState, colorRef);
        colorShade.hexcode = undefined;
        saveState("palette", applicationState);
        delete addedColors[hexVal];
        setAddedColors({...addedColors});
      }
  }, [addedColors, applicationState, saveState]);

  const color = useMemo(() => {
    if (!edittingHex) {
      return "";
    }
    return remappedColors[edittingHex] ?? edittingHex;
  }, [remappedColors, edittingHex]);

  const colorTitle = useMemo(() => {
    if (!edittingHex) {
      return "";
    }
    return color?.substring(0, 7) ?? edittingHex?.substring(0, 7);
  }, [remappedColors, edittingHex, color]);

  const themingHexTitle = useMemo(() => {
    if (!themingHex) {
      return "";
    }
    return themingHex?.substring(0, 7)  ?? "";
  }, [themingHex]);

  const originalColorTitle = useMemo(() => {
    if (!edittingHex) {
      return "";
    }
    return edittingHex?.substring(0, 7);
  }, [edittingHex]);

  const onChangeVariant = useCallback((stateVariantId: string) => {
    if (!selectedVariants[stateVariantId]) {
      setSelectedVariants({
        ...selectedVariants,
        [stateVariantId]: true,
      })
    } else {
      delete selectedVariants[stateVariantId];
      setSelectedVariants({
        ...selectedVariants,
      })
    }
  }, [selectedVariants]);

  const colorPalettes = useReferencedObject("$(palette).colorPalettes") ?? [];
  const paletteHexes = useMemo(() => {
    return colorPalettes.flatMap((c) => {
        return c.colorShades.map((s) => {
          return s.hexcode ?? null;
        });
      })
      ?.filter((v: string | null) => {
        return !!v;
      });
  }, [colorPalettes]);

  const mappedHexvals = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<string> = [];
    for (let original in remappedColors) {
      const mappedColor = (remappedColors?.[original] ?? original);
      if (mappedColor != '' && !seen.has(mappedColor) && paletteHexes.includes(mappedColor.substring(0, 7))) {
        out.push(mappedColor);
        seen.add(mappedColor);
      }
    }
    return out;
  }, [remappedColors, paletteHexes]);

  const themeColorHexes = useMemo(() => {
    const out: Array<string> = [];
    if (applicationState) {
      const defaultThemeRef = makeQueryRef("$(theme).themes.id<?>", iconTheme);
      const themeColors = getReferencedObject(applicationState, "$(theme).themeColors") ?? [];
      const seen = new Set<string>();
      for (const themeColor of themeColors) {
        const themeDefRef = makeQueryRef(
          "$(theme).themeColors.id<?>.themeDefinitions.id<?>",
          themeColor.id,
          defaultThemeRef
        );
        const themeDef = getReferencedObject(applicationState, themeDefRef);
        const paletteColor = getReferencedObject(applicationState, themeDef?.paletteColorShade);
        if (paletteColor?.hexcode && !seen.has(paletteColor.hexcode)) {
          seen.add(paletteColor.hexcode);
          out.push(paletteColor.hexcode)
        }
      }
    }
    return out;
  }, [iconTheme, applicationState]);

  useEffect(() => {
    if (applicationState && iconTheme) {
      let appliedThemesToRemove: Array<string> = [];
      for (const hexval in appliedThemes) {
        if (!mappedHexvals.includes(hexval)) {
          appliedThemesToRemove.push(hexval)
          continue;
        }
        if (!themeColorHexes.includes(hexval?.substring(0, 7))) {
          appliedThemesToRemove.push(hexval)
          continue;
        }
      }
      if (appliedThemesToRemove.length > 0) {
        for (const hexval of appliedThemesToRemove) {
          delete appliedThemes[hexval];
        }
        setAppliedThemes({...appliedThemes});
      }
    }
  }, [mappedHexvals, appliedThemes, iconTheme, themes, applicationState, themeColorHexes])


  const defaultThemeRef = useMemo(
    () => makeQueryRef("$(theme).themes.id<?>", iconTheme),
    [iconTheme]
  );

  const onChangeTheme = useCallback((mappedColor: string) => {
    setThemingHex(mappedColor);
    if (container.current) {
      container.current?.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
    setShowReThemeModal(true);
  }, []);

  const onSelectTheme = useCallback((pointer: PointerTypes['$(theme).themeColors.id<?>']) => {
    if (themingHex) {
      setAppliedThemes({
        ...appliedThemes,
        [themingHex]: pointer
      });
      setShowReThemeModal(false);
    }
  }, [themingHex, appliedThemes]);

  const onNoTheme = useCallback((hex: string) => {
    delete appliedThemes[hex];
    setAppliedThemes({...appliedThemes});
  }, [appliedThemes])

  return (
    <RootModal
      show={props.show}
      onDismiss={props.onDismiss}
      title={"add new icon"}
      left={
        <div
          style={{
            marginRight: -100,
            width: 120,
          }}
        >
          <Button
            size="small"
            label={"add icon"}
            bg={"teal"}
            onClick={onAddIcon}
            isDisabled={!isNameAvailable}
          />
        </div>
      }
    >
      <OuterContainer>
        <Container
          ref={container}
          style={{
            overflow:
              showPaletteHexSelect || showAddHexToPalette || showReThemeModal
                ? "hidden"
                : "scroll",
          }}
        >
          <IconHeadRow>
            <IconWrapper style={{ background: iconPreviewBackground }}>
              {binaryRef && !remappedSVG && <Icon src={binaryRef} />}
              {remappedSVG && <Icon src={remappedSVGUrl} />}
            </IconWrapper>
            {showPaletteHexSelect && binaryRef && (
              <CompareContainer>
                <BeforeEditsTitle>{"before edits:"}</BeforeEditsTitle>
                <IconWrapper
                  style={{ background: originalIconPreviewBackground }}
                >
                  <Icon src={binaryRef} />
                </IconWrapper>
              </CompareContainer>
            )}
            {!showPaletteHexSelect && (
              <InputContainer>
                <div style={{ marginTop: -14 }}>
                  <Input
                    label={"icon name"}
                    placeholder={"enter icon name"}
                    value={name}
                    onTextChanged={setName}
                    isValid={isNameAvailable}
                  />
                </div>
                <div style={{ marginTop: 12 }}>
                  <InputSelector
                    options={iconOptions}
                    value={group}
                    label={"icon group"}
                    placeholder={"choose icon group"}
                    onChange={onChangeGroups}
                  />
                </div>
              </InputContainer>
            )}
          </IconHeadRow>
          <SectionTitle>{"Colors"}</SectionTitle>
          <ColorSection>
            {hexValues.map((hexVal) => {
              return (
                <ColorEditRow
                  key={hexVal}
                  originalColor={hexVal}
                  color={remappedColors[hexVal]}
                  onUndoRemap={onUndoRemap}
                  onEditColor={onEditColor}
                  onAddHex={onAddHex}
                  onUndoAdd={onUndoAdd}
                  wasAdded={!!addedColors[hexVal]}
                />
              );
            })}
          </ColorSection>
          <SectionTitle>{"Default Icon Theme"}</SectionTitle>
          {themes.map((t) => {
            return (
              <VariantRow key={t.id}>
                <Radio
                  isChecked={iconTheme == t.id}
                  onChange={() => setIconTheme(t.id)}
                />

                <VariantName>{t.name}</VariantName>
              </VariantRow>
            );
          })}
          {showStateVariants && (
            <>
              <SectionTitle>{"Included Variants"}</SectionTitle>
              {stateVariants.map((stateVariant) => {
                return (
                  <VariantRow key={stateVariant.id}>
                    <Checkbox
                      isChecked={!!selectedVariants?.[stateVariant.id]}
                      onChange={() => onChangeVariant(stateVariant.id)}
                    />

                    <VariantName>{stateVariant.name}</VariantName>
                  </VariantRow>
                );
              })}
            </>
          )}
          {showApplyThemes && (
            <>
              <SectionTitle>{"Apply Theme Definitions"}</SectionTitle>
              {mappedHexvals?.map((mappedColor) => {
                return (
                  <ThemeEditRow
                    key={mappedColor}
                    mappedColor={mappedColor}
                    onChangeTheme={onChangeTheme}
                    onNoTheme={onNoTheme}
                    appliedTheme={appliedThemes[mappedColor]}
                    defaultTheme={defaultThemeRef}
                    hasMatchingThemeDef={themeColorHexes.includes(
                      mappedColor.substring(0, 7)
                    )}
                  />
                );
              })}
            </>
          )}
        </Container>
        <BottomSheet
          style={{
            bottom: showPaletteHexSelect ? 0 : -430,
          }}
        >
          <BottomSheetHeader>
            <BottomHeaderSection
              style={{
                justifyContent: "flex-start",
                alignItems: "center",
                flex: 2,
              }}
            >
              {edittingHex && (
                <HexTitleWrapper style={{ width: 168 }}>
                  <Circle style={{ background: color }} />
                  <HexTitle>{colorTitle}</HexTitle>
                </HexTitleWrapper>
              )}

              {edittingHex && edittingHex != remappedColors[edittingHex] && (
                <Button
                  onClick={onUndoCurrentRemap}
                  style={{ width: 120 }}
                  label={"undo mapping"}
                  bg={"orange"}
                  size={"small"}
                  textSize="small"
                />
              )}
            </BottomHeaderSection>
            <BottomHeaderSection
              style={{
                alignItems: "center",
              }}
            >
              {edittingHex && (
                <HexTitleWrapper>
                  <Circle style={{ background: edittingHex, marginLeft: 0 }} />
                  <HexTitle>{originalColorTitle}</HexTitle>
                </HexTitleWrapper>
              )}
            </BottomHeaderSection>
            <BottomHeaderSection
              style={{
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <BottomSheetXIcon onClick={onHideSelectColor} src={xIcon} />
            </BottomHeaderSection>
          </BottomSheetHeader>
          <BottomSheetContainer>
            <ColorPaletteMatrix
              show={showPaletteHexSelect}
              onSelect={onSelectColor}
              filterNullHexes
            />
          </BottomSheetContainer>
        </BottomSheet>
        <BottomSheet
          style={{
            bottom: showAddHexToPalette ? 0 : -430,
          }}
        >
          <BottomSheetHeader>
            <BottomHeaderSection
              style={{
                justifyContent: "flex-start",
                alignItems: "center",
                flex: 1,
              }}
            >
              {edittingHex && (
                <HexTitleWrapper style={{ width: 168 }}>
                  <Circle style={{ background: color }} />
                  <HexTitle>{colorTitle}</HexTitle>
                </HexTitleWrapper>
              )}
            </BottomHeaderSection>
            <BottomHeaderSection
              style={{
                alignItems: "center",
              }}
            >
              <BottomSheetSectionTitle>
                {"Add Color To Palette"}
              </BottomSheetSectionTitle>
            </BottomHeaderSection>
            <BottomHeaderSection
              style={{
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <BottomSheetXIcon onClick={onHideAddHex} src={xIcon} />
            </BottomHeaderSection>
          </BottomSheetHeader>
          <BottomSheetContainer>
            <ColorPaletteMatrix
              show={showAddHexToPalette}
              onSelect={onSelectColor}
              disabledNonNull
            />
          </BottomSheetContainer>
        </BottomSheet>
        <BottomSheet
          style={{
            bottom: showReThemeModal ? 0 : -430,
          }}
        >
          <BottomSheetHeader>
            <BottomHeaderSection
              style={{
                justifyContent: "flex-start",
                alignItems: "center",
                flex: 1,
              }}
            >
              {themingHex && (
                <HexTitleWrapper style={{ width: 168 }}>
                  <Circle style={{ background: themingHex }} />
                  <HexTitle>{themingHexTitle}</HexTitle>
                </HexTitleWrapper>
              )}
            </BottomHeaderSection>
            <BottomHeaderSection
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 2,
                textAlign: "center",
              }}
            >
              <BottomSheetSectionTitle>
                {"Pick Theme Def To Apply"}
              </BottomSheetSectionTitle>
            </BottomHeaderSection>
            <BottomHeaderSection
              style={{
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <BottomSheetXIcon onClick={onHideApplyTheme} src={xIcon} />
            </BottomHeaderSection>
          </BottomSheetHeader>
          <BottomSheetContainer>
            {themingHex && (
              <ThemeDefMatrix
                show={showReThemeModal}
                themingHex={themingHex}
                appliedThemes={appliedThemes}
                remappedSVG={remappedSVG}
                defaultIconTheme={iconTheme}
                selectedVariants={selectedVariants}
                onSelect={onSelectTheme}
                onNoTheme={onNoTheme}
              />
            )}
          </BottomSheetContainer>
        </BottomSheet>
      </OuterContainer>
    </RootModal>
  );
};

export default React.memo(AddIconModal);
