export type ReminderPlanItem =
  | {
      id: string;
      kind: "event";
      title: string;
      startsAt: string;
      endsAt: string;
    }
  | {
      id: string;
      kind: "scheduled-task";
      title: string;
      priority: "High" | "Medium" | "Low";
      startsAt: string;
      endsAt: string;
    };

export type ReminderTiming = "early" | "start";

export type Reminder = {
  id: string;
  planItemId: string;
  planItemKind: ReminderPlanItem["kind"];
  timing: ReminderTiming;
  remindAt: string;
  title: string;
  body: string;
  snoozed?: boolean;
};

type CreateRemindersInput = {
  reminderOffsetMinutes: number;
  items: ReminderPlanItem[];
};

type SnoozeReminderInput = {
  snoozeMinutes: number;
  now: string;
};

type ReminderDeliveryInput = {
  notificationsEnabled: boolean;
};

export type ReminderDeliveryState = {
  notificationsEnabled: boolean;
  canUseDeviceNotifications: boolean;
  warning: string | null;
};

export function createRemindersForDailyPlan({
  reminderOffsetMinutes,
  items
}: CreateRemindersInput): Reminder[] {
  return items.flatMap((item) => [
    createReminder(item, "early", reminderOffsetMinutes),
    createReminder(item, "start", reminderOffsetMinutes)
  ]);
}

export function snoozeReminder(
  reminder: Reminder,
  { snoozeMinutes, now }: SnoozeReminderInput
): Reminder {
  if (reminder.snoozed) {
    throw new Error("Reminder can only be snoozed once.");
  }

  return {
    ...reminder,
    remindAt: new Date(
      new Date(now).getTime() + snoozeMinutes * 60_000
    ).toISOString(),
    snoozed: true
  };
}

export function createReminderDeliveryState({
  notificationsEnabled
}: ReminderDeliveryInput): ReminderDeliveryState {
  return {
    notificationsEnabled,
    canUseDeviceNotifications: notificationsEnabled,
    warning: notificationsEnabled
      ? null
      : "Notifications are strongly recommended for reliable reminders."
  };
}

function createReminder(
  item: ReminderPlanItem,
  timing: ReminderTiming,
  reminderOffsetMinutes: number
): Reminder {
  return {
    id: `${item.id}-${timing}`,
    planItemId: item.id,
    planItemKind: item.kind,
    timing,
    remindAt: reminderTime(item.startsAt, timing, reminderOffsetMinutes),
    title: item.title,
    body: reminderBody(item, timing, reminderOffsetMinutes)
  };
}

function reminderTime(
  startsAt: string,
  timing: ReminderTiming,
  reminderOffsetMinutes: number
) {
  if (timing === "start") {
    return startsAt;
  }

  return new Date(
    new Date(startsAt).getTime() - reminderOffsetMinutes * 60_000
  ).toISOString();
}

function reminderBody(
  item: ReminderPlanItem,
  timing: ReminderTiming,
  reminderOffsetMinutes: number
) {
  if (item.kind === "event") {
    return timing === "early"
      ? `Event at ${timeLabel(item.startsAt)}`
      : "Event starting now";
  }

  return timing === "early"
    ? `${item.priority} Priority task starts in ${reminderOffsetMinutes} minutes`
    : `${item.priority} Priority task starting now`;
}

function timeLabel(isoDate: string) {
  return isoDate.slice(11, 16);
}
