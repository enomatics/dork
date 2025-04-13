import React from "react";
import { Button } from "./ui/button";

export default function PresentationHeader() {
  return (
    <header className="p-4 flex justify-between items-center border-b">
      <Button>Back to home</Button>

      {/* TODO: Add the user profile here */}
      <div>Image</div>
    </header>
  );
}
