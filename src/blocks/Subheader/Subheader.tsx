import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../assets/icons/CloseIcon";
import { LeftArrowIcon } from "../../assets/icons/LeftArrowIcon";
import { MenuIcon } from "../../assets/icons/MenuIcon";
import { RightArrowIcon } from "../../assets/icons/RightArrowIcon";
import { Task, tasksList } from "../../assets/tasks/tasks";
import { Button } from "../../components/Button/Button";
import { Dialog } from "../../components/Dialog/Dialog";
import { ModalButton } from "../../components/ModalButton/ModalButton";
import { useAppSelector } from "../../store/store";

// XP required to unlock each task (every 5 tasks requires more XP)
const getRequiredXP = (taskIndex: number): number => {
  if (taskIndex < 5) return 0; // First 5 tasks are free
  if (taskIndex < 10) return 50;
  if (taskIndex < 15) return 100;
  if (taskIndex < 20) return 200;
  if (taskIndex < 30) return 350;
  if (taskIndex < 40) return 500;
  if (taskIndex < 50) return 750;
  if (taskIndex < 60) return 1000;
  if (taskIndex < 75) return 1500;
  if (taskIndex < 90) return 2000;
  return 2500;
};

export interface SubheaderProps {
  selectedTask: Task["id"] | null;
  onSelectTask: (task: Task["id"]) => void;
}

export interface TOCButtonProps {
  selectedTask: Task["id"] | null;
  onSelectTask: (task: Task["id"]) => void;
  children?: ReactNode;
}

export interface TopicBlockProps {
  title: string;
  tasks: { task: Task; index: number }[];
  selectedTask: Task["id"] | null;
  onSelectTask: (task: Task["id"]) => void;
  totalXP: number;
  completedTasks: string[];
}

function TopicBlock({
  title,
  selectedTask,
  tasks,
  onSelectTask,
  totalXP,
  completedTasks,
}: TopicBlockProps) {
  return (
    <div className="flex-shrink-0 w-[200px] bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
      {/* Topic Header */}
      <div className="mb-3 pb-3 border-b border-gray-100 dark:border-slate-700">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#442a65] dark:text-purple-300 truncate">
          {title}
        </h3>
        <span className="text-[10px] text-gray-400 dark:text-slate-500">
          {tasks.length} tasks
        </span>
      </div>

      {/* Task Pills - Vertical List */}
      <div className="flex flex-wrap gap-1.5">
        {tasks.map(({ task, index }) => {
          const isSelected = task.id === selectedTask;
          const isCompleted = completedTasks.includes(task.id);
          const requiredXP = getRequiredXP(index);
          const isLocked = totalXP < requiredXP && !isCompleted;
          
          return (
            <button
              key={task.id}
              onClick={() => !isLocked && onSelectTask(task.id)}
              disabled={isLocked}
              title={isLocked ? `🔒 Requires ${requiredXP} XP to unlock` : `Task ${index + 1}`}
              className={`
                relative w-9 h-9 rounded-lg font-semibold text-xs
                transition-all duration-200 ease-out
                ${isLocked
                  ? 'bg-gray-100 dark:bg-slate-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : isSelected
                    ? 'bg-[#442a65] text-white shadow-lg shadow-[#442a65]/30'
                    : isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                      : 'bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-[#442a65]/10 hover:text-[#442a65] dark:hover:text-purple-300'
                }
              `}
            >
              {isLocked ? (
                <span className="text-[10px]">🔒</span>
              ) : isCompleted ? (
                <span className="text-sm">✓</span>
              ) : (
                index + 1
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TOCButton({ onSelectTask, selectedTask, children }: TOCButtonProps) {
  const { t } = useTranslation();
  const gameState = useAppSelector((state) => state.game);
  const totalXP = gameState.totalXP;
  const completedTasks = gameState.completedTasks;

  const tasksRawBlocks: { task: Task; index: number }[][] = [[]];
  tasksList.forEach((task, taskIndex) => {
    let lastBlock = tasksRawBlocks[tasksRawBlocks.length - 1];

    if (taskIndex === 0) {
      lastBlock.push({ task, index: taskIndex });
      return;
    }

    const lastTask = lastBlock[lastBlock.length - 1];
    if (lastTask.task.topic !== task.topic) {
      tasksRawBlocks.push([]);
      lastBlock = tasksRawBlocks[tasksRawBlocks.length - 1];
    }
    lastBlock.push({ task, index: taskIndex });
  });
  const topicBlocks = (onCloseClick: () => void) => {
    const onSelectTaskInTopic = (task: string) => {
      onSelectTask(task);
      onCloseClick();
    };

    return tasksRawBlocks.map((tasksBlock, blockIndex) => (
      <TopicBlock
        key={blockIndex}
        selectedTask={selectedTask}
        title={t(`topics.${tasksBlock[0].task.topic}`)}
        tasks={tasksBlock}
        onSelectTask={onSelectTaskInTopic}
        totalXP={totalXP}
        completedTasks={completedTasks}
      />
    ));
  };

  return (
    <ModalButton
      buttonProps={{
        leftIcon: <MenuIcon />,
        variant: "secondary",
        size: "medium",
        "aria-label": t("open_tasks_list") || undefined,
        children,
        isDisabled: !selectedTask,
      }}
      isDismissable
      position="topFullWidth"
    >
      {(onCloseClick) => (
        <Dialog>
          <div className="flex flex-col w-screen max-w-full">
            {/* Header */}
            <div className="flex flex-row items-center justify-between gap-4 py-3 px-6 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#442a65] to-[#87888a] flex items-center justify-center">
                  <MenuIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {t("tasks_list")}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {tasksList.length} exercises
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseClick}
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors duration-200"
              >
                <CloseIcon className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Tasks Grid - Horizontal Layout */}
            <div className="overflow-x-auto overflow-y-hidden p-4">
              <div className="flex flex-row gap-6 min-w-max">
                {topicBlocks(onCloseClick)}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </ModalButton>
  );
}

export function Subheader({ selectedTask, onSelectTask }: SubheaderProps) {
  const { t } = useTranslation();
  const gameState = useAppSelector((state) => state.game);
  const totalXP = gameState.totalXP;
  const completedTasks = gameState.completedTasks;

  const selectedTaskNum =
    tasksList.findIndex(({ id }) => id === selectedTask) + 1;

  // Check if a task at a given index is locked
  const isTaskLocked = (taskIndex: number): boolean => {
    const task = tasksList[taskIndex];
    if (!task) return true;
    const isCompleted = completedTasks.includes(task.id);
    if (isCompleted) return false;
    const requiredXP = getRequiredXP(taskIndex);
    return totalXP < requiredXP;
  };

  // Find next unlocked task
  const nextUnlockedTaskIndex = (): number | null => {
    for (let i = selectedTaskNum; i < tasksList.length; i++) {
      if (!isTaskLocked(i)) return i;
    }
    return null;
  };

  // Check if next task is available (unlocked)
  const nextTaskIndex = selectedTaskNum; // selectedTaskNum is already +1, so this is the next index
  const isNextTaskLocked = isTaskLocked(nextTaskIndex);

  const onSelectNextTask = () => {
    if (!isNextTaskLocked) {
      onSelectTask(tasksList[nextTaskIndex].id);
    }
  };

  const onSelectPrevTask = () => {
    onSelectTask(tasksList[selectedTaskNum - 2].id);
  };

  return (
    <div className="pb-4">
      <div className="sm:hidden px-6 flex flex-row justify-between items-center">
        <TOCButton selectedTask={selectedTask} onSelectTask={onSelectTask} />
        {selectedTask && (
          <span className="text-gray-800 dark:text-gray-100 font-medium min-w-[82px] text-center">
            {t("task_number", { task: selectedTaskNum })}
          </span>
        )}
        {!selectedTask && (
          <div className="min-w-[82px] h-[16px] bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-full animate-pulse" />
        )}
        <Button
          isDisabled={selectedTaskNum >= tasksList.length || !selectedTask || isNextTaskLocked}
          variant="secondary"
          leftIcon={<RightArrowIcon />}
          onPress={onSelectNextTask}
        />
      </div>
      <div className="hidden sm:flex px-3 sm:px-6 flex-row justify-between items-center gap-2 sm:gap-3">
        <div className="w-[120px] sm:w-[157px]">
          <TOCButton selectedTask={selectedTask} onSelectTask={onSelectTask}>
            {t("tasks_list")}
          </TOCButton>
        </div>
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 flex-1">
          <Button
            isDisabled={selectedTaskNum <= 1 || !selectedTask}
            variant="secondary"
            leftIcon={<LeftArrowIcon />}
            onPress={onSelectPrevTask}
          />
          {selectedTask && (
            <span className="text-sm sm:text-base text-gray-800 dark:text-gray-100 font-medium min-w-[70px] sm:min-w-[82px] text-center">
              {t("task_number", { task: selectedTaskNum })}
            </span>
          )}
          {!selectedTask && (
            <div className="min-w-[82px] h-[16px] bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-full animate-pulse" />
          )}
          <Button
            isDisabled={selectedTaskNum >= tasksList.length || !selectedTask || isNextTaskLocked}
            variant="secondary"
            leftIcon={<RightArrowIcon />}
            onPress={onSelectNextTask}
          />
        </div>
        <div className="w-[157px]"></div>
      </div>
      <div className="pb-4 absolute h-0 border-b border-indigo-100/50 dark:border-slate-700/50 w-[100vw] left-0"></div>
    </div>
  );
}
