"use client";

import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import PresentationToolbar from "@/components/PresentationToolbar";
import CanvasContainer from "@/components/CanvasContainer";
import Sidebar from "@/components/Sidebar";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [currColor, setCurrColor] = useState<
    string | null | fabric.TFiller | undefined
  >("#2dd881");

  // Canvas initialization
  useEffect(() => {
    if (!canvasRef.current) return;

    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
    });

    setCanvas(initCanvas);

    return () => {
      initCanvas.dispose();
    };
  }, []);

  fabric.Group.prototype.set({
    transparentCorners: false,
    borderColor: "blue",
    cornerColor: "white",
    cornerSize: 10,
    cornerStrokeColor: "blue",
    cornerStyle: "circle",
  });

  const addShape = (
    type: "circle" | "square" | "rectangle" | "triangle" | "ellipse"
  ) => {
    let shape: fabric.FabricObject;

    switch (type) {
      case "circle":
        shape = new fabric.Circle({
          radius: 50,
          fill: currColor,
        });
        break;
      case "square":
        shape = new fabric.Rect({
          height: 50,
          width: 50,
          fill: currColor,
        });
        break;
      case "rectangle":
        shape = new fabric.Rect({
          height: 50,
          width: 75,
          fill: currColor,
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          height: 50,
          width: 75,
          fill: currColor,
        });
        break;
      case "ellipse":
        shape = new fabric.Ellipse({
          height: 50,
          width: 75,
          fill: currColor,
        });
    }
    shape.set({
      left: (canvas?.width as number) / 2 - shape.height / 2,
      top: (canvas?.height as number) / 2 - shape.width / 2,

      // Controls appearance
      transparentCorners: false,
      borderColor: "blue",
      cornerColor: "white",
      cornerSize: 10,
      cornerStrokeColor: "blue",
      cornerStyle: "circle",
      padding: 0,
    });

    canvas?.add(shape);
  };

  return (
    <div>
      <PresentationToolbar onAddShape={addShape} />
      <div className="flex">
        <Sidebar />
        <CanvasContainer canvasRef={canvasRef} containerRef={containerRef} />
      </div>
    </div>
  );
}
