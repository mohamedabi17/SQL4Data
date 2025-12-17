import { useRef } from "react";
import { AriaTextFieldOptions, useFocusRing, useTextField } from "react-aria";
import { CheckCircleIcon } from "../../assets/icons/CheckCircleIcon";
import { XCircleIcon } from "../../assets/icons/XCircleIcon";

export type TextAreaStatus = "DEFAULT" | "SUCCESS" | "FAIL";

interface TextAreaProps extends AriaTextFieldOptions<"textarea"> {
  status?: TextAreaStatus;
  statusDescription?: string;
  className?: string;
}

const statusToClassMap: { [_ in TextAreaStatus]: string } = {
  DEFAULT:
    "shadow-sm border border-gray-200/60 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 bg-white/80 backdrop-blur-sm \
    placeholder:text-gray-400 text-gray-800 \
    transition-all duration-200 \
    \
    dark:border-slate-700/60 dark:focus:border-indigo-500 dark:focus:ring-indigo-400/20 dark:bg-slate-900/80 \
    dark:placeholder:text-slate-500 dark:text-gray-100",
  SUCCESS:
    "shadow-md ring-2 ring-emerald-500/30 border border-emerald-300/60 bg-emerald-50/50 backdrop-blur-sm \
    placeholder:text-gray-500 text-gray-800 \
    transition-all duration-200 \
    \
    dark:ring-emerald-500/20 dark:border-emerald-600/40 dark:bg-emerald-950/30 \
    dark:placeholder:text-slate-400 dark:text-gray-100",
  FAIL: "shadow-md ring-2 ring-rose-500/30 border border-rose-300/60 bg-rose-50/50 backdrop-blur-sm \
    placeholder:text-gray-500 text-gray-800 \
    transition-all duration-200 \
    \
    dark:ring-rose-500/20 dark:border-rose-600/40 dark:bg-rose-950/30 \
    dark:placeholder:text-slate-400 dark:text-gray-100",
};
const statusToDescriptionTextClassMap: { [_ in TextAreaStatus]: string } = {
  DEFAULT: "",
  SUCCESS: "text-emerald-700 dark:text-emerald-300 font-medium",
  FAIL: "text-rose-700 dark:text-rose-300 font-medium",
};

export function TextArea(props: TextAreaProps) {
  const {
    label,
    status = "DEFAULT",
    statusDescription = null,
    className = "",
  } = props;

  const { focusProps } = useFocusRing();

  const ref = useRef(null);
  const { inputProps } = useTextField(
    {
      "aria-label": label?.toString(),
      inputElementType: "textarea",
      ...props,
    },
    ref
  );

  const statusClass = statusToClassMap[status];
  const descriptionClass = statusDescription ? "border-b-[36px]" : "";
  const descriptionTextClass = statusDescription
    ? statusToDescriptionTextClassMap[status]
    : "";

  return (
    <div className={`relative w-full ${className}`}>
      <textarea
        {...inputProps}
        {...focusProps}
        ref={ref}
        className={`w-full h-full rounded-xl p-4 resize-none font-mono outline-none ${statusClass} \
                    ${descriptionClass}`}
      />
      {status !== "DEFAULT" && statusDescription && (
        <div
          className={`absolute bottom-0 left-0 right-0 h-9 px-4 flex flex-row gap-2.5 justify-start items-center`}
        >
          {status === "SUCCESS" && (
            <CheckCircleIcon
              className={`w-5 h-5 text-emerald-600 dark:text-emerald-400`}
            />
          )}
          {status === "FAIL" && (
            <XCircleIcon className={`w-5 h-5 text-rose-500 dark:text-rose-400`} />
          )}
          <span className={descriptionTextClass}>{statusDescription}</span>
        </div>
      )}
    </div>
  );
}
