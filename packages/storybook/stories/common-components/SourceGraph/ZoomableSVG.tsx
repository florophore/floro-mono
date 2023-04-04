import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import * as d3 from "d3";

interface Props {
  children: React.ReactElement;
  width: number;
  height: number;
  columns: number;
  rows: number;
  columnDistance: number;
  rowDistance: number;
  startX: number;
  startY: number;
  isDebug?: boolean;
  focalPoint: null|[number, number];
}

const ZoomableSVG = ({
  children,
  width,
  height,
  columns,
  rows,
  columnDistance,
  rowDistance,
  startX = 0,
  startY = 0,
  isDebug = false,
  focalPoint = null
}: Props) => {

  const offsetX = useMemo(() => width / 2, [width]);
  const offsetY = useMemo(() => height / 2, [height]);
  const startingXOffset = useMemo(() => columnDistance / 2, [columnDistance]);
  const startingYOffset = useMemo(() => rowDistance / 2, [rowDistance]);
  const vbX = useMemo(
    () => width / 2 - startingXOffset,
    [startingXOffset, width]
  );
  const vbY = useMemo(
    () => height / 2 - startingYOffset,
    [startingYOffset, height]
  );
  const minX = useMemo(() => -(width / 2 - vbX), [width, vbX]);
  const minY = useMemo(() => -(height / 2 - vbY), [height, vbY]);

  const maxX = useMemo(
    () => minX + columnDistance * columns + width,
    [minX, columnDistance, columns, width]
  );
  const maxY = useMemo(
    () => minY + rowDistance * rows + height,
    [minY, rowDistance, rows, height]
  );

  const svgRef = useRef(null);
  const [k, setK] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const zoomRef = useRef<any>(null);

  const onGrabStart = useCallback(() => {
    setIsGrabbing(true);
  }, []);

  const onGrabEnd = useCallback(() => {
    setIsGrabbing(false);
  }, []);

  useEffect(() => {
    if (focalPoint) {
      const selection = d3.select(svgRef.current);
      selection
        .transition()
        .duration(150)
        .call(zoomRef.current.scaleTo, 0.5)
        .transition()
        .duration(300)
        .call(
          zoomRef.current.translateTo,
          offsetX + focalPoint[0],
          offsetY + focalPoint[1]
        );
    }
  }, [focalPoint, offsetX, offsetY]);

  useEffect(() => {
    const zoomCallback = (event) => {
      const { x, y, k } = event.transform;
      setK(k);
      setX(x);
      setY(y);
    };
    zoomRef.current = !!zoomRef.current
      ? zoomRef.current
          .scaleExtent([0.05, 1])
          .translateExtent([
            [minX, minY],
            [maxX, maxY],
          ])
          .on("zoom", zoomCallback)
          .on("start", onGrabStart)
          .on("end", onGrabEnd)
      : d3
          .zoom()
          .scaleExtent([0.1, 1])
          .translateExtent([
            [minX, minY],
            [maxX, maxY],
          ])
          .on("zoom", zoomCallback)
          .on("start", onGrabStart)
          .on("end", onGrabEnd);
    if (svgRef.current && zoomRef.current) {
      if (!hasLoaded) {
        setHasLoaded(true);
        const selection = d3.select(svgRef.current);
        selection.call(zoomRef.current);
        zoomRef.current.scaleTo(selection, 0.5);
        zoomRef.current.translateTo(
          selection,
          offsetX + startX,
          offsetY + startY
        );
      }
    }
    return () => {
      zoomRef.current.on("zoom", null);
      zoomRef.current.on("start", null);
      zoomRef.current.on("end", null);
    };
  }, [minX, minY, maxX, maxY, startX, startY, hasLoaded, offsetX, offsetY, onGrabStart, onGrabEnd]);

  const coordinateDebugger = useMemo(() => {
    if (isDebug) {
      return (
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          <p>'x: '{x}</p>
          <p>'y: '{y}</p>
          <p>'k: '{k}</p>
        </div>
      )
    }
    return false;
  }, [isDebug, x ,y ,k])

  return (
    <>
      <svg
        style={{cursor: isGrabbing ? 'move' : 'auto'}}
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`${0} ${0} ${width} ${height}`}
      >
        <g transform={`translate(${x},${y})scale(${k})`}>{children}</g>
      </svg>
      {coordinateDebugger}
    </>
  );
}

export default React.memo(ZoomableSVG);
