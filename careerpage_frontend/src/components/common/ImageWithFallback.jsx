const _jsxFileName = "temp_figma\\ImageWithFallback.tsx"; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props

  return didError ? (
    React.createElement('div', {
      className: `inline-block bg-gray-100 text-center align-middle ${_nullishCoalesce(className, () => ( ''))}`,
      style: style, __self: this, __source: {fileName: _jsxFileName, lineNumber: 16}}

      , React.createElement('div', { className: "flex items-center justify-center w-full h-full"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 20}}
        , React.createElement('img', { src: ERROR_IMG_SRC, alt: "Error loading image"  , ...rest, 'data-original-url': src, __self: this, __source: {fileName: _jsxFileName, lineNumber: 21}} )
      )
    )
  ) : (
    React.createElement('img', { src: src, alt: alt, className: className, style: style, ...rest, onError: handleError, __self: this, __source: {fileName: _jsxFileName, lineNumber: 25}} )
  )
}
