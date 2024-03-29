import { useTheme } from '@emotion/react';
import React, { useMemo } from 'react'

function DebugCell({ column, row, columnDistance, rowDistance }) {

  const x = useMemo(() => column * columnDistance -30, [column, columnDistance]);
  const y = useMemo(() => row * rowDistance -30, [row, rowDistance]);
  const theme = useTheme();

  return (
    <>
      {column > 0 && (
        <>
          <path
            fill="transparent"
            stroke={theme.name == "light" ? "green" : "white"}
            strokeLinecap="round"
            strokeWidth="1"
            strokeDasharray={10}
            d={`M${(column - 1) * columnDistance + 30},${(row) * rowDistance - 30} ${(column) * columnDistance - 30},${(row) * rowDistance - 30}`}
          />
          <path
            fill="transparent"
            stroke={theme.name == "light" ? "green" : "white"}
            strokeLinecap="round"
            strokeWidth="1"
            strokeDasharray={10}
            d={`M${(column - 1) * columnDistance + 30},${(row) * rowDistance + 30} ${(column) * columnDistance - 30},${(row) * rowDistance + 30}`}
          />
        </>

      )}
      {row > 0 && (
        <>
          <path
            fill="transparent"
            stroke={theme.name == "light" ? "green" : "white"}
            strokeLinecap="round"
            strokeWidth="1"
            strokeDasharray={10}
            d={`M${(column) * columnDistance - 30},${(row - 1) * rowDistance + 30} ${(column) * columnDistance - 30},${(row) * rowDistance - 30}`}
          />
          <path
            fill="transparent"
            stroke={theme.name == "light" ? "green" : "white"}
            strokeLinecap="round"
            strokeWidth="1"
            strokeDasharray={10}
            d={`M${(column) * columnDistance + 30},${(row - 1) * rowDistance + 30} ${(column) * columnDistance + 30},${(row) * rowDistance - 30}`}
          />
        </>

      )}
      <rect x={x} y={y} width={60} height={60} fill='transparent' stroke="red" strokeWidth={2} strokeDasharray={10}/>
    </>
  )
}

function DebugGraph({ columns, rows, columnDistance, rowDistance }) {

  const matrix = useMemo(() => {
    let out: Array<Array<number>> = [];
    for (let i = 0; i < columns; ++i) {
      out.push([]);
      for (let j = 0; j < rows; ++j) {
        out[i].push(j)
      }
    }
    return out;
  },[columns, rows]);

  return (
    <>
      {matrix.flatMap((row, i) => {
        return row.map((_, j) => {
          return (
            <DebugCell
              key={`row-${i}-column-${j}`}
              column={i}
              row={j}
              columnDistance={columnDistance}
              rowDistance={rowDistance}
            />
          );
        });
      })}
    </>
  );
}

export default React.memo(DebugGraph);