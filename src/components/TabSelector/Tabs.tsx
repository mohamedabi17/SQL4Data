import { useRef } from "react";
import {
  AriaTabListProps,
  AriaTabPanelProps,
  AriaTabProps,
  useFocusRing,
  useTab,
  useTabList,
  useTabPanel,
} from "react-aria";
import { TabListState, useTabListState } from "react-stately";
import { Node } from "@react-types/shared";

interface TabSelectorProps extends AriaTabListProps<object> {
  className?: string;
}

const SELECTED_CLASS =
  "bg-white dark:bg-slate-700 shadow-md text-indigo-700 dark:text-indigo-300 rounded-lg font-semibold";
const NON_SELECTED_CLASS = "bg-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200";

export function Tabs({ className = "", ...props }: TabSelectorProps) {
  let state = useTabListState(props);
  let ref = useRef(null);
  let { tabListProps } = useTabList(props, state, ref);
  return (
    <div className={`flex flex-col ${className} ${props.orientation || ""}`}>
      <div
        className="bg-gray-100/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1.5 flex flex-row gap-1 w-full h-fit border border-gray-200/50 dark:border-slate-700/50"
        {...tabListProps}
        ref={ref}
      >
        {[...state.collection].map((item) => (
          <Tab
            key={item.key}
            item={item}
            state={state}
            orientation={props.orientation}
          />
        ))}
      </div>
      <TabPanel
        className="flex-shrink pt-4 overflow-auto h-full"
        key={state.selectedItem?.key}
        state={state}
      />
    </div>
  );
}

interface TabProps extends AriaTabProps {
  item: Node<object>;
  state: TabListState<object>;
  orientation: AriaTabListProps<object>["orientation"];
}

function Tab({ item, state, orientation }: TabProps) {
  let { key, rendered } = item;
  let ref = useRef(null);
  let { tabProps, isSelected, isDisabled } = useTab({ key }, state, ref);

  const { isFocusVisible, focusProps } = useFocusRing();
  const focusOutlineClass = !isFocusVisible ? "outline-none" : "";

  const className = isSelected ? SELECTED_CLASS : NON_SELECTED_CLASS;

  return (
    <div
      className={`overflow-x-auto flex-1 text-ellipsis text-p-md cursor-pointer\
                  px-3 py-2 text-center whitespace-nowrap ${className} ${focusOutlineClass}`}
      {...tabProps}
      {...focusProps}
      ref={ref}
    >
      {rendered}
    </div>
  );
}

interface TabPanelProps extends AriaTabPanelProps {
  state: TabListState<unknown>;
  className?: string;
}

function TabPanel({ className = "", state, ...props }: TabPanelProps) {
  let ref = useRef(null);
  let { tabPanelProps } = useTabPanel(props, state, ref);
  return (
    <div className={className} {...tabPanelProps} ref={ref}>
      {state.selectedItem?.props.children}
    </div>
  );
}
