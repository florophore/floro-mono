import React, {
  useEffect,
} from "react";
import { useSourceGraphUIState } from "./SourceGraphUIContext";

const SourceGraphMount = () => {
  const { containerRef, setHasLoaded } = useSourceGraphUIState();

  useEffect(() => {
    setHasLoaded(true);
    return () => {
      setHasLoaded(false);
    }
  }, []);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
        <div
          ref={containerRef}
          style={{
            height: '100%',
          }}
        />
    </div>
  );
};

export default React.memo(SourceGraphMount);