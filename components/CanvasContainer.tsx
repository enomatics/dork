// const ASPECT_RATIO = 1200 / 800;

import { RefObject } from "react";

export default function CanvasContainer({
  canvasRef,
  containerRef,
}: // onContextMenu,
{
  canvasRef: RefObject<HTMLCanvasElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  // onContextMenu: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}) {
  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: "aliceblue",
        width: "100%",
        height: "100%",
        minHeight: "500px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid blue",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        // onContextMenu={onContextMenu}
        className="border border-red-400 z-10"
      />
    </div>
  );
}
