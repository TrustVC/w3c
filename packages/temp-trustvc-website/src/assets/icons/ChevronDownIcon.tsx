import React from 'react'

interface ChevronDownIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  fillColor?: string
}

const ChevronDownIcon: React.FC<ChevronDownIconProps> = ({
  className,
  fillColor = '#5B6571',
  ...props
}) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M6.7 9.7a1 1 0 0 1 1.4 0L12 13.6l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 11.1a1 1 0 0 1 0-1.4Z"
      fill={fillColor}
    />
  </svg>
)

export default ChevronDownIcon

