import { RefObject, useEffect } from "react";

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
) {
  useEffect(
    () => {
      const handle = (event: MouseEvent) => {
        if (!ref.current) {
          return;
        }
        // if click was not inside of the element. "!" means not
        // in other words, if click is outside the modal element
        if (!ref?.current?.contains(event.target as Node)) {
          handler();
        }
      };
      document.addEventListener("click", handle, true);
      return () => {
        document.removeEventListener("click", handle);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler],
  );
}
