import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { getWebSocketUrl } from "../services/api";
import {
  PencilIcon,
  TrashIcon,
  HandRaisedIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
} from "./icons";

// --- Local Icons for Whiteboard Tools ---
const RectIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </svg>
);
const CircleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);
const LineIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="5" y1="19" x2="19" y2="5" />
  </svg>
);
const EraserIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z" />
    <line x1="10" y1="8" x2="15" y2="13" />
  </svg>
);
const UndoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
  </svg>
);
const RedoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
  </svg>
);
const CursorArrowIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    <path d="M13 13l6 6" />
  </svg>
);
const TextIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 7V4h16v3" />
    <path d="M9 20h6" />
    <path d="M12 4v16" />
  </svg>
);

// --- Types ---
type ToolType =
  | "pen"
  | "eraser"
  | "line"
  | "rect"
  | "circle"
  | "pan"
  | "move"
  | "text";

interface Point {
  x: number;
  y: number;
}

interface Element {
  id: string;
  type: ToolType;
  points?: Point[]; // For pen/eraser
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number; // For shapes
  color: string;
  width: number;
  text?: string; // For text tool
}

const COLORS = [
  "#FFFFFF",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
];

// --- Helpers ---
const distance = (a: Point, b: Point) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const pointToLineDistance = (p: Point, a: Point, b: Point) => {
  const lenSq = Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
  if (lenSq === 0) return distance(p, a);

  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projection = {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  };
  return distance(p, projection);
};

const getFontSize = (width: number) => width + 12; // Helper to sync font size

const isPointInElement = (x: number, y: number, element: Element) => {
  const p = { x, y };
  const threshold = Math.max(element.width, 10); // Hit tolerance

  switch (element.type) {
    case "line":
      if (
        element.x1 === undefined ||
        element.y1 === undefined ||
        element.x2 === undefined ||
        element.y2 === undefined
      )
        return false;
      return (
        pointToLineDistance(
          p,
          { x: element.x1, y: element.y1 },
          { x: element.x2, y: element.y2 },
        ) < threshold
      );

    case "rect":
      if (
        element.x1 === undefined ||
        element.y1 === undefined ||
        element.x2 === undefined ||
        element.y2 === undefined
      )
        return false;
      const minX = Math.min(element.x1, element.x2);
      const maxX = Math.max(element.x1, element.x2);
      const minY = Math.min(element.y1, element.y2);
      const maxY = Math.max(element.y1, element.y2);
      // Check if inside rect or on border
      return (
        x >= minX - threshold &&
        x <= maxX + threshold &&
        y >= minY - threshold &&
        y <= maxY + threshold
      );

    case "circle":
      if (
        element.x1 === undefined ||
        element.y1 === undefined ||
        element.x2 === undefined ||
        element.y2 === undefined
      )
        return false;
      const radius = Math.sqrt(
        Math.pow(element.x2 - element.x1, 2) +
          Math.pow(element.y2 - element.y1, 2),
      );
      const dist = distance(p, { x: element.x1, y: element.y1 });
      return dist <= radius + threshold; // Inside circle

    case "pen":
    case "eraser":
      if (!element.points) return false;
      // Check if point is close to any segment of the path
      return element.points.some((pt, i) => {
        if (i === 0) return false;
        return pointToLineDistance(p, element.points![i - 1], pt) < threshold;
      });

    case "text":
      if (element.x1 === undefined || element.y1 === undefined || !element.text)
        return false;
      // Approximate text bounds
      const fontSize = getFontSize(element.width);
      const width = element.text.length * fontSize * 0.6;
      const height = fontSize;
      // Assume top-left origin
      return (
        x >= element.x1 &&
        x <= element.x1 + width &&
        y >= element.y1 &&
        y <= element.y1 + height
      );

    default:
      return false;
  }
};

interface WhiteboardProps {
  sessionId?: string;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ sessionId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const msgQueueRef = useRef<string[]>([]);

  // --- WebSocket Connection ---
  useEffect(() => {
    if (!sessionId) return;

    const url = getWebSocketUrl(`whiteboard/ws/${sessionId}`);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Whiteboard WS via Component Connected");
      // Flush queue
      while (msgQueueRef.current.length > 0) {
        const msg = msgQueueRef.current.shift();
        if (msg) ws.send(msg);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Only handle drawing elements — WebRTC signals are routed via App.tsx chat WebSocket
        if (data.type === "signal") {
          // Ignore signals on whiteboard WS — they are handled by the chat WS in App.tsx
          return;
        }
        // Drawing element
        setElements((prev) => {
          if (prev.some((el) => el.id === data.id)) {
            return prev.map((el) => (el.id === data.id ? data : el));
          }
          return [...prev, data];
        });
      } catch (e) {
        console.error("Error parsing WS message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);

  // State
  const [elements, setElements] = useState<Element[]>([]);
  const [history, setHistory] = useState<Element[][]>([]); // Undo stack
  const [redoStack, setRedoStack] = useState<Element[][]>([]);

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const [tool, setTool] = useState<ToolType>("pen");
  const [color, setColor] = useState(() =>
    document.documentElement.classList.contains("dark") ? "#FFFFFF" : "#0F172A"
  );

  useEffect(() => {
    setColor((prev) => {
      if (prev === "#FFFFFF" && !isDark) return "#0F172A";
      if (prev === "#0F172A" && isDark) return "#FFFFFF";
      return prev;
    });
  }, [isDark]);

  // Independent sizes for tools
  const [penSize, setPenSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(30);
  const [lineWidth, setLineWidth] = useState(5); // Current active width

  // View Transform (Zoom/Pan)
  const [transform, setTransform] = useState({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  // Interaction State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const [panStart, setPanStart] = useState<Point | null>(null);

  // Move/Select State
  const [draggingElementId, setDraggingElementId] = useState<string | null>(
    null,
  );
  const [dragStartMouse, setDragStartMouse] = useState<Point | null>(null);
  const [dragSnapshot, setDragSnapshot] = useState<Element | null>(null);
  const [hoveringElement, setHoveringElement] = useState(false);

  // Text Tool State
  const [writingText, setWritingText] = useState<{
    x: number;
    y: number;
    worldX: number;
    worldY: number;
  } | null>(null);
  const [textValue, setTextValue] = useState("");

  // Helpers to convert coordinates
  const screenToWorld = (screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (screenX - rect.left - transform.offsetX) / transform.scale,
      y: (screenY - rect.top - transform.offsetY) / transform.scale,
    };
  };

  // Update active line width when tool changes
  useEffect(() => {
    if (tool === "eraser") {
      setLineWidth(eraserSize);
    } else {
      setLineWidth(penSize);
    }
  }, [tool, eraserSize, penSize]);

  const handleSizeChange = (size: number) => {
    setLineWidth(size);
    if (tool === "eraser") {
      setEraserSize(size);
    } else {
      setPenSize(size);
    }
  };

  // Focus textarea when writing starts
  useEffect(() => {
    if (writingText && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }, [writingText]);

  const commitText = () => {
    if (writingText && textValue.trim()) {
      const newElement: Element = {
        id: Date.now().toString(),
        type: "text",
        x1: writingText.worldX,
        y1: writingText.worldY,
        text: textValue,
        color: color,
        width: lineWidth,
      };
      setHistory((prev) => [...prev, elements]);
      setElements((prev) => [...prev, newElement]);

      // Broadcast the new text element
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(newElement));
      }
    }
    setWritingText(null);
    setTextValue("");
  };

  const getAdjustedColor = (c: string) => {
    if (!isDark) {
      if (c.toUpperCase() === "#FFFFFF") return "#0F172A";
    } else {
      if (c.toUpperCase() === "#0F172A") return "#FFFFFF";
    }
    return c;
  };

  // --- Rendering ---
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Apply View Transform
    ctx.save();
    ctx.translate(transform.offsetX, transform.offsetY);
    ctx.scale(transform.scale, transform.scale);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.textBaseline = "top"; // Standardize text origin

    // Draw Grid
    const drawGrid = () => {
      if (!ctx || !canvas) return;
      ctx.save();
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)";
      ctx.lineWidth = 1;
      
      const gridSize = 40;
      const startX = Math.floor((-transform.offsetX / transform.scale) / gridSize) * gridSize;
      const startY = Math.floor((-transform.offsetY / transform.scale) / gridSize) * gridSize;
      const endX = startX + canvas.width / transform.scale + gridSize * 2;
      const endY = startY + canvas.height / transform.scale + gridSize * 2;

      for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
      ctx.restore();
    };

    drawGrid();

    const drawElement = (el: Element) => {
      ctx.beginPath();
      const adjustedColor = getAdjustedColor(el.color);
      ctx.strokeStyle = adjustedColor;
      ctx.lineWidth = el.width;
      ctx.fillStyle = adjustedColor; // For text

      if (el.type === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.globalCompositeOperation = "source-over";
      }

      if (el.type === "pen" || el.type === "eraser") {
        if (el.points && el.points.length > 0) {
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
        }
      } else if (
        el.type === "line" &&
        el.x1 !== undefined &&
        el.y1 !== undefined &&
        el.x2 !== undefined &&
        el.y2 !== undefined
      ) {
        ctx.moveTo(el.x1, el.y1);
        ctx.lineTo(el.x2, el.y2);
        ctx.stroke();
      } else if (
        el.type === "rect" &&
        el.x1 !== undefined &&
        el.y1 !== undefined &&
        el.x2 !== undefined &&
        el.y2 !== undefined
      ) {
        ctx.rect(el.x1, el.y1, el.x2 - el.x1, el.y2 - el.y1);
        ctx.stroke();
      } else if (
        el.type === "circle" &&
        el.x1 !== undefined &&
        el.y1 !== undefined &&
        el.x2 !== undefined &&
        el.y2 !== undefined
      ) {
        const radius = Math.sqrt(
          Math.pow(el.x2 - el.x1, 2) + Math.pow(el.y2 - el.y1, 2),
        );
        ctx.arc(el.x1, el.y1, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (
        el.type === "text" &&
        el.x1 !== undefined &&
        el.y1 !== undefined &&
        el.text
      ) {
        const fontSize = getFontSize(el.width);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillText(el.text, el.x1, el.y1);
      }

      ctx.globalCompositeOperation = "source-over";
    };

    // Draw saved elements
    elements.forEach(drawElement);

    // Draw element currently being created
    if (currentElement) {
      drawElement(currentElement);
    }

    ctx.restore();
  }, [elements, currentElement, transform, isDark]);

  // --- Interaction Handlers ---

  const handlePointerDown = (e: React.PointerEvent) => {
    // If we were writing text and clicked outside, commit it
    if (writingText) {
      commitText();
      return;
    }

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const point = screenToWorld(e.clientX, e.clientY);

    if (tool === "text") {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        // Store both screen coords (for input placement) and world coords (for element)
        setWritingText({
          x: e.clientX - canvasRect.left,
          y: e.clientY - canvasRect.top,
          worldX: point.x,
          worldY: point.y,
        });
      }
      return;
    }

    if (tool === "pan") {
      setPanStart({ x: e.clientX, y: e.clientY });
      setIsDrawing(true);
      return;
    }

    if (tool === "move") {
      // Find element under cursor (search backwards for top-most)
      const clickedElement = [...elements]
        .reverse()
        .find((el) => isPointInElement(point.x, point.y, el));

      if (clickedElement) {
        setDraggingElementId(clickedElement.id);
        setDragStartMouse(point);
        setDragSnapshot(clickedElement);
        setIsDrawing(true);
      }
      return;
    }

    setIsDrawing(true);

    const newElement: Element = {
      id: Date.now().toString(),
      type: tool,
      color: color,
      width: lineWidth,
    };

    if (tool === "pen" || tool === "eraser") {
      newElement.points = [point];
    } else {
      newElement.x1 = point.x;
      newElement.y1 = point.y;
      newElement.x2 = point.x; // Init with same point
      newElement.y2 = point.y;
    }

    setCurrentElement(newElement);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const point = screenToWorld(e.clientX, e.clientY);

    // Hover detection for Move tool
    if (tool === "move" && !isDrawing) {
      const hit = elements.some((el) => isPointInElement(point.x, point.y, el));
      setHoveringElement(hit);
    } else if (tool !== "move") {
      setHoveringElement(false);
    }

    if (!isDrawing) return;

    if (tool === "pan" && panStart) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setTransform((prev) => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy,
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (
      tool === "move" &&
      draggingElementId &&
      dragStartMouse &&
      dragSnapshot
    ) {
      const dx = point.x - dragStartMouse.x;
      const dy = point.y - dragStartMouse.y;

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== draggingElementId) return el;

          const newEl = { ...el };
          if (dragSnapshot.x1 !== undefined) newEl.x1 = dragSnapshot.x1 + dx;
          if (dragSnapshot.y1 !== undefined) newEl.y1 = dragSnapshot.y1 + dy;
          if (dragSnapshot.x2 !== undefined) newEl.x2 = dragSnapshot.x2 + dx;
          if (dragSnapshot.y2 !== undefined) newEl.y2 = dragSnapshot.y2 + dy;

          if (dragSnapshot.points) {
            newEl.points = dragSnapshot.points.map((p) => ({
              x: p.x + dx,
              y: p.y + dy,
            }));
          }
          return newEl;
        }),
      );
      return;
    }

    if (currentElement) {
      if (tool === "pen" || tool === "eraser") {
        setCurrentElement((prev) =>
          prev
            ? {
                ...prev,
                points: [...(prev.points || []), point],
              }
            : null,
        );
      } else {
        setCurrentElement((prev) =>
          prev
            ? {
                ...prev,
                x2: point.x,
                y2: point.y,
              }
            : null,
        );
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (tool !== "text") {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);
    setPanStart(null);

    if (tool === "move") {
      if (draggingElementId) {
        // Add to history if we actually moved something
        if (dragStartMouse) {
          const point = screenToWorld(e.clientX, e.clientY);
          if (point.x !== dragStartMouse.x || point.y !== dragStartMouse.y) {
            setHistory((prev) => [...prev, elements]);
            setRedoStack([]);

            // Broadcast the move
            const movedElement = elements.find(
              (el) => el.id === draggingElementId,
            );
            if (
              movedElement &&
              wsRef.current &&
              wsRef.current.readyState === WebSocket.OPEN
            ) {
              wsRef.current.send(JSON.stringify(movedElement));
            }
          }
        }
      }
      setDraggingElementId(null);
      setDragStartMouse(null);
      setDragSnapshot(null);
      return;
    }

    if (currentElement) {
      // Push to history before modifying elements
      setHistory((prev) => [...prev, elements]);
      setRedoStack([]); // Clear redo stack on new action
      setElements((prev) => [...prev, currentElement]);

      // Send to WS
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(currentElement));
      }

      setCurrentElement(null);
    }
  };

  // --- Actions ---

  const undo = () => {
    if (history.length === 0) return;
    const previousElements = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    setRedoStack((prev) => [elements, ...prev]);
    setElements(previousElements);
    setHistory(newHistory);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextElements = redoStack[0];
    const newRedoStack = redoStack.slice(1);

    setHistory((prev) => [...prev, elements]);
    setElements(nextElements);
    setRedoStack(newRedoStack);
  };

  const clearBoard = () => {
    setHistory((prev) => [...prev, elements]);
    setElements([]);
    setRedoStack([]);
  };

  const resetZoom = () => {
    setTransform({ scale: 1, offsetX: 0, offsetY: 0 });
  };

  const zoomIn = () => {
    setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.2, 5) }));
  };

  const zoomOut = () => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, 0.1),
    }));
  };

  // --- Effects ---

  // Handle Wheel Zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Standardize sensitivity
      const scaleAmount = -e.deltaY * 0.001;

      setTransform((prev) => {
        const newScale = Math.min(
          Math.max(0.1, prev.scale * (1 + scaleAmount)),
          5,
        );

        // Mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // World position before zoom
        const worldX = (mouseX - prev.offsetX) / prev.scale;
        const worldY = (mouseY - prev.offsetY) / prev.scale;

        // New offset to keep world position static under mouse
        const newOffsetX = mouseX - worldX * newScale;
        const newOffsetY = mouseY - worldY * newScale;

        return {
          scale: newScale,
          offsetX: newOffsetX,
          offsetY: newOffsetY,
        };
      });
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, []);

  // Handle Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;

    const resize = () => {
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    window.addEventListener("resize", resize);
    resize();

    return () => window.removeEventListener("resize", resize);
  }, []);

  const getCursor = () => {
    if (tool === "pan") return isDrawing ? "grabbing" : "grab";
    if (tool === "move") {
      if (isDrawing) return "grabbing";
      return hoveringElement ? "move" : "default";
    }
    if (tool === "text") return "text";
    if (tool === "eraser") return "crosshair";
    return "crosshair";
  };

  const currentColors = isDark ? COLORS : ["#0F172A", ...COLORS.slice(1)];

  return (
    <div className="w-full h-full relative group overflow-hidden bg-background">
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        style={{ cursor: getCursor() }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Text Input Overlay */}
      {writingText && (
        <textarea
          ref={textareaRef}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commitText();
            }
          }}
          className="absolute bg-transparent border border-sky-500/50 outline-none p-0 m-0 resize-none overflow-hidden"
          style={{
            top: writingText.y,
            left: writingText.x,
            color: getAdjustedColor(color),
            fontSize: `${getFontSize(lineWidth)}px`,
            lineHeight: 1,
            fontFamily: "sans-serif",
            minWidth: "50px",
            minHeight: "1.2em",
          }}
          placeholder="Type..."
        />
      )}

      {/* Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-[24px] border border-slate-200/10 dark:border-slate-800/10 shadow-[6px_6px_15px_rgba(163,177,198,0.35),_-6px_-6px_15px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_15px_rgba(0,0,0,0.5)] flex flex-col gap-3 items-center z-10">
        {/* Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTool("move")}
            className={`p-2 rounded-xl transition-all ${tool === "move" ? "bg-sky-600 text-white shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]" : "text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
            title="Select & Move"
          >
            <CursorArrowIcon className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button
            onClick={() => setTool("pan")}
            className={`p-2 rounded-xl transition-all ${tool === "pan" ? "bg-sky-600 text-white shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]" : "text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
            title="Pan Canvas"
          >
            <HandRaisedIcon className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button
            onClick={() => setTool("pen")}
            className={`p-2 rounded-xl transition-all ${tool === "pen" ? "bg-sky-600 text-white shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]" : "text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
            title="Pen"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-xl transition-all ${tool === "eraser" ? "bg-sky-600 text-white shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]" : "text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
            title="Eraser"
          >
            <EraserIcon className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button
            onClick={() => setTool("text")}
            className={`p-2 rounded-xl transition-all ${tool === "text" ? "bg-sky-600 text-white shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]" : "text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
            title="Text"
          >
            <TextIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool("line")}
            className={`p-2 rounded-xl transition-all ${tool === "line" ? "bg-sky-600 text-white shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]" : "text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
            title="Line"
          >
            <LineIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool("rect")}
            className={`p-2 rounded-xl transition-all ${tool === "rect" ? "bg-sky-600 text-white shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]" : "text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
            title="Rectangle"
          >
            <RectIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool("circle")}
            className={`p-2 rounded-xl transition-all ${tool === "circle" ? "bg-sky-600 text-white shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]" : "text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50"}`}
            title="Circle"
          >
            <CircleIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Second Row: Colors, Size & Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-200/10 dark:border-slate-800/10 w-full justify-between px-2">
          {/* Colors */}
          <div className="flex gap-1.5">
            {currentColors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border border-slate-200/50 dark:border-slate-700/50 transition-transform ${color === c ? "ring-2 ring-sky-500 scale-110" : "hover:scale-110"}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>

          {/* Stroke Size Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
              Size
            </span>
            <input
              type="range"
              min="1"
              max="50"
              value={lineWidth}
              onChange={(e) => handleSizeChange(parseInt(e.target.value))}
              className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              title={`Size: ${lineWidth}px`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 border-l border-slate-200/10 dark:border-slate-800/10 pl-4">
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Undo"
            >
              <UndoIcon className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Redo"
            >
              <RedoIcon className="w-4 h-4" />
            </button>
            <button
              onClick={clearBoard}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 ml-1"
              title="Clear Board"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/10 dark:border-slate-800/10 shadow-[4px_4px_10px_rgba(163,177,198,0.25),_-4px_-4px_10px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.4)] z-10">
        <button
          onClick={zoomIn}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
          title="Zoom In"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
        <button
          onClick={resetZoom}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
          title="Reset Zoom"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
        <button
          onClick={zoomOut}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
          title="Zoom Out"
        >
          <MinusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Current Zoom Indicator */}
      <div className="absolute top-4 left-4 pointer-events-none opacity-50 text-xs text-text-muted font-mono z-10">
        {Math.round(transform.scale * 100)}%
      </div>
    </div>
  );
};

export default Whiteboard;
