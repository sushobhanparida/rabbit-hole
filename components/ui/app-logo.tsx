interface AppLogoProps {
  className?: string
}

export function AppLogo({ className }: AppLogoProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M20 28c-4.97 0-9-2.46-9-5.5S15.03 17 20 17s9 2.46 9 5.5S24.97 28 20 28Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16 20.5c0-2.21 1.79-4 4-4s4 1.79 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12.5 13.5c.5-1.5 2-2.5 3.5-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M27.5 13.5c-.5-1.5-2-2.5-3.5-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <ellipse cx="18" cy="21" rx="1.2" ry="1.5" fill="currentColor" />
      <ellipse cx="22" cy="21" rx="1.2" ry="1.5" fill="currentColor" />
      <path
        d="M18 24c1 .8 3 .8 4 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
