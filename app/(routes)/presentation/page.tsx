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

    const guideLines: fabric.Line[] = [];

    // Helper to draw guide lines
    const drawGuideLine = (
      canvas: fabric.Canvas,
      coords: [number, number, number, number]
    ) => {
      const line = new fabric.Line(coords, {
        stroke: "rgba(0, 122, 255, 0.6)",
        strokeWidth: 1,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });

      guideLines.push(line);
      canvas.add(line);
    };

    // Helper to clear all guide lines
    const clearGuidelnes = (canvas: fabric.Canvas) => {
      guideLines.forEach((line) => canvas.remove(line));
      guideLines.length = 0;
    };

    const gridSize = 5;
    const snapTreshold = 5;
    const canvasCenter = {
      x: initCanvas.getWidth() / 2,
      y: initCanvas.getHeight() / 2,
    };

    initCanvas.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj) return;

      clearGuidelnes(initCanvas);

      // Snap to grid
      obj.set({
        left: Math.round(obj.left! / gridSize) * gridSize,
        top: Math.round(obj.top! / gridSize) * gridSize,
      });

      // Snap to canvas center
      const objCenter = obj.getCenterPoint();
      const objBounds = obj.getBoundingRect();

      const dx = Math.abs(objCenter.x - canvasCenter.x);
      const dy = Math.abs(objCenter.y - canvasCenter.y);

      if (dx < snapTreshold) {
        drawGuideLine(initCanvas, [
          canvasCenter.x,
          0,
          canvasCenter.x,
          initCanvas.getHeight(),
        ]);
        obj.left = canvasCenter.x - obj.getScaledWidth() / 2;
      }

      if (dy < snapTreshold) {
        drawGuideLine(initCanvas, [
          0,
          canvasCenter.y,
          initCanvas.getWidth(),
          canvasCenter.y,
        ]);
        obj.top = canvasCenter.y - obj.getScaledHeight() / 2;
      }

      // Snap to other objects
      initCanvas.getObjects().forEach((other) => {
        if (other === obj) return;

        const otherBounds = other.getBoundingRect();
        const otherCenter = other.getCenterPoint();

        // Snap center-to-center
        const objectCenterdx = Math.abs(objCenter.x - otherCenter.x);
        const objectCenterdy = Math.abs(objCenter.y - otherCenter.y);
        const objectdL = Math.abs(objBounds.left - otherBounds.left);
        const objectdR = Math.abs(
          objBounds.left +
            objBounds.width -
            (otherBounds.left + otherBounds.width)
        );

        if (objectCenterdx < snapTreshold) {
          drawGuideLine(initCanvas, [
            otherCenter.x,
            0,
            otherCenter.x,
            initCanvas.getHeight(),
          ]);
          obj.left = otherCenter.x - obj.getScaledWidth() / 2;
        }

        if (objectCenterdy < snapTreshold) {
          drawGuideLine(initCanvas, [
            0,
            otherCenter.y,
            initCanvas.getWidth(),
            otherCenter.y,
          ]);
          obj.top = otherCenter.y - obj.getScaledHeight() / 2;
        }

        // Snap left-to-left
        if (objectdL < snapTreshold) {
          drawGuideLine(initCanvas, [
            otherBounds.left,
            0,
            otherBounds.left,
            initCanvas.getHeight(),
          ]);
        }

        // Snap right-to-right
        if (objectdR < snapTreshold) {
          const rightX = otherBounds.left + otherBounds.width;
          drawGuideLine(initCanvas, [
            rightX,
            0,
            rightX,
            initCanvas.getHeight(),
          ]);
          obj.left = rightX - objBounds.width;
        }

        // Snap left-to-right
        if (
          Math.abs(objBounds.left - (otherBounds.left + otherBounds.width)) <
          snapTreshold
        ) {
          const alignX = otherBounds.left + otherBounds.width;
          drawGuideLine(initCanvas, [
            alignX,
            0,
            alignX,
            initCanvas.getHeight(),
          ]);
          obj.left = alignX;
        }

        // Snap right-to-left
        if (
          Math.abs(objBounds.left + objBounds.width - otherBounds.left) <
          snapTreshold
        ) {
          const alignX = otherBounds.left;
          drawGuideLine(initCanvas, [
            alignX,
            0,
            alignX,
            initCanvas.getHeight(),
          ]);
          obj.left = alignX - objBounds.width;
        }

        // Snap top-to-top
        if (Math.abs(objBounds.top - otherBounds.top) < snapTreshold) {
          drawGuideLine(initCanvas, [
            0,
            otherBounds.top,
            initCanvas.getWidth(),
            otherBounds.top,
          ]);
          obj.top = otherBounds.top;
        }

        // Snap bottom-to-bottom
        if (
          Math.abs(
            objBounds.top +
              objBounds.height -
              (otherBounds.top + otherBounds.height)
          ) < snapTreshold
        ) {
          const y = otherBounds.top + otherBounds.height;
          drawGuideLine(initCanvas, [0, y, initCanvas.getWidth(), y]);
          obj.top = y - objBounds.height;
        }

        // Snap top-to-bottom
        if (
          Math.abs(objBounds.top - (otherBounds.top + otherBounds.height)) <
          snapTreshold
        ) {
          const y = otherBounds.top + otherBounds.height;
          drawGuideLine(initCanvas, [0, y, initCanvas.getWidth(), y]);
          obj.top = y;
        }

        // Snap bottom-to-top
        if (
          Math.abs(objBounds.top + objBounds.height - otherBounds.top) <
          snapTreshold
        ) {
          const y = otherBounds.top;
          drawGuideLine(initCanvas, [0, y, initCanvas.getWidth(), y]);
          obj.top = y - objBounds.height;
        }
      });

      obj.setCoords();
    });

    initCanvas.on("object:modified", () => {
      clearGuidelnes(initCanvas);
    });

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
          height: 100,
          width: 100,
          fill: currColor,
        });
        break;
      case "rectangle":
        shape = new fabric.Rect({
          height: 100,
          width: 150,
          fill: currColor,
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          height: 100,
          width: 116,
          fill: currColor,
        });
        break;
      case "ellipse":
        shape = new fabric.Ellipse({
          height: 100,
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
