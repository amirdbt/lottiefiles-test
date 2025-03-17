import React from "react";

const Tooltip = ({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) => (
  <div className="group relative">
    {children}
    <div className="absolute bottom-full mb-2 hidden w-max rounded-md bg-black px-2 py-1 text-xs text-white group-hover:block">
      {text}
    </div>
  </div>
);

export default Tooltip;
