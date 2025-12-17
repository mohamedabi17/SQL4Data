import { ReactNode } from "react";

type TableStyle = "default" | "zebra";

interface TableProps {
  data: ReactNode[][];
  header?: ReactNode[];
  style?: TableStyle;
  className?: string;
}

const styleToOuterDivClass: { [_ in TableStyle]: string } = {
  default: "border-l-4 border-l-indigo-400 dark:border-l-indigo-500 shadow-sm",
  zebra: "shadow-sm",
};

const styleToInnerDivClass: { [_ in TableStyle]: string } = {
  default:
    "border-r border-y border-gray-200/60 dark:border-slate-700/60 rounded-tr-xl rounded-br-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm",
  zebra: "border border-gray-200/60 dark:border-slate-700/60 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm",
};

const styleToHeaderCellClass: { [_ in TableStyle]: string } = {
  default:
    "px-[18px] py-[12px] rounded-t-xl border-gray-200/60 text-indigo-900 font-semibold bg-gradient-to-r from-indigo-50 to-violet-50 dark:border-slate-700/60 dark:text-indigo-200 dark:from-slate-800 dark:to-slate-800",
  zebra:
    "p-4 border-gray-200/60 text-indigo-900 font-semibold bg-gradient-to-r from-indigo-50/80 to-violet-50/80 dark:border-slate-700/60 dark:text-indigo-200 dark:from-indigo-500/20 dark:to-violet-500/20",
};

const styleToBodyCellClass: { [_ in TableStyle]: string } = {
  default:
    "px-[18px] py-[10px] group-last/row:rounded-b-xl border-gray-200/60 dark:border-slate-700/60 text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-slate-800/70 transition-colors duration-150",
  zebra:
    "px-4 py-3 border-gray-200/60 dark:border-slate-700/60 text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-slate-900/70 group-even/row:bg-indigo-50/30 dark:group-even/row:bg-slate-800/70 transition-colors duration-150",
};

export function Table({
  data,
  header,
  style = "default",
  className = "",
}: TableProps) {
  const outerDivClass = styleToOuterDivClass[style];
  const innerDivClass = styleToInnerDivClass[style];
  const headerCellClass = styleToHeaderCellClass[style];
  const bodyCellClass = styleToBodyCellClass[style];

  return (
    <div className={`rounded-xl ${outerDivClass} ${className}`}>
      <div className={`w-full h-full ${innerDivClass}`}>
        <table className="w-full h-full border-hidden border-collapse rounded-xl">
          {header && (
            <thead>
              <tr>
                {header.map((node, index) => (
                  <th
                    key={index}
                    className={`border text-left ${headerCellClass}`}
                  >
                    {node}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="group/row hover:bg-indigo-50/50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                {row.map((node, nodeIndex) => (
                  <td
                    key={nodeIndex}
                    className={`border border-gray-200/60 dark:border-slate-700/60 ${bodyCellClass}`}
                  >
                    {node}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
