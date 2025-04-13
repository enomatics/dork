"use client";

import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { ChromePicker, ColorResult } from "react-color";

interface CanvasElement extends fabric.FabricObject {
  id?: string;
  type: string;
}

interface HistoryItem {
  objects: fabric.FabricObject[];
  background: string;
}

interface ContextMenuState {
  isVisible: boolean;
  x: number;
  y: number;
  target: CanvasElement | null;
}

export default function Presentation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currStep, setCurrStep] = useState<number>(-1);
  const [bgColor, setBgColor] = useState<string>("#fff");
  const [ctxMenu, setCtxMenu] = useState<ContextMenuState>({
    isVisible: false,
    x: 0,
    y: 0,
    target: null,
  });
  // Canvas init
  useEffect(() => {
    if (!canvasRef.current) return;

    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1200,
      height: 800,
      selection: true,
      preserveObjectStacking: true,
    });

    const handleSelection = () => {};

    // Multiple selection (shift click)
    initCanvas.selection = true;
    initCanvas.on("selection:created", handleSelection);
    initCanvas.on("selection:updated", handleSelection);
    initCanvas.on("selection:cleared", handleSelection);

    setCanvas(initCanvas);

    return () => initCanvas.dispose();
  }, []);

  // History tracking
  useEffect(() => {
    if (!canvas) return;

    const handleModification = () => {
      const newHistory = history.slice(0, currStep + 1);
      newHistory.push({
        objects: canvas.getObjects().map((obj) => obj.toObject()),
        background: bgColor,
      });
      setHistory(newHistory);
      setCurrStep(currStep + 1);
    };

    canvas.on("object:modified", handleModification);
    canvas.on("object:added", handleModification);
    canvas.on("object:removed", handleModification);

    return () => {
      canvas.off("object:modified", handleModification);
      canvas.off("object:added", handleModification);
      canvas.off("object:removed", handleModification);
    };
  }, [history, canvas, currStep, bgColor]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canvas) return;

      // Delete
      if (e.key === "Delete") {
        canvas.getActiveObjects().forEach((obj) => canvas.remove(obj));
        canvas.requestRenderAll();
      }

      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          if (currStep > 0) {
            setCurrStep(currStep - 1);
            const previousState = history[currStep - 1];
            canvas.clear();
            canvas.backgroundColor = previousState.background;
            canvas.loadFromJSON(previousState, () => {
              canvas.renderAll();
            });
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canvas, history, currStep]);

  // Adding Elements
  const addText = () => {
    if (!canvas) return;

    const text = new fabric.Textbox("Edit me", {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 20,
    });
    canvas.add(text);
  };

  const addImage = (url: string) => {
    if (!canvas) return;

    // Something's wrong, will fix later
    fabric.FabricImage.fromURL(url);
  };

  const addShape = (type: "rectangle" | "circle") => {
    if (!canvas) return;

    let shape: fabric.FabricObject;
    switch (type) {
      case "rectangle":
        shape = new fabric.Rect({
          width: 100,
          height: 100,
          fill: "#eeeeee",
        });
        break;

      case "circle":
        shape = new fabric.Circle({
          radius: 50,
          fill: "#eeeeee",
        });
        break;
    }
    canvas.add(shape);
  };

  // Handle background colour
  const handleBgColorChange = (color: ColorResult) => {
    setBgColor(color.hex);
    if (canvas) {
      canvas.backgroundColor = color.hex;
      canvas.renderAll();
    }
  };

  // Right-click Context Menu
  const handleCanvasRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvas) return;
  };

  return (
    <div>
      {/* Toolbar */}
      <div>
        <button onClick={addText}>Add Text</button>
        <button onClick={() => addShape("rectangle")}>Rectangle</button>
        <button onClick={() => addShape("circle")}>Circle</button>
        <ChromePicker color={bgColor} onChangeComplete={handleBgColorChange} />
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} onContextMenu={handleCanvasRightClick} />

      {/* Context menu */}
      {ctxMenu.isVisible && (
        <div
          style={{
            left: ctxMenu.x,
            top: ctxMenu.y,
            position: "absolute",
          }}
        >
          <button
            onClick={() => {
              if (canvas && ctxMenu.target) {
                //Fix this
                // ctxMenu.target?.bringToFront();
                setCtxMenu((prev) => ({ ...prev, isVisible: false }));
              }
            }}
          >
            Bring to Front
          </button>

          <button
            onClick={() => {
              if (canvas && ctxMenu.target) {
                canvas.remove(ctxMenu.target);
                setCtxMenu((prev) => ({ ...prev, isVisible: false }));
              }
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
