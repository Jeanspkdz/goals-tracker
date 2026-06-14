import {
  CalendarDays,
  ClipboardCheck,
  Flag,
  LayoutDashboard,
  Settings,
  Sparkles
} from "lucide-react";
import { useMemo, useState } from "react";
import "./styles.css";

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

const surfaceById = new Map(surfaces.map((surface) => [surface.id, surface]));

function formatToday(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(date);
}

export function App() {
  const [activeSurface, setActiveSurface] = useState<SurfaceId>("calendar");
  const todayLabel = useMemo(() => formatToday(new Date()), []);
  const surface = surfaceById.get(activeSurface) ?? surfaces[0];
  const Icon = surface.icon;

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div>
          <p className="eyebrow">AI-assisted planning</p>
          <h1>Goals Tracker</h1>
        </div>

        <nav className="surface-nav" aria-label="App surfaces">
          {surfaces.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                aria-current={item.id === activeSurface ? "page" : undefined}
                className="nav-button"
                key={item.id}
                onClick={() => setActiveSurface(item.id)}
                type="button"
              >
                <ItemIcon aria-hidden="true" size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="surface-panel" aria-labelledby="surface-heading">
        <div className="surface-header">
          <div className="surface-icon" aria-hidden="true">
            <Icon size={28} />
          </div>
          <div>
            <p className="eyebrow">{surface.label}</p>
            <h2 id="surface-heading">{surface.heading}</h2>
          </div>
        </div>

        {activeSurface === "calendar" ? (
          <CalendarPreview todayLabel={todayLabel} />
        ) : (
          <PlaceholderSurface description={surface.description} />
        )}
      </section>
    </main>
  );
}

function CalendarPreview({ todayLabel }: { todayLabel: string }) {
  return (
    <div className="surface-content">
      <div className="today-band">
        <span>Today</span>
        <strong>{todayLabel}</strong>
      </div>

      <p>
        The Calendar Screen is the planning surface for events, scheduled tasks,
        reminders, and daily plans.
      </p>

      <div className="empty-state">
        <h3>Daily Plan</h3>
        <p>
          No Events or Scheduled Tasks are loaded yet. The next slice will add
          the behavior behind this shell.
        </p>
      </div>
    </div>
  );
}

function PlaceholderSurface({ description }: { description: string }) {
  return (
    <div className="surface-content">
      <p>{description}</p>
      <div className="empty-state">
        <h3>Ready for the next slice</h3>
        <p>
          This screen is intentionally a shell. Product behavior will arrive in
          focused vertical slices.
        </p>
      </div>
    </div>
  );
}
