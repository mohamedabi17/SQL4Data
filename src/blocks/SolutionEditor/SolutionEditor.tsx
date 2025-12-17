import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Item } from "react-stately";
import { QueryExecResult } from "sql.js";
import {
  DbColumnAttribute,
  DbTable,
  DbColumnAttributeRef,
} from "../../assets/databases/databases";
import { CloseIcon } from "../../assets/icons/CloseIcon";
import { Task, tasksList } from "../../assets/tasks/tasks";
import { Button } from "../../components/Button/Button";
import { Chip } from "../../components/Chip/Chip";
import { ChipTooltip } from "../../components/ChipTooltip/ChipTooltip";
import { Dialog } from "../../components/Dialog/Dialog";
import { ModalButton } from "../../components/ModalButton/ModalButton";
import { Table } from "../../components/Table/Table";
import { Tabs } from "../../components/TabSelector/Tabs";
import { TextArea, TextAreaStatus } from "../../components/TextArea/TextArea";
import { SolutionStatus } from "../../store/reducers/solutionsReducer";
import { ExpectedQueryResults } from "../ExpectedQueryResults/ExpectedQueryResults";
import { UserQueryResults } from "../UserQueryResults/UserQueryResults";
import { AIFeedback } from "../../components/AIFeedback/AIFeedback";
import { HintPanel } from "../../components/HintPanel/HintPanel";
import { IDELayout, TabPanel, ResizablePanel, MobileIDELayout } from "../../components/IDELayout/IDELayout";

interface SolutionEditorProps {
  selectedTask: Task["id"] | null;
  taskTables: DbTable[];
  expectedTable: QueryExecResult[] | null;
  userResultTable: QueryExecResult[] | null;
  status: SolutionStatus;
  onAnswerCheck: () => void;
  textAreaValue: string;
  onChangeTextArea: (value: string) => void;
  onSelectNextTask: () => void;
  errorMessage?: string;
  currentHintLevel: number;
  solutionShown: boolean;
  onUseHint: (level: number) => void;
  onShowSolution: () => void;
  onShowAdModal?: (type: 'ai_feedback' | 'hint' | 'solution') => void;
}

interface ChipAttributeProps {
  attr: DbColumnAttribute;
}

interface FKTooltipProps {
  reference: DbColumnAttributeRef;
}

interface TaskDescriptionProps {
  task: Task | null;
}

interface StructureTablesProps {
  taskTables: DbTable[];
  onClose?: () => void;
  className?: string;
}

interface TaskTextareaProps {
  status: SolutionStatus;
  value: string;
  onChangeValue: (text: string) => void;
}

interface SolutionButtonsProps {
  expectedTable: QueryExecResult[] | null;
  userResultTable: QueryExecResult[] | null;
  onAnswerCheck: () => void;
  status: SolutionStatus;
  onSelectNextTask: () => void;
  isLastIndex: boolean;
}

interface ExpectedResultFrameProps {
  onClose: () => void;
  expectedTable: QueryExecResult[] | null;
  userResultTable: QueryExecResult[] | null;
}

function PKTooltip() {
  const { t } = useTranslation();

  return (
    <span className="whitespace-nowrap text-p-md font-semibold text-gray-100">
      {t("primary_key")}
    </span>
  );
}

function FKTooltip({ reference }: FKTooltipProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <span className="pb-2 whitespace-nowrap text-p-md font-semibold text-gray-100">
        {t("foreign_key_to")}
      </span>
      <div className="pb-1.5 flex flex-row gap-1">
        <span className="text-sub text-gray-300">
          {t("foreign_key_to_table")}
        </span>
        <span className="text-sub text-gray-50">{reference.table}</span>
      </div>
      <div className="flex flex-row gap-1">
        <span className="text-sub text-gray-300">
          {t("foreign_key_to_column")}
        </span>
        <span className="text-sub text-gray-50">{reference.column}</span>
      </div>
    </div>
  );
}

function ChipAttribute({ attr }: ChipAttributeProps) {
  const { t } = useTranslation();

  const { type, reference } = attr;

  const Tooltip =
    type === "PK" || !reference ? (
      <PKTooltip />
    ) : (
      <FKTooltip reference={reference} />
    );

  return (
    <ChipTooltip
      key={type}
      style="lightblue"
      aria-label={t("column_property")}
      delay={0}
      tooltip={Tooltip}
    >
      {type}
    </ChipTooltip>
  );
}

function TaskDescription({ task }: TaskDescriptionProps) {
  const { t } = useTranslation();

  return (
    <>
      {task && (
        <>
          <span className="mb-2 font-bold text-p-lg bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
            {t(`topics.${task.topic}`)}
          </span>
          <span className="mb-6 text-p-lg text-gray-700 dark:text-gray-200 leading-relaxed">
            {t(`tasks.${task.id}`)}
          </span>
        </>
      )}
      {!task && (
        <>
          <div className="w-[50%] h-[20px] mb-3 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-full animate-pulse" />
          <div className="w-full h-[14px] mb-2 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-full animate-pulse" />
          <div className="w-full h-[14px] mb-2 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-full animate-pulse" />
          <div className="w-[70%] h-[14px] mb-6 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-full animate-pulse" />
        </>
      )}
    </>
  );
}

function SkeletonTable() {
  return (
    <Table
      className="w-full max-w-full sm:max-w-[390px]"
      header={[<div className="w-full max-w-[210px] h-4 bg-gray-200 rounded-[100px]" />]}
      data={[
        [<div className="w-full max-w-[340px] h-3 bg-gray-200 rounded-[100px]" />],
        [<div className="w-full max-w-[340px] h-3 bg-gray-200 rounded-[100px]" />],
        [<div className="w-full max-w-[340px] h-3 bg-gray-200 rounded-[100px]" />],
        [<div className="w-full max-w-[340px] h-3 bg-gray-200 rounded-[100px]" />],
        [<div className="w-full max-w-[340px] h-3 bg-gray-200 rounded-[100px]" />],
        [<div className="w-full max-w-[340px] h-3 bg-gray-200 rounded-[100px]" />],
        [<div className="w-full max-w-[340px] h-3 bg-gray-200 rounded-[100px]" />],
        [<div className="w-full max-w-[340px] h-3 bg-gray-200 rounded-[100px]" />],
        [<div className="w-full max-w-[340px] h-3 bg-gray-200 rounded-[100px]" />],
        [<div className="w-full max-w-[340px] h-3 bg-gray-200 rounded-[100px]" />],
        [<div className="w-full max-w-[340px] h-3 bg-gray-200 rounded-[100px]" />],
      ]}
    />
  );
}

function StructureTables({
  taskTables,
  onClose,
  className = "",
}: StructureTablesProps) {
  const { t } = useTranslation();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef?.current?.scroll({ top: 0 });
  }, [taskTables]);

  return (
    <div
      className={`flex flex-col px-3 xs:px-4 sm:px-6 pb-6 md:pb-0 w-full md:h-full ${className}`}
    >
      <div className="h-full flex flex-col">
        <div className="flex flex-row py-4 sm:py-6 items-center justify-between">
          <div className="flex flex-row gap-2">
            <>
              <span className="text-sm sm:text-p-lg font-bold text-gray-900 dark:text-gray-200">
                {t("tables_description")}
              </span>
              <Chip style="white" aria-label={t("amount_of_tables")}>
                {taskTables.length}
              </Chip>
            </>
          </div>
          {onClose && (
            <Button
              variant="text"
              size="big"
              leftIcon={<CloseIcon />}
              className="!p-0"
              onPress={onClose}
            />
          )}
        </div>
        <div
          ref={scrollRef}
          className="items-center md:pb-6 h-full overflow-y-auto"
        >
          <div className="w-full flex flex-col gap-3 pr-2 sm:pr-3 items-center">
            {taskTables?.map(({ name, columns }) => (
              <Table
                className="w-full max-w-full sm:max-w-[390px]"
                key={name}
                header={[name]}
                data={
                  columns?.map(({ name, attributes }) => [
                    <div key={name} className="flex flex-row justify-between">
                      <span>{name}</span>
                      <div className="flex flex-row gap-2">
                        {attributes.map((attr) => (
                          <ChipAttribute key={attr.type} attr={attr} />
                        ))}
                      </div>
                    </div>,
                  ]) || []
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskTextarea({ status, value, onChangeValue }: TaskTextareaProps) {
  const { t } = useTranslation();

  let textAreaStatus: TextAreaStatus;
  let textAreaDescription: string | undefined = undefined;
  switch (status) {
    case "UNKNOWN":
    case "PROCESSING": {
      textAreaStatus = "DEFAULT";
      break;
    }
    case "CORRECT": {
      textAreaStatus = "SUCCESS";
      textAreaDescription = t("correct_answer") || undefined;
      break;
    }
    case "INCORRECT": {
      textAreaStatus = "FAIL";
      textAreaDescription = t("incorrect_answer") || undefined;
      break;
    }
  }

  return (
    <TextArea
      label={t("sql_textarea_label")}
      placeholder={t("sql_textarea_placeholder") || undefined}
      className="mb-4 h-full max-h-[580px]"
      status={textAreaStatus}
      statusDescription={textAreaDescription}
      value={value}
      onChange={onChangeValue}
    />
  );
}

function ExpectedResultFrame({
  onClose,
  expectedTable,
  userResultTable,
}: ExpectedResultFrameProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full h-[85vh] max-h-screen">
      <div className="relative flex flex-row w-full justify-between items-center py-2 px-3 xs:px-4 sm:px-6">
        <span className="text-gray-900 dark:text-gray-200 text-h5 font-bold">
          {t("outputs")}
        </span>
        <Button
          size="big"
          variant="text"
          leftIcon={<CloseIcon />}
          onPress={onClose}
        />
        <div className="absolute left-[-100vw] bottom-0 w-[200vw] border-b border-solid border-gray-200 dark:border-gray-700"></div>
      </div>
      <div className="md:hidden flex flex-col px-3 xs:px-4 sm:px-6 py-4 h-[calc(100%-64px)] overflow-hidden">
        <Tabs className="h-full">
          <Item key="userQuery" title={t("your_outputs")}>
            <UserQueryResults table={userResultTable} />
          </Item>
          <Item key="expectedQuery" title={t("expected_output")}>
            <ExpectedQueryResults table={expectedTable} />
          </Item>
        </Tabs>
      </div>
      <div className="hidden md:flex flex-row pt-6 pb-10 px-3 sm:px-6 gap-4 lg:gap-6 h-[calc(100%-64px)] overflow-hidden">
        <div className="flex flex-col w-[calc(50%-0.75rem)]">
          <span className="text-gray-900 dark:text-gray-200 text-p-lg font-bold mb-4">
            {t("your_outputs")}
          </span>
          <UserQueryResults table={userResultTable} />
        </div>
        <div className="flex flex-col w-[calc(50%-0.75rem)]">
          <span className="text-gray-900 dark:text-gray-200 text-p-lg font-bold mb-4">
            {t("expected_output")}
          </span>
          <ExpectedQueryResults table={expectedTable} />
        </div>
      </div>
    </div>
  );
}

function SolutionButtons({
  expectedTable,
  userResultTable,
  onAnswerCheck,
  status,
  onSelectNextTask,
  isLastIndex,
}: SolutionButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <>
        <ModalButton
          buttonProps={{
            variant: "tertiary",
            size: "big",
            fill: "fillContainer",
            className: "px-3",
            children: t("show_expected_result"),
          }}
          isDismissable={true}
          position="bottomFullWidth"
        >
          {(onClose) => (
            <Dialog>
              <ExpectedResultFrame
                onClose={onClose}
                expectedTable={expectedTable}
                userResultTable={userResultTable}
              />
            </Dialog>
          )}
        </ModalButton>
        {(status === "UNKNOWN" || status === "PROCESSING") && (
          <Button
            variant="primary"
            size="big"
            fill="fillContainer"
            onPress={onAnswerCheck}
            isDisabled={status === "PROCESSING"}
          >
            {t("check_answer")}
          </Button>
        )}
        {status === "CORRECT" && (
          <Button
            variant="primary"
            size="big"
            fill="fillContainer"
            onPress={onSelectNextTask}
            isDisabled={isLastIndex}
            className="!from-emerald-500 !via-emerald-500 !to-teal-500 hover:!from-emerald-600 hover:!via-emerald-600 hover:!to-teal-600 !shadow-emerald-500/25 hover:!shadow-emerald-500/30"
          >
            {t("next_task")}
          </Button>
        )}
        {status === "INCORRECT" && (
          <Button
            variant="primary"
            size="big"
            fill="fillContainer"
            onPress={onAnswerCheck}
            className="!from-rose-500 !via-rose-500 !to-red-500 hover:!from-rose-600 hover:!via-rose-600 hover:!to-red-600 !shadow-rose-500/25 hover:!shadow-rose-500/30"
            isDisabled={true}
          >
            {t("error_info")}
          </Button>
        )}
      </>
    </div>
  );
}

export function SolutionEditor({
  selectedTask,
  taskTables = [],
  expectedTable,
  userResultTable,
  status,
  onAnswerCheck,
  textAreaValue,
  onChangeTextArea,
  onSelectNextTask,
  errorMessage,
  currentHintLevel,
  solutionShown,
  onUseHint,
  onShowSolution,
  onShowAdModal,
}: SolutionEditorProps) {
  const { t } = useTranslation();
  const task = tasksList.find(({ id }) => id === selectedTask) || null;
  const taskIndex =
    tasksList.findIndex(({ id }) => id === selectedTask) || null;

  // Left Panel Tabs Configuration
  const leftPanelTabs = [
    {
      id: "description",
      label: t("task_description") || "Description",
      icon: "📝",
      content: (
        <div className="p-4 space-y-4">
          <TaskDescription task={task} />

          {/* AI Feedback in Description Tab */}
          <AIFeedback
            query={textAreaValue}
            taskId={selectedTask || ''}
            errorMessage={errorMessage}
            isVisible={status === "INCORRECT"}
          />

          {/* Error Message */}
          {errorMessage && status === "INCORRECT" && (
            <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40">
              <div className="flex items-start gap-2">
                <span className="text-rose-500">⚠️</span>
                <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "schema",
      label: t("tables_description") || "Schema",
      icon: "🗃️",
      badge: taskTables.length,
      content: (
        <StructureTables taskTables={taskTables} className="h-full" />
      ),
    },
    {
      id: "hints",
      label: t("hints.title") || "Hints",
      icon: "💡",
      badge: currentHintLevel > 0 ? currentHintLevel : undefined,
      content: (
        <div className="p-4">
          {status !== "CORRECT" ? (
            <HintPanel
              task={task}
              currentHintLevel={currentHintLevel}
              solutionShown={solutionShown}
              onHintUsed={onUseHint}
              onShowSolution={onShowSolution}
            />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <span className="text-4xl mb-2 block">🎉</span>
              <p>{t("correct_answer")}</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  // Editor Component
  const EditorContent = (
    <div className="h-full flex flex-col p-4">
      <TaskTextarea
        status={status}
        value={textAreaValue}
        onChangeValue={onChangeTextArea}
      />
    </div>
  );

  // Console/Output Component
  const ConsoleContent = (
    <div className="h-full flex flex-col bg-slate-900 dark:bg-black">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {t("outputs")}
          </span>
          {status === "CORRECT" && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <span>✓</span> {t("correct_answer")}
            </span>
          )}
          {status === "INCORRECT" && (
            <span className="flex items-center gap-1 text-xs text-rose-400">
              <span>✗</span> {t("incorrect_answer")}
            </span>
          )}
        </div>
      </div>

      {/* Console Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs className="h-full console-tabs">
          <Item key="userQuery" title={t("your_outputs")}>
            <div className="h-full overflow-auto p-4 bg-slate-900 dark:bg-black">
              <UserQueryResults table={userResultTable} />
            </div>
          </Item>
          <Item key="expectedQuery" title={t("expected_output")}>
            <div className="h-full overflow-auto p-4 bg-slate-900 dark:bg-black">
              <ExpectedQueryResults table={expectedTable} />
            </div>
          </Item>
        </Tabs>
      </div>
    </div>
  );

  // Action Buttons
  const ActionButtons = (
    <div className="flex items-center gap-3">
      <ModalButton
        buttonProps={{
          variant: "tertiary",
          size: "medium",
          className: "text-sm",
          children: (
            <span className="flex items-center gap-2">
              <span>👁️</span> {t("show_expected_result")}
            </span>
          ),
        }}
        isDismissable={true}
        position="bottomFullWidth"
      >
        {(onClose) => (
          <Dialog>
            <ExpectedResultFrame
              onClose={onClose}
              expectedTable={expectedTable}
              userResultTable={userResultTable}
            />
          </Dialog>
        )}
      </ModalButton>

      <div className="flex-1" />

      {(status === "UNKNOWN" || status === "PROCESSING") && (
        <Button
          variant="primary"
          size="medium"
          onPress={onAnswerCheck}
          isDisabled={status === "PROCESSING"}
          className="min-w-[120px] sm:min-w-[140px]"
        >
          <span className="flex items-center gap-2">
            <span>▶️</span> {t("check_answer")}
          </span>
        </Button>
      )}
      {status === "CORRECT" && (
        <Button
          variant="primary"
          size="medium"
          onPress={onSelectNextTask}
          isDisabled={taskIndex === tasksList.length - 1}
          className="min-w-[120px] sm:min-w-[140px] !from-emerald-500 !via-emerald-500 !to-teal-500 hover:!from-emerald-600 hover:!via-emerald-600 hover:!to-teal-600"
        >
          <span className="flex items-center gap-2">
            <span>→</span> {t("next_task")}
          </span>
        </Button>
      )}
      {status === "INCORRECT" && (
        <Button
          variant="primary"
          size="medium"
          onPress={onAnswerCheck}
          className="min-w-[120px] sm:min-w-[140px] !from-rose-500 !via-rose-500 !to-red-500"
        >
          <span className="flex items-center gap-2">
            <span>🔄</span> {t("check_answer")}
          </span>
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop IDE Layout */}
      <div className="hidden lg:block h-[calc(100vh-120px)]">
        <IDELayout
          leftPanel={<TabPanel tabs={leftPanelTabs} defaultTab="description" />}
          rightPanel={
            <div className="flex flex-col h-full">
              <ResizablePanel
                topContent={EditorContent}
                bottomContent={ConsoleContent}
                defaultBottomHeight={250}
                minBottomHeight={120}
                maxBottomHeight={450}
              />
              {/* Action Bar */}
              <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                {ActionButtons}
              </div>
            </div>
          }
        />
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:block lg:hidden h-[calc(100vh-120px)]">
        <div className="flex flex-col h-full">
          <div className="h-[45%] border-b border-gray-200 dark:border-slate-700">
            <TabPanel tabs={leftPanelTabs} defaultTab="description" />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4">
              <TaskTextarea
                status={status}
                value={textAreaValue}
                onChangeValue={onChangeTextArea}
              />
            </div>
            <div className="h-48 border-t border-gray-200 dark:border-slate-700">
              {ConsoleContent}
            </div>
            <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
              {ActionButtons}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden">
        <MobileIDELayout
          tabs={leftPanelTabs}
          editor={
            <TaskTextarea
              status={status}
              value={textAreaValue}
              onChangeValue={onChangeTextArea}
            />
          }
          console={ConsoleContent}
          actions={ActionButtons}
        />
      </div>
    </>
  );
}
