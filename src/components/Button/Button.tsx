import { AriaButtonProps, useButton, useFocusRing } from "react-aria";
import { ReactNode, RefObject, useRef } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "text" | "link";
type ButtonSize = "big" | "medium" | "small";
type ButtonFill = "fixedWidth" | "hugContent" | "fillContainer";

export interface ButtonProps extends AriaButtonProps {
  children?: ReactNode;
  /**
   * Element placed before the children.
   */
  leftIcon?: ReactNode;
  /**
   * Element placed after the children.
   */
  rightIcon?: ReactNode;
  /**
   * Controls which variant of the button is shown.
   * @default primary
   */
  variant?: ButtonVariant;
  /**
   * Controls the size of the button.
   * @default medium
   */
  size?: ButtonSize;
  /**
   * @default false
   */
  isDisabled?: boolean;
  /**
   * React ref to button element.
   */
  buttonRef?: RefObject<HTMLButtonElement>;
  /**
   * HTML classes that will be added to button.
   */
  className?: string;
  /**
   * How the button controls it's width.
   * "fixedWidth" — width is set to a fixed number using `className` prop
   * "hugContent" — width is determined by button's content
   * "fillContainer" — width is determined by button's container, button will fill it
   * @default "hugContent"
   */
  fill?: ButtonFill;
}

const variantClassMap: { [_ in ButtonVariant]: string } = {
  primary:
    "text-white \
    bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 \
    hover:from-indigo-600 hover:via-violet-600 hover:to-purple-600 \
    active:from-indigo-700 active:via-violet-700 active:to-purple-700 \
    shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-violet-500/30 \
    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none \
    transition-all duration-200 ease-out \
    \
    dark:from-indigo-600 dark:via-violet-600 dark:to-purple-600 \
    dark:hover:from-indigo-500 dark:hover:via-violet-500 dark:hover:to-purple-500 \
    dark:shadow-indigo-500/20 dark:hover:shadow-violet-500/25",
  secondary:
    "text-gray-700 \
    bg-white/80 hover:bg-white active:bg-gray-50 \
    backdrop-blur-sm \
    border border-gray-200/60 hover:border-gray-300/80 \
    shadow-sm hover:shadow-md \
    disabled:text-gray-400 disabled:bg-gray-100 disabled:shadow-none \
    transition-all duration-200 \
    \
    dark:text-gray-200 \
    dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:active:bg-slate-700 \
    dark:border-slate-700/60 dark:hover:border-slate-600/80 \
    dark:disabled:text-slate-500 dark:disabled:bg-slate-800",
  tertiary:
    "text-indigo-600 \
    bg-indigo-50/80 hover:bg-indigo-100/80 active:bg-indigo-100 \
    backdrop-blur-sm \
    transition-all duration-200 \
    \
    dark:text-indigo-300 \
    dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 dark:active:bg-indigo-500/40",
  text: "text-gray-700 \
    bg-transparent hover:bg-gray-100/80 active:bg-gray-200/80 \
    transition-all duration-200 \
    \
    dark:text-gray-200 \
    dark:hover:bg-slate-700/60 dark:active:bg-slate-600/60",
  link: "text-indigo-500 hover:text-indigo-600 active:text-indigo-700 \
    bg-transparent hover:underline \
    transition-colors duration-200 \
    \
    dark:text-indigo-400 dark:hover:text-indigo-300 dark:active:text-indigo-200",
};

const iconVariantClassMap: { [_ in ButtonVariant]: string } = {
  primary:
    "text-white dark:text-white \
    group-disabled/button:text-white/60 dark:group-disabled/button:text-white/60",
  secondary:
    "text-gray-500 dark:text-gray-300 \
    group-disabled/button:text-gray-300 dark:group-disabled/button:text-slate-500",
  tertiary: "text-indigo-500 dark:text-indigo-400",
  text: "text-gray-500 dark:text-gray-300",
  link: "text-indigo-500 dark:text-indigo-400",
};

const sizeClassMap: (size: ButtonSize, variant: ButtonVariant) => string = (
  size,
  variant
) => {
  switch (size) {
    case "big":
      switch (variant) {
        case "secondary":
          return "px-[calc(theme(spacing[6])-1px)] py-[calc(theme(spacing[3])-1px)] text-p-lg font-medium";
        default:
          return "px-6 py-3 text-p-lg font-medium";
      }
    case "medium":
      switch (variant) {
        case "secondary":
          return "px-[calc(theme(spacing[5])-1px)] py-[calc(theme(spacing[2.5])-1px)] text-p-md font-medium";
        default:
          return "px-5 py-2.5 text-p-md font-medium";
      }
    case "small":
      switch (variant) {
        case "secondary":
          return "px-[calc(theme(spacing[4])-1px)] py-[calc(theme(spacing[1.5])-1px)] text-p-md font-medium";
        default:
          return "px-4 py-1.5 text-p-md font-medium";
      }
    default:
      return "";
  }
};

const iconSizeClassMap: { [_ in ButtonSize]: string } = {
  big: "h-6 w-6",
  medium: "h-5 w-5",
  small: "h-5 w-5",
};

const fillClassMap: { [_ in ButtonFill]: string } = {
  fixedWidth: "justify-between",
  hugContent: "w-auto",
  fillContainer: "w-full justify-center",
};

export function Button({
  variant = "primary",
  size = "medium",
  fill = "hugContent",
  className = "",
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonRef = ref, children } = props;

  const { isFocusVisible, focusProps } = useFocusRing();
  const focusOutlineClass = !isFocusVisible ? "outline-none" : "";

  const { buttonProps } = useButton(props, buttonRef);

  const variantClass = variantClassMap[variant];
  const iconVariantClass = iconVariantClassMap[variant];
  const sizeClass = sizeClassMap(size, variant);
  const iconSizeClass = iconSizeClassMap[size];
  const fillClass = fillClassMap[fill];

  return (
    <button
      {...buttonProps}
      {...focusProps}
      ref={buttonRef}
      className={`rounded-xl gap-2 flex flex-row items-center group/button ${variantClass} ${sizeClass} ${fillClass} ${className} ${focusOutlineClass}`}
    >
      {leftIcon && (
        <div className={`${iconSizeClass} ${iconVariantClass}`}>{leftIcon}</div>
      )}
      {children && children}
      {rightIcon && (
        <div className={`${iconSizeClass} ${iconVariantClass}`}>
          {rightIcon}
        </div>
      )}
    </button>
  );
}
