"use client";

import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import PresentationToolbar from "@/components/PresentationToolbar";
import CanvasContainer from "@/components/CanvasContainer";
import Sidebar from "@/components/Sidebar";

interface CanvasElement extends fabric.FabricObject {
  id?: string;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  target: CanvasElement | null;
}

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [currColor, setCurrColor] = useState<
    string | null | fabric.TFiller | undefined
  >("#2dd881");
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    target: null,
  });

  // Canvas initialization
  useEffect(() => {
    if (!canvasRef.current) return;

    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: true,
    });

    // Add context menu handler
    initCanvas.on("mouse:down", (options) => {
      console.log(options.e as MouseEvent);
      console.log(options.target?.type);

      const target = initCanvas.findTarget(options.e) as CanvasElement;

      // If there's a target, make it active
      if (target) {
        initCanvas.setActiveObject(target);
        initCanvas.requestRenderAll();
      }

      if ((options.e as MouseEvent).button === 2) {
        // Right click
        options.e.preventDefault();

        console.log("Fabric right click detected");
        setContextMenu({
          visible: true,
          x: (options.e as MouseEvent).clientX,
          y: (options.e as MouseEvent).clientY,
          target: target || null,
        });
      }
    });

    // Disable default context menu via DOM
    initCanvas.upperCanvasEl.addEventListener("contextmenu", (e) =>
      e.preventDefault()
    );

    setCanvas(initCanvas);

    return () => {
      initCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      console.log("Context menu opening...");

      // Get canvas position relative to viewport
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      // Calculate position relative to canvas, accounting for scroll
      const x = e.clientX - canvasRect.left + window.scrollX;
      const y = e.clientY - canvasRect.top + window.scrollY;

      setContextMenu({
        visible: true,
        x,
        y,
        target: canvas?.findTarget(e) || null,
      });
    };

    const canvasEl = canvasRef.current;
    if (canvasEl) {
      canvasEl.addEventListener("contextmenu", handleContextMenu);
    }

    return () => {
      if (canvasEl)
        canvasEl.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [canvas]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canvas) return;

      if (e.key === "Delete") {
        canvas.getActiveObjects().forEach((obj) => canvas.remove(obj));
        canvas.requestRenderAll();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canvas]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [contextMenu.visible]);

  fabric.Group.prototype.set({
    transparentCorners: false,
    borderColor: "blue",
    cornerColor: "white",
    cornerSize: 10,
    cornerStrokeColor: "blue",
    cornerStyle: "circle",
  });

  const addText = () => {
    if (!canvas) return;

    const text = new fabric.Textbox("Add Text", {
      left: 100,
      top: 100,
      width: 100,
      fontSize: 20,

      // Controls appearance
      transparentCorners: false,
      borderColor: "blue",
      cornerColor: "white",
      cornerSize: 10,
      cornerStrokeColor: "blue",
      cornerStyle: "circle",
      padding: 0,
    });

    canvas.add(text);
  };

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
      snapAngle: 5,

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

  const handleLockObject = (obj: CanvasElement) => {
    obj.set({
      selectable: false,
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingFlip: true,
      lockScalingX: true,
      lockScalingY: true,
      lockSkewingX: true,
      lockSkewingY: true,
      hasControls: false,
    });
  };

  const handleUnlockObject = (obj: CanvasElement) => {
    obj.set({
      selectable: !false,
      lockMovementX: !true,
      lockMovementY: !true,
      lockRotation: !true,
      lockScalingFlip: !true,
      lockScalingX: !true,
      lockScalingY: !true,
      lockSkewingX: !true,
      lockSkewingY: !true,
      hasControls: !false,
    });
  };

  return (
    <div>
      <PresentationToolbar onAddShape={addShape} onAddText={addText} />
      <div className="flex relative">
        <Sidebar />
        <CanvasContainer
          // onContextMenu={handleCanvasRightClick}
          canvasRef={canvasRef}
          containerRef={containerRef}
        />

        {contextMenu.visible && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              left: contextMenu.x,
              top: contextMenu.y,
              position: "absolute",
              zIndex: 1000,
              backgroundColor: "white",
              padding: "8px",
              borderRadius: "4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canvas && contextMenu.target) {
                  canvas.bringObjectToFront(contextMenu.target);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }
              }}
            >
              Bring to front
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canvas && contextMenu.target) {
                  canvas.remove(contextMenu.target);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }
              }}
            >
              Delete object
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canvas && contextMenu.target) {
                  contextMenu.target.set({
                    fill: "black",
                  });
                  canvas.requestRenderAll();
                }
              }}
            >
              To black
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canvas && contextMenu.target) {
                  const target = contextMenu.target;
                  if (target.selectable) handleLockObject(target);
                  else handleUnlockObject(target);
                  canvas.requestRenderAll();
                }
              }}
            >
              {contextMenu.target?.selectable ? "Lock" : "Unlock"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
