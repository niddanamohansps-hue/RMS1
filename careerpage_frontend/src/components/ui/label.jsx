const _jsxFileName = "c:\\Users\\Souradip Roy\\Documents\\RecruitmentManagement\\Recruitment_Management-SPS\\careerpage figma\\src\\app\\components\\ui\\label.tsx";"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "./utils";

function Label({
  className,
  ...props
}) {
  return (
    React.createElement(LabelPrimitive.Root, {
      'data-slot': "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      ),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 13}}
    )
  );
}

export { Label };
