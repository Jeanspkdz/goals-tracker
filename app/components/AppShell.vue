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
import {
  createRemindersForDailyPlan,
  snoozeReminder,
  type Reminder
} from "../domain/reminders";
import {
  createFakeAiProviderAdapter,
  type ProviderCapability,
  type ProviderConnectionResult
} from "../domain/ai-provider";

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
  progressFormat?: string;
  schedulePattern?: string;
  deadlineSuggestion?: string;
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

type CalendarEvent = {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
};

type EventDraft = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
};

type ScheduledTask = {
  id: number;
  title: string;
  priority: TaskPriority;
  startTime: string;
  endTime: string;
};

type ScheduledTaskDraft = {
  title: string;
  priority: TaskPriority;
  startTime: string;
  endTime: string;
};

type ProviderDraft = {
  providerName: string;
  credential: string;
  fakeMode: "success" | "failure";
};

type ActiveProvider = {
  providerName: string;
  capabilities: ProviderCapability[];
};

type GoalSuggestionTask = {
  title: string;
  priority: TaskPriority;
  deadline: string;
  effort: TaskEffort;
};

type GoalSuggestion = {
  id: string;
  goalText: string;
  progressFormat: string;
  taskBreakdown: GoalSuggestionTask[];
  schedulePattern: string;
  deadlineSuggestion: string;
};

type AiSuggestionHistoryRecord = {
  id: number;
  providerName: string;
  suggestionKind: "goal";
  outcome: "accepted" | "rejected";
  structuredSuggestion: GoalSuggestion;
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
const eventConflictFeedback = computed(() =>
  scheduledTasks.value.flatMap((task) =>
    events.value
      .filter((event) => timeBlocksOverlap(task, event))
      .map((event) => ({
        id: `${task.id}-${event.id}`,
        message: `${task.title} overlaps ${event.title}.`
      }))
  )
);
const reminders = computed(() =>
  createRemindersForDailyPlan({
    reminderOffsetMinutes: reminderOffsetMinutes.value,
    items: [
      ...events.value.map((event) => ({
        id: `event-${event.id}`,
        kind: "event" as const,
        title: event.title,
        startsAt: toDateTime(event.date, event.startTime),
        endsAt: toDateTime(event.date, event.endTime)
      })),
      ...scheduledTasks.value.map((task) => ({
        id: `scheduled-task-${task.id}`,
        kind: "scheduled-task" as const,
        title: task.title,
        priority: task.priority,
        startsAt: toDateTime(todayDate, task.startTime),
        endsAt: toDateTime(todayDate, task.endTime)
      }))
    ]
  }).map((reminder) => snoozedReminders.value[reminder.id] ?? reminder)
);
const goals = ref<Goal[]>([]);
const goalTitle = ref("");
const taskDrafts = ref<Record<number, TaskDraft>>({});
const providerDraft = ref<ProviderDraft>({
  providerName: "",
  credential: "",
  fakeMode: "success"
});
const activeProvider = ref<ActiveProvider | null>(null);
const providerConnectionError = ref("");
const goalPrompt = ref("");
const goalSuggestions = ref<GoalSuggestion[]>([]);
const goalSuggestionError = ref("");
const goalSuggestionStatus = ref("");
const aiSuggestionHistory = ref<AiSuggestionHistoryRecord[]>([]);
const events = ref<CalendarEvent[]>([]);
const eventDraft = ref<EventDraft>({
  title: "",
  date: "",
  startTime: "",
  endTime: ""
});
const scheduledTasks = ref<ScheduledTask[]>([]);
const scheduledTaskDraft = ref<ScheduledTaskDraft>({
  title: "",
  priority: "Medium",
  startTime: "",
  endTime: ""
});
const scheduledTaskError = ref("");
const snoozedReminders = ref<Record<string, Reminder>>({});
const reminderOffsetMinutes = ref(15);
const notificationsEnabled = ref(false);
const taskStatuses: TaskStatus[] = [
  "Planned",
  "Completed",
  "Deferred",
  "Skipped",
  "Blocked"
];
const todayDate = new Date().toISOString().slice(0, 10);

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

async function generateGoalSuggestions() {
  const prompt = goalPrompt.value.trim();

  if (!activeProvider.value) {
    goalSuggestionError.value = "Connect an AI Provider before generating Goal Suggestions.";
    goalSuggestionStatus.value = "";
    return;
  }

  if (!prompt) {
    return;
  }

  const adapter = createFakeAiProviderAdapter({ mode: "success" });
  const result = await adapter.generateStructuredText({
    instruction: prompt,
    schemaName: "goal-suggestions"
  });

  goalSuggestions.value = parseGoalSuggestions(result.data);
  goalSuggestionError.value = "";
  goalSuggestionStatus.value = "";
}

function acceptGoalSuggestion(suggestion: GoalSuggestion) {
  goals.value.push({
    id: Date.now(),
    title: suggestion.goalText,
    status: "Active",
    progressFormat: suggestion.progressFormat,
    schedulePattern: suggestion.schedulePattern,
    deadlineSuggestion: suggestion.deadlineSuggestion,
    completionConfirmed: false,
    completionError: "",
    tasks: suggestion.taskBreakdown.map((task, index) => ({
      id: Date.now() + index + 1,
      title: task.title,
      priority: task.priority,
      deadline: task.deadline,
      effort: task.effort,
      status: "Planned"
    }))
  });

  aiSuggestionHistory.value.push({
    id: Date.now(),
    providerName: activeProvider.value?.providerName ?? "Unknown provider",
    suggestionKind: "goal",
    outcome: "accepted",
    structuredSuggestion: suggestion
  });
  goalSuggestions.value = goalSuggestions.value.filter(
    (candidate) => candidate.id !== suggestion.id
  );
  goalSuggestionStatus.value = "Active Goal created from Goal Suggestion.";
}

function rejectGoalSuggestion(suggestion: GoalSuggestion) {
  aiSuggestionHistory.value.push({
    id: Date.now(),
    providerName: activeProvider.value?.providerName ?? "Unknown provider",
    suggestionKind: "goal",
    outcome: "rejected",
    structuredSuggestion: suggestion
  });
  goalPrompt.value = "";
  goalSuggestions.value = goalSuggestions.value.filter(
    (candidate) => candidate.id !== suggestion.id
  );
  goalSuggestionStatus.value =
    "Goal Suggestion rejected and stored as structured AI Suggestion History.";
}

function parseGoalSuggestions(data: Record<string, unknown>): GoalSuggestion[] {
  const suggestions = data.suggestions;

  if (!Array.isArray(suggestions)) {
    return [];
  }

  return suggestions.filter(isGoalSuggestion);
}

function isGoalSuggestion(value: unknown): value is GoalSuggestion {
  if (!value || typeof value !== "object") {
    return false;
  }

  const suggestion = value as GoalSuggestion;
  return (
    typeof suggestion.id === "string" &&
    typeof suggestion.goalText === "string" &&
    typeof suggestion.progressFormat === "string" &&
    Array.isArray(suggestion.taskBreakdown) &&
    typeof suggestion.schedulePattern === "string" &&
    typeof suggestion.deadlineSuggestion === "string"
  );
}

async function runProviderConnectionTest() {
  const providerName = providerDraft.value.providerName.trim();
  const credential = providerDraft.value.credential;

  if (!providerName || !credential) {
    return;
  }

  const adapter = createFakeAiProviderAdapter({ mode: providerDraft.value.fakeMode });
  const result: ProviderConnectionResult = await adapter.testConnection({
    providerName,
    secret: credential
  });

  providerDraft.value.credential = "";

  if (!result.connected) {
    activeProvider.value = null;
    providerConnectionError.value = result.error;
    return;
  }

  activeProvider.value = {
    providerName: result.providerName,
    capabilities: result.capabilities
  };
  providerConnectionError.value = "";
}

function disconnectProvider() {
  activeProvider.value = null;
  providerConnectionError.value = "";
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

function createEvent() {
  const title = eventDraft.value.title.trim();

  if (
    !title ||
    !eventDraft.value.date ||
    !eventDraft.value.startTime ||
    !eventDraft.value.endTime
  ) {
    return;
  }

  events.value.push({
    id: Date.now(),
    title,
    date: eventDraft.value.date,
    startTime: eventDraft.value.startTime,
    endTime: eventDraft.value.endTime
  });
  eventDraft.value = {
    title: "",
    date: "",
    startTime: "",
    endTime: ""
  };
}

function addScheduledTask() {
  const title = scheduledTaskDraft.value.title.trim();

  if (
    !title ||
    !scheduledTaskDraft.value.startTime ||
    !scheduledTaskDraft.value.endTime
  ) {
    return;
  }

  const candidate: ScheduledTask = {
    id: Date.now(),
    title,
    priority: scheduledTaskDraft.value.priority,
    startTime: scheduledTaskDraft.value.startTime,
    endTime: scheduledTaskDraft.value.endTime
  };

  if (scheduledTasks.value.some((task) => timeBlocksOverlap(task, candidate))) {
    scheduledTaskError.value = "Scheduled Tasks cannot overlap.";
    return;
  }

  scheduledTasks.value.push(candidate);
  scheduledTaskError.value = "";
  scheduledTaskDraft.value = {
    title: "",
    priority: "Medium",
    startTime: "",
    endTime: ""
  };
}

function updateScheduledTaskTime(
  task: ScheduledTask,
  field: "startTime" | "endTime",
  value: string
) {
  const previousValue = task[field];
  task[field] = value;

  if (
    scheduledTasks.value.some(
      (candidate) => candidate.id !== task.id && timeBlocksOverlap(candidate, task)
    )
  ) {
    task[field] = previousValue;
    scheduledTaskError.value = "Scheduled Tasks cannot overlap.";
    return;
  }

  scheduledTaskError.value = "";
}

function snoozeCalendarReminder(reminder: Reminder) {
  snoozedReminders.value[reminder.id] = snoozeReminder(reminder, {
    snoozeMinutes: 5,
    now: reminder.remindAt
  });
}

function timeBlocksOverlap(
  first: { startTime: string; endTime: string },
  second: { startTime: string; endTime: string }
) {
  return first.startTime < second.endTime && second.startTime < first.endTime;
}

function toDateTime(date: string, time: string) {
  return `${date}T${time}:00.000Z`;
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

        <section class="form-section" aria-label="Create Event">
          <h3>Events</h3>
          <label for="event-title">Event title</label>
          <input
            id="event-title"
            v-model="eventDraft.title"
            aria-label="Event title"
            type="text"
          />

          <div class="task-form-grid">
            <label>
              Event date
              <input
                v-model="eventDraft.date"
                aria-label="Event date"
                type="date"
              />
            </label>

            <label>
              Event start time
              <input
                v-model="eventDraft.startTime"
                aria-label="Event start time"
                type="time"
              />
            </label>

            <label>
              Event end time
              <input
                v-model="eventDraft.endTime"
                aria-label="Event end time"
                type="time"
              />
            </label>
          </div>

          <button type="button" @click="createEvent">Create Event</button>
        </section>

        <ul v-if="events.length > 0" class="task-list" aria-label="Events">
          <li v-for="event in events" :key="event.id" class="task-item">
            <div>
              <strong>{{ event.title }}</strong>
              <p>
                {{ event.date }} · {{ event.startTime }}-{{ event.endTime }}
              </p>
              <p class="planning-state">Event constraint</p>
            </div>
          </li>
        </ul>

        <section class="form-section" aria-label="Daily Plan">
          <h3>Daily Plan</h3>
          <label for="scheduled-task-title">Scheduled Task title</label>
          <input
            id="scheduled-task-title"
            v-model="scheduledTaskDraft.title"
            aria-label="Scheduled Task title"
            type="text"
          />

          <div class="task-form-grid">
            <label>
              Scheduled Task Priority
              <select
                v-model="scheduledTaskDraft.priority"
                aria-label="Scheduled Task Priority"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>

            <label>
              Scheduled Task start time
              <input
                v-model="scheduledTaskDraft.startTime"
                aria-label="Scheduled Task start time"
                type="time"
              />
            </label>

            <label>
              Scheduled Task end time
              <input
                v-model="scheduledTaskDraft.endTime"
                aria-label="Scheduled Task end time"
                type="time"
              />
            </label>
          </div>

          <button type="button" @click="addScheduledTask">
            Add Scheduled Task
          </button>
          <p v-if="scheduledTaskError" class="form-error">
            {{ scheduledTaskError }}
          </p>
        </section>

        <ul
          v-if="scheduledTasks.length > 0"
          class="task-list"
          aria-label="Scheduled Tasks"
        >
          <li v-for="task in scheduledTasks" :key="task.id" class="task-item">
            <div>
              <strong>{{ task.title }}</strong>
              <p>
                {{ task.startTime }}-{{ task.endTime }} ·
                {{ task.priority }} Priority
              </p>
            </div>
            <div class="task-form-grid">
              <label>
                Start time for {{ task.title }}
                <input
                  :aria-label="`Start time for ${task.title}`"
                  :value="task.startTime"
                  type="time"
                  @change="
                    updateScheduledTaskTime(
                      task,
                      'startTime',
                      ($event.target as HTMLInputElement).value
                    )
                  "
                />
              </label>

              <label>
                End time for {{ task.title }}
                <input
                  :aria-label="`End time for ${task.title}`"
                  :value="task.endTime"
                  type="time"
                  @change="
                    updateScheduledTaskTime(
                      task,
                      'endTime',
                      ($event.target as HTMLInputElement).value
                    )
                  "
                />
              </label>
            </div>
          </li>
        </ul>

        <section
          v-if="eventConflictFeedback.length > 0"
          class="form-section"
          aria-label="Event Conflict Feedback"
        >
          <h3>Event Conflict Feedback</h3>
          <p
            v-for="feedback in eventConflictFeedback"
            :key="feedback.id"
            class="form-error"
          >
            {{ feedback.message }}
            Specific fixes: reschedule the Scheduled Task or shorten the task
            block. Not a Lesson Suggestion.
          </p>
        </section>

        <section
          v-if="reminders.length > 0"
          class="form-section"
          aria-label="Reminders"
        >
          <h3>Reminders</h3>
          <ul class="task-list">
            <li
              v-for="reminder in reminders"
              :key="reminder.id"
              class="task-item"
            >
              <div>
                <strong>{{ reminder.title }}</strong>
                <p>{{ reminder.body }}</p>
                <p class="planning-state">
                  {{ reminder.timing === "early" ? "Early reminder" : "Start-time reminder" }}
                  · {{ reminder.remindAt }}
                  <span v-if="reminder.snoozed"> · Snoozed</span>
                </p>
                <button
                  v-if="!reminder.snoozed"
                  type="button"
                  @click="snoozeCalendarReminder(reminder)"
                >
                  Snooze reminder for {{ reminder.title }}
                  {{ reminder.timing }}
                </button>
              </div>
            </li>
          </ul>
        </section>

        <div v-if="events.length === 0 && scheduledTasks.length === 0" class="empty-state">
          <h3>No Daily Plan content yet</h3>
          <p>Create an Event or Scheduled Task to start shaping today.</p>
        </div>
      </div>

      <div v-else-if="activeSurface === 'onboarding'" class="surface-content">
        <p>{{ surface.description }}</p>

        <section class="form-section" aria-label="AI Provider setup">
          <h3>AI Provider setup</h3>
          <label for="provider-name">Provider name</label>
          <input
            id="provider-name"
            v-model="providerDraft.providerName"
            aria-label="Provider name"
            type="text"
          />

          <label for="provider-credential">Provider Credential</label>
          <input
            id="provider-credential"
            v-model="providerDraft.credential"
            aria-label="Provider Credential"
            autocomplete="off"
            type="password"
          />

          <label>
            Fake Provider test mode
            <select
              v-model="providerDraft.fakeMode"
              aria-label="Fake Provider test mode"
            >
              <option>success</option>
              <option>failure</option>
            </select>
          </label>

          <button type="button" @click="runProviderConnectionTest">
            Run Provider Connection Test
          </button>
          <p v-if="providerConnectionError" class="form-error">
            {{ providerConnectionError }}
          </p>
        </section>

        <p v-if="!activeProvider" class="planning-state">
          Manual Mode
        </p>

        <section
          v-if="activeProvider"
          class="form-section"
          aria-label="Active AI Provider"
        >
          <h3>AI Provider connected</h3>
          <p>Active provider: {{ activeProvider.providerName }}</p>

          <ul class="task-list" aria-label="Provider Capabilities">
            <li
              v-for="capability in activeProvider.capabilities"
              :key="capability.id"
              class="task-item"
            >
              <div>
                <strong>{{ capability.label }}</strong>
                <p>
                  {{ capability.supported ? "Supported" : "Disabled" }}
                </p>
                <p v-if="capability.explanation" class="planning-state">
                  {{ capability.explanation }}
                </p>
              </div>
            </li>
          </ul>

          <button type="button" @click="disconnectProvider">
            Disconnect Provider
          </button>
        </section>
      </div>

      <div v-else-if="activeSurface === 'goals'" class="surface-content goals-surface">
        <p>
          Create manual Goals, add Tasks under exactly one Goal, and review Goal
          Progress from completed Tasks.
        </p>

        <section class="form-section" aria-label="Goal Prompt">
          <h3>Goal Prompt</h3>
          <label for="goal-prompt">Describe the goal you want clarified</label>
          <textarea
            id="goal-prompt"
            v-model="goalPrompt"
            aria-label="Goal Prompt"
          />

          <button type="button" @click="generateGoalSuggestions">
            Generate Goal Suggestions
          </button>
          <p v-if="goalSuggestionError" class="form-error">
            {{ goalSuggestionError }}
          </p>
          <p v-if="goalSuggestionStatus" class="planning-state">
            {{ goalSuggestionStatus }}
          </p>
        </section>

        <section
          v-if="goalSuggestions.length > 0"
          class="form-section"
          aria-label="Goal Suggestions"
        >
          <h3>Goal Suggestions</h3>
          <ul class="task-list">
            <li
              v-for="suggestion in goalSuggestions"
              :key="suggestion.id"
              class="task-item"
            >
              <div>
                <strong>{{ suggestion.goalText }}</strong>
                <p>Progress Format: {{ suggestion.progressFormat }}</p>
                <p>Schedule Pattern: {{ suggestion.schedulePattern }}</p>
                <p>Suggested deadline: {{ suggestion.deadlineSuggestion }}</p>
                <ul>
                  <li
                    v-for="task in suggestion.taskBreakdown"
                    :key="task.title"
                  >
                    {{ task.title }} · {{ task.priority }} Priority ·
                    {{ task.effort }} Effort
                    <span v-if="task.deadline"> · Deadline {{ task.deadline }}</span>
                  </li>
                </ul>
              </div>

              <button type="button" @click="acceptGoalSuggestion(suggestion)">
                Accept Goal Suggestion {{ suggestion.goalText }}
              </button>
              <button type="button" @click="rejectGoalSuggestion(suggestion)">
                Reject Goal Suggestion {{ suggestion.goalText }}
              </button>
            </li>
          </ul>
        </section>

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
                <p v-if="goal.progressFormat">
                  Progress Format: {{ goal.progressFormat }}
                </p>
                <p v-if="goal.schedulePattern">
                  Schedule Pattern: {{ goal.schedulePattern }}
                </p>
                <p v-if="goal.deadlineSuggestion">
                  Deadline {{ goal.deadlineSuggestion }}
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

      <div v-else-if="activeSurface === 'settings'" class="surface-content">
        <p>{{ surface.description }}</p>

        <section class="form-section" aria-label="Reminder Settings">
          <h3>Reminder Settings</h3>
          <p class="form-error" v-if="!notificationsEnabled">
            Notifications are strongly recommended for reliable reminders.
          </p>

          <p>
            Notifications:
            <strong>{{ notificationsEnabled ? "Enabled" : "Disabled" }}</strong>
          </p>

          <label for="reminder-offset">Reminder Offset</label>
          <input
            id="reminder-offset"
            v-model.number="reminderOffsetMinutes"
            aria-label="Reminder Offset"
            min="0"
            step="5"
            type="number"
          />

          <p class="planning-state">
            Early reminders: {{ reminderOffsetMinutes }} minutes before start
          </p>
        </section>
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
