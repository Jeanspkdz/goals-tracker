import { describe, expect, it } from "vitest";
import {
  createReminderDeliveryState,
  createRemindersForDailyPlan,
  snoozeReminder
} from "./reminders";

describe("reminders", () => {
  it("creates early and start-time reminders for Events and Scheduled Tasks", () => {
    const reminders = createRemindersForDailyPlan({
      reminderOffsetMinutes: 15,
      items: [
        {
          id: "event-1",
          kind: "event",
          title: "Go to a contest",
          startsAt: "2026-07-05T15:00:00.000Z",
          endsAt: "2026-07-05T16:00:00.000Z"
        },
        {
          id: "task-1",
          kind: "scheduled-task",
          title: "Draft reminder model",
          priority: "High",
          startsAt: "2026-07-05T17:00:00.000Z",
          endsAt: "2026-07-05T18:00:00.000Z"
        }
      ]
    });

    expect(reminders).toEqual([
      {
        id: "event-1-early",
        planItemId: "event-1",
        planItemKind: "event",
        timing: "early",
        remindAt: "2026-07-05T14:45:00.000Z",
        title: "Go to a contest",
        body: "Event at 15:00"
      },
      {
        id: "event-1-start",
        planItemId: "event-1",
        planItemKind: "event",
        timing: "start",
        remindAt: "2026-07-05T15:00:00.000Z",
        title: "Go to a contest",
        body: "Event starting now"
      },
      {
        id: "task-1-early",
        planItemId: "task-1",
        planItemKind: "scheduled-task",
        timing: "early",
        remindAt: "2026-07-05T16:45:00.000Z",
        title: "Draft reminder model",
        body: "High Priority task starts in 15 minutes"
      },
      {
        id: "task-1-start",
        planItemId: "task-1",
        planItemKind: "scheduled-task",
        timing: "start",
        remindAt: "2026-07-05T17:00:00.000Z",
        title: "Draft reminder model",
        body: "High Priority task starting now"
      }
    ]);
  });

  it("updates reminder times when the Daily Plan changes", () => {
    const reminders = createRemindersForDailyPlan({
      reminderOffsetMinutes: 10,
      items: [
        {
          id: "task-1",
          kind: "scheduled-task",
          title: "Draft reminder model",
          priority: "Medium",
          startsAt: "2026-07-05T18:30:00.000Z",
          endsAt: "2026-07-05T19:30:00.000Z"
        }
      ]
    });

    expect(reminders.map((reminder) => reminder.remindAt)).toEqual([
      "2026-07-05T18:20:00.000Z",
      "2026-07-05T18:30:00.000Z"
    ]);
  });

  it("allows one short snooze for a reminder", () => {
    const [reminder] = createRemindersForDailyPlan({
      reminderOffsetMinutes: 15,
      items: [
        {
          id: "task-1",
          kind: "scheduled-task",
          title: "Draft reminder model",
          priority: "High",
          startsAt: "2026-07-05T17:00:00.000Z",
          endsAt: "2026-07-05T18:00:00.000Z"
        }
      ]
    });

    const snoozed = snoozeReminder(reminder, {
      snoozeMinutes: 5,
      now: "2026-07-05T16:45:00.000Z"
    });

    expect(snoozed).toMatchObject({
      id: "task-1-early",
      remindAt: "2026-07-05T16:50:00.000Z",
      snoozed: true
    });
    expect(() =>
      snoozeReminder(snoozed, {
        snoozeMinutes: 5,
        now: "2026-07-05T16:50:00.000Z"
      })
    ).toThrow("Reminder can only be snoozed once.");
  });

  it("keeps reminders visible in-app when notifications are disabled", () => {
    expect(
      createReminderDeliveryState({ notificationsEnabled: false })
    ).toEqual({
      notificationsEnabled: false,
      canUseDeviceNotifications: false,
      warning:
        "Notifications are strongly recommended for reliable reminders."
    });
  });
});
