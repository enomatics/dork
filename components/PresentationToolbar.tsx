import { Button } from "./ui/button";

export default function PresentationToolbar({
  onAddShape,
  onAddText,
}: {
  onAddShape: (
    type: "circle" | "square" | "rectangle" | "triangle" | "ellipse"
  ) => void;
  onAddText: () => void;
}) {
  return (
    <header className="p-4 flex justify-between items-center border-b">
      <Button>Back to home</Button>

      <div>
        <Button onClick={onAddText}>Text</Button>
        <Button onClick={() => onAddShape("circle")}>Circle</Button>
        <Button onClick={() => onAddShape("square")}>Square</Button>
        <Button onClick={() => onAddShape("rectangle")}>Rectangle</Button>
        <Button onClick={() => onAddShape("triangle")}>Triangle</Button>
        <Button onClick={() => onAddShape("ellipse")}>Ellipse</Button>
      </div>

      <div>Image</div>
    </header>
  );
}
