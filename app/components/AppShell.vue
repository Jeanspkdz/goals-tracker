<script setup lang="ts">
import {
  CalendarDays,
  ClipboardCheck,
  Flag,
  LayoutDashboard,
  Settings,
  Sparkles
} from "@lucide/vue";
import { computed, ref } from "vue";

type GoalStatus = "Active" | "Completed" | "Archived";
type TaskPriority = "High" | "Medium" | "Low";
type TaskEffort = "Light" | "Focus";
type TaskStatus = "Planned" | "Completed" | "Deferred" | "Skipped" | "Blocked";

type Task = {
  id: number;
  title: string;
  priority: TaskPriority;
  deadline: string;
  effort: TaskEffort;
  status: TaskStatus;
};

type Goal = {
  id: number;
  title: string;
  status: GoalStatus;
  completionConfirmed: boolean;
  completionError: string;
  tasks: Task[];
};

type TaskDraft = {
  title: string;
  priority: TaskPriority;
  deadline: string;
  effort: TaskEffort;
};

type SurfaceId =
  | "calendar"
  | "onboarding"
  | "goals"
  | "daily-review"
  | "weekly-review"
  | "settings";

type Surface = {
  id: SurfaceId;
  label: string;
  heading: string;
  description: string;
  icon: typeof CalendarDays;
};

const surfaces: Surface[] = [
  {
    id: "calendar",
    label: "Calendar",
    heading: "Calendar Screen",
    description:
      "View events, scheduled tasks, reminders, and daily plans from today's planning surface.",
    icon: CalendarDays
  },
  {
    id: "onboarding",
    label: "Onboarding",
    heading: "Onboarding",
    description:
      "Connect an AI Provider, explain setup choices, and prepare the main AI-assisted experience.",
    icon: Sparkles
  },
  {
    id: "goals",
    label: "Goals",
    heading: "Goals",
    description:
      "Create Active Goals, review Goal Progress, and keep Archived Goals out of future planning.",
    icon: Flag
  },
  {
    id: "daily-review",
    label: "Daily Review",
    heading: "Daily Review",
    description:
      "Confirm completed Tasks, capture Incomplete Reasons, and prepare tomorrow's Schedule Suggestion.",
    icon: ClipboardCheck
  },
  {
    id: "weekly-review",
    label: "Weekly Review",
    heading: "Weekly Review",
    description:
      "Review progress, missed Daily Reviews, capacity patterns, and Lesson Suggestions.",
    icon: LayoutDashboard
  },
  {
    id: "settings",
    label: "Settings",
    heading: "Settings",
    description:
      "Manage Manual Mode, Reminder Offset, Focus Windows, and provider-related setup later.",
    icon: Settings
  }
];

const activeSurface = ref<SurfaceId>("calendar");
const todayLabel = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "short",
  day: "numeric"
}).format(new Date());
const surface = computed(
  () =>
    surfaces.find((item) => item.id === activeSurface.value) ?? surfaces[0]
);
const goals = ref<Goal[]>([]);
const goalTitle = ref("");
const taskDrafts = ref<Record<number, TaskDraft>>({});
const taskStatuses: TaskStatus[] = [
  "Planned",
  "Completed",
  "Deferred",
  "Skipped",
  "Blocked"
];

function createGoal() {
  const title = goalTitle.value.trim();

  if (!title) {
    return;
  }

  goals.value.push({
    id: Date.now(),
    title,
    status: "Active",
    completionConfirmed: false,
    completionError: "",
    tasks: []
  });
  goalTitle.value = "";
}

function createTaskDraft(): TaskDraft {
  return {
    title: "",
    priority: "Medium",
    deadline: "",
    effort: "Light"
  };
}

function taskDraftFor(goal: Goal) {
  taskDrafts.value[goal.id] ??= createTaskDraft();
  return taskDrafts.value[goal.id];
}

function addTask(goal: Goal) {
  const draft = taskDraftFor(goal);
  const title = draft.title.trim();

  if (!title) {
    return;
  }

  goal.tasks.push({
    id: Date.now(),
    title,
    priority: draft.priority,
    deadline: draft.deadline,
    effort: draft.effort,
    status: "Planned"
  });
  taskDrafts.value[goal.id] = createTaskDraft();
}

function completedTaskCount(goal: Goal) {
  return goal.tasks.filter((task) => task.status === "Completed").length;
}

function setGoalStatus(goal: Goal, status: GoalStatus) {
  if (status === "Completed") {
    const hasTasks = goal.tasks.length > 0;
    const allTasksCompleted =
      hasTasks && goal.tasks.every((task) => task.status === "Completed");

    if (!allTasksCompleted || !goal.completionConfirmed) {
      goal.status = "Active";
      goal.completionError =
        "Complete all Tasks and confirm completion before marking this Goal Completed.";
      return;
    }
  }

  goal.status = status;
  goal.completionError = "";
}

function futurePlanningLabel(goal: Goal) {
  return goal.status === "Active"
    ? "Included in future planning"
    : "Out of future planning";
}

function taskPlanningLabel(task: Task) {
  return task.status === "Skipped"
    ? "Task planning: Out of future planning"
    : "Task planning: Included in future planning";
}
</script>

<template>
  <main class="app-shell">
    <aside class="sidebar" aria-label="Primary navigation">
      <div>
        <p class="eyebrow">AI-assisted planning</p>
        <h1>Goals Tracker</h1>
      </div>

      <nav class="surface-nav" aria-label="App surfaces">
        <button
          v-for="item in surfaces"
          :key="item.id"
          class="nav-button"
          type="button"
          :aria-current="item.id === activeSurface ? 'page' : undefined"
          @click="activeSurface = item.id"
        >
          <component :is="item.icon" aria-hidden="true" :size="18" />
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <section class="surface-panel" aria-labelledby="surface-heading">
      <div class="surface-header">
        <div class="surface-icon" aria-hidden="true">
          <component :is="surface.icon" :size="28" />
        </div>
        <div>
          <p class="eyebrow">{{ surface.label }}</p>
          <h2 id="surface-heading">{{ surface.heading }}</h2>
        </div>
      </div>

      <div v-if="activeSurface === 'calendar'" class="surface-content">
        <div class="today-band">
          <span>Today</span>
          <strong>{{ todayLabel }}</strong>
        </div>

        <p>
          The Calendar Screen is the planning surface for events, scheduled
          tasks, reminders, and daily plans.
        </p>

        <div class="empty-state">
          <h3>Daily Plan</h3>
          <p>
            No Events or Scheduled Tasks are loaded yet. The next slice will add
            the behavior behind this shell.
          </p>
        </div>
      </div>

      <div v-else-if="activeSurface === 'goals'" class="surface-content goals-surface">
        <p>
          Create manual Goals, add Tasks under exactly one Goal, and review Goal
          Progress from completed Tasks.
        </p>

        <section class="form-section" aria-label="Create Goal">
          <label for="goal-title">Goal title</label>
          <div class="inline-form">
            <input
              id="goal-title"
              v-model="goalTitle"
              aria-label="Goal title"
              type="text"
            />
            <button type="button" @click="createGoal">Create Goal</button>
          </div>
        </section>

        <div v-if="goals.length === 0" class="empty-state">
          <h3>No manual Goals yet</h3>
          <p>Create an Active Goal to start tracking Tasks and progress.</p>
        </div>

        <div v-else class="goal-list">
          <article v-for="goal in goals" :key="goal.id" class="goal-card">
            <div class="goal-card-header">
              <div>
                <h3>{{ goal.title }}</h3>
                <p>
                  Goal Progress: {{ completedTaskCount(goal) }} of
                  {{ goal.tasks.length }} Tasks completed
                </p>
              </div>
              <span class="status-pill">{{ goal.status }}</span>
            </div>

            <div class="goal-controls">
              <label>
                Edit Goal title
                <input
                  v-model="goal.title"
                  :aria-label="`Edit Goal title for ${goal.title}`"
                  type="text"
                />
              </label>

              <label>
                Goal Status
                <select
                  aria-label="Goal Status"
                  :value="goal.status"
                  @change="
                    setGoalStatus(goal, ($event.target as HTMLSelectElement).value as GoalStatus)
                  "
                >
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Archived</option>
                </select>
              </label>

              <label class="checkbox-label">
                <input
                  v-model="goal.completionConfirmed"
                  aria-label="Confirm Goal completion"
                  type="checkbox"
                />
                Confirm Goal completion
              </label>
            </div>

            <p class="planning-state">{{ futurePlanningLabel(goal) }}</p>
            <p v-if="goal.completionError" class="form-error">
              {{ goal.completionError }}
            </p>

            <section class="form-section" :aria-label="`Add Task to ${goal.title}`">
              <label :for="`task-title-${goal.id}`">Task title</label>
              <input
                :id="`task-title-${goal.id}`"
                v-model="taskDraftFor(goal).title"
                :aria-label="`Task title for ${goal.title}`"
                type="text"
              />

              <div class="task-form-grid">
                <label>
                  Task Priority
                  <select
                    v-model="taskDraftFor(goal).priority"
                    :aria-label="`Task Priority for ${goal.title}`"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </label>

                <label>
                  Task Deadline
                  <input
                    v-model="taskDraftFor(goal).deadline"
                    :aria-label="`Task Deadline for ${goal.title}`"
                    type="date"
                  />
                </label>

                <label>
                  Task Effort
                  <select
                    v-model="taskDraftFor(goal).effort"
                    :aria-label="`Task Effort for ${goal.title}`"
                  >
                    <option>Light</option>
                    <option>Focus</option>
                  </select>
                </label>
              </div>

              <button type="button" @click="addTask(goal)">
                Add Task to {{ goal.title }}
              </button>
            </section>

            <ul
              v-if="goal.tasks.length > 0"
              class="task-list"
              :aria-label="`Tasks for ${goal.title}`"
            >
              <li v-for="task in goal.tasks" :key="task.id" class="task-item">
                <div>
                  <strong>{{ task.title }}</strong>
                  <p>
                  {{ task.priority }} Priority · {{ task.effort }} Effort
                  <span v-if="task.deadline"> · Deadline {{ task.deadline }}</span>
                </p>
                <p class="planning-state">{{ taskPlanningLabel(task) }}</p>
              </div>
                <label>
                  Status for {{ task.title }}
                  <select
                    v-model="task.status"
                    :aria-label="`Status for ${task.title}`"
                  >
                    <option v-for="status in taskStatuses" :key="status">
                      {{ status }}
                    </option>
                  </select>
                </label>
              </li>
            </ul>
          </article>
        </div>
      </div>

      <div v-else class="surface-content">
        <p>{{ surface.description }}</p>
        <div class="empty-state">
          <h3>Ready for the next slice</h3>
          <p>
            This screen is intentionally a shell. Product behavior will arrive
            in focused vertical slices.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
