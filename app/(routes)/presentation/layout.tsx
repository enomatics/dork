import PresentationHeader from "@/components/PresentationHeader";
import Sidebar from "@/components/Sidebar";
import React from "react";

export default function layout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return (
    <div>
      <PresentationHeader />

      <div className="flex">
        <Sidebar />
        {children}
      </div>
    </div>
  );
}
