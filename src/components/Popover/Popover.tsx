import React, { ReactNode, RefObject, useRef } from "react";
import {
  DismissButton,
  Overlay,
  usePopover,
  AriaPopoverProps,
  useFocusRing,
} from "react-aria";
import { OverlayTriggerState } from "react-stately";

interface PopoverProps extends Omit<AriaPopoverProps, "popoverRef"> {
  children: ReactNode;
  state: OverlayTriggerState;
  popoverRef?: RefObject<HTMLDivElement>;
}

export function Popover(props: PopoverProps) {
  let ref = useRef<HTMLDivElement>(null);

  const { isFocusVisible, focusProps } = useFocusRing();
  const focusOutlineClass = !isFocusVisible ? "outline-none" : "";

  let { popoverRef = ref, state, children, isNonModal } = props;
  let { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      popoverRef,
    },
    state
  );

  return (
    <Overlay>
      {isNonModal && <div {...underlayProps} className="fixed inset-0" />}
      <div
        {...popoverProps}
        {...focusProps}
        className={`rounded-xl p-1.5 border shadow-xl backdrop-blur-xl \
        bg-white/95 border-gray-200/60 text-gray-800 \
        dark:bg-slate-800/95 dark:border-slate-700/60 dark:text-gray-100 \
        animate-scale-in ${focusOutlineClass}`}
        ref={popoverRef as RefObject<HTMLDivElement>}
      >
        {!isNonModal && <DismissButton onDismiss={state.close} />}
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
}
