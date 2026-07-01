const _jsxFileName = "c:\\Users\\Souradip Roy\\Documents\\RecruitmentManagement\\Recruitment_Management-SPS\\careerpage figma\\src\\app\\components\\ui\\separator.tsx";"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "./utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return (
    React.createElement(SeparatorPrimitive.Root, {
      'data-slot': "separator-root",
      decorative: decorative,
      orientation: orientation,
      className: cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      ),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 15}}
    )
  );
}

export { Separator };
