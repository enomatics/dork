import React from "react";

export default function layout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return <div>{children}</div>;
}
