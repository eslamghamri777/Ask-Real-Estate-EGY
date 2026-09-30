import * as React from "react"

const MOBILE_BREAKPOINT = 768

/** Subscribe to a media query without setState-in-effect cascades. */
function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    [query],
  )
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}
