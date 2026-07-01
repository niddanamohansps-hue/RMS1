const _jsxFileName = "c:\\Users\\Souradip Roy\\Documents\\RecruitmentManagement\\Recruitment_Management-SPS\\careerpage figma\\src\\app\\components\\ui\\avatar.tsx";"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "./utils";

function Avatar({
  className,
  ...props
}) {
  return (
    React.createElement(AvatarPrimitive.Root, {
      'data-slot': "avatar",
      className: cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      ),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 13}}
    )
  );
}

function AvatarImage({
  className,
  ...props
}) {
  return (
    React.createElement(AvatarPrimitive.Image, {
      'data-slot': "avatar-image",
      className: cn("aspect-square size-full", className),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 29}}
    )
  );
}

function AvatarFallback({
  className,
  ...props
}) {
  return (
    React.createElement(AvatarPrimitive.Fallback, {
      'data-slot': "avatar-fallback",
      className: cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      ),
      ...props, __self: this, __source: {fileName: _jsxFileName, lineNumber: 42}}
    )
  );
}

export { Avatar, AvatarImage, AvatarFallback };
