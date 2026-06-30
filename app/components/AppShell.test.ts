import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AppShell from "./AppShell.vue";

describe("Goals Tracker app shell", () => {
  it("renders the v1 navigation surfaces using domain language", () => {
    const wrapper = mount(AppShell);

    expect(wrapper.get("h1").text()).toBe("Goals Tracker");

    for (const surface of [
      "Onboarding",
      "Goals",
      "Calendar",
      "Daily Review",
      "Weekly Review",
      "Settings"
    ]) {
      expect(
        wrapper.findAll("button").some((button) => button.text() === surface)
      ).toBe(true);
    }
  });

  it("opens the Calendar Screen to today by default", () => {
    const wrapper = mount(AppShell);

    expect(wrapper.get("#surface-heading").text()).toBe("Calendar Screen");
    expect(wrapper.text()).toContain("Today");
    expect(wrapper.text()).toContain(
      "events, scheduled tasks, reminders, and daily plans"
    );
  });

  it("lets the user navigate between all v1 surfaces", async () => {
    const wrapper = mount(AppShell);
    const expectedHeadings = [
      ["Onboarding", "Onboarding"],
      ["Goals", "Goals"],
      ["Calendar", "Calendar Screen"],
      ["Daily Review", "Daily Review"],
      ["Weekly Review", "Weekly Review"],
      ["Settings", "Settings"]
    ] as const;

    for (const [buttonName, headingName] of expectedHeadings) {
      const button = wrapper
        .findAll("button")
        .find((item) => item.text() === buttonName);

      expect(button).toBeDefined();
      await button?.trigger("click");
      expect(wrapper.get("#surface-heading").text()).toBe(headingName);
    }
  });

  it("connects one active AI Provider after a structured generation connection test", async () => {
    const wrapper = mount(AppShell);

    await clickButton(wrapper, "Onboarding");
    await wrapper.get("input[aria-label='Provider name']").setValue("Fake Provider");
    await wrapper
      .get("input[aria-label='Provider Credential']")
      .setValue("secret-test-key");
    await clickButton(wrapper, "Run Provider Connection Test");

    expect(wrapper.text()).toContain("AI Provider connected");
    expect(wrapper.text()).toContain("Active provider: Fake Provider");
    expect(wrapper.text()).toContain("Structured text generation");
    expect(wrapper.text()).toContain("Supported");
    expect(wrapper.text()).toContain("Conversation evidence import");
    expect(wrapper.text()).toContain("Disabled");
    expect(wrapper.text()).toContain(
      "Fake Provider does not support conversation import."
    );
    expect(wrapper.text()).not.toContain("secret-test-key");
    expect(
      (
        wrapper.get("input[aria-label='Provider Credential']")
          .element as HTMLInputElement
      ).value
    ).toBe("");
  });

  it("keeps Manual Mode when the Provider Connection Test fails", async () => {
    const wrapper = mount(AppShell);

    await clickButton(wrapper, "Onboarding");
    await wrapper.get("input[aria-label='Provider name']").setValue("Fake Provider");
    await wrapper
      .get("input[aria-label='Provider Credential']")
      .setValue("bad-secret");
    await wrapper.get("select[aria-label='Fake Provider test mode']").setValue("failure");
    await clickButton(wrapper, "Run Provider Connection Test");

    expect(wrapper.text()).toContain("Provider Connection Test failed.");
    expect(wrapper.text()).toContain("Manual Mode");
    expect(wrapper.text()).not.toContain("AI Provider connected");
    expect(wrapper.text()).not.toContain("bad-secret");
  });

  it("keeps only one active AI Provider when a second provider connects", async () => {
    const wrapper = mount(AppShell);

    await clickButton(wrapper, "Onboarding");
    await wrapper.get("input[aria-label='Provider name']").setValue("First Provider");
    await wrapper.get("input[aria-label='Provider Credential']").setValue("first-secret");
    await clickButton(wrapper, "Run Provider Connection Test");

    await wrapper.get("input[aria-label='Provider name']").setValue("Second Provider");
    await wrapper.get("input[aria-label='Provider Credential']").setValue("second-secret");
    await clickButton(wrapper, "Run Provider Connection Test");

    expect(wrapper.text()).toContain("Active provider: Second Provider");
    expect(wrapper.text()).not.toContain("Active provider: First Provider");
  });

  it("disconnects back to Manual Mode without deleting planning history", async () => {
    const wrapper = mount(AppShell);

    await createGoal(wrapper, "Keep existing planning history");
    await clickButton(wrapper, "Calendar");
    await createEvent(wrapper, {
      title: "Existing event",
      date: "2026-07-05",
      startTime: "15:00",
      endTime: "16:00"
    });

    await connectFakeProvider(wrapper, "Fake Provider", "secret-test-key");
    await clickButton(wrapper, "Disconnect Provider");

    expect(wrapper.text()).toContain("Manual Mode");
    expect(wrapper.text()).not.toContain("AI Provider connected");

    await clickButton(wrapper, "Goals");
    expect(wrapper.text()).toContain("Keep existing planning history");

    await clickButton(wrapper, "Calendar");
    expect(wrapper.text()).toContain("Existing event");
  });

  it("accepts a fake AI Goal Suggestion into an Active Goal package", async () => {
    const wrapper = mount(AppShell);

    await connectFakeProvider(wrapper, "Fake Provider", "secret-test-key");
    await clickButton(wrapper, "Goals");
    await wrapper
      .get("textarea[aria-label='Goal Prompt']")
      .setValue("I want to get better at Vue and Nuxt");
    await clickButton(wrapper, "Generate Goal Suggestions");

    expect(wrapper.text()).toContain("Goal Suggestions");
    expect(wrapper.text()).toContain("Ship a Nuxt goals tracker onboarding flow");
    expect(wrapper.text()).toContain("Progress Format: Milestones completed");
    expect(wrapper.text()).toContain("Schedule Pattern: 3 focus blocks per week");
    expect(wrapper.text()).toContain("Suggested deadline: 2026-07-31");
    expect(wrapper.text()).toContain("Build provider setup UI");

    await clickButton(
      wrapper,
      "Accept Goal Suggestion Ship a Nuxt goals tracker onboarding flow"
    );

    expect(wrapper.text()).toContain("Active Goal created from Goal Suggestion.");
    expect(wrapper.text()).toContain("Ship a Nuxt goals tracker onboarding flow");
    expect(wrapper.text()).toContain("Goal Progress: 0 of 3 Tasks completed");
    expect(wrapper.text()).toContain("Milestones completed");
    expect(wrapper.text()).toContain("3 focus blocks per week");
    expect(wrapper.text()).toContain("Deadline 2026-07-31");
    expect(wrapper.text()).toContain("Build provider setup UI");
    expect(wrapper.text()).toContain("High Priority");
    expect(wrapper.text()).toContain("Focus Effort");
  });

  it("rejects a Goal Suggestion into structured AI Suggestion History only", async () => {
    const wrapper = mount(AppShell);

    await connectFakeProvider(wrapper, "Fake Provider", "secret-test-key");
    await clickButton(wrapper, "Goals");
    await wrapper
      .get("textarea[aria-label='Goal Prompt']")
      .setValue("raw prompt that should not be kept");
    await clickButton(wrapper, "Generate Goal Suggestions");
    await clickButton(
      wrapper,
      "Reject Goal Suggestion Ship a Nuxt goals tracker onboarding flow"
    );

    expect(wrapper.text()).toContain(
      "Goal Suggestion rejected and stored as structured AI Suggestion History."
    );
    expect(wrapper.text()).toContain("No manual Goals yet");
    expect(wrapper.text()).not.toContain("raw prompt that should not be kept");
    expect(wrapper.text()).not.toContain("Ship a Nuxt goals tracker onboarding flow");
  });

  it("shows provider failure when Goal Suggestion generation fails", async () => {
    const wrapper = mount(AppShell);

    await connectFakeProvider(wrapper, "Fake Provider", "secret-test-key");
    await clickButton(wrapper, "Goals");
    await wrapper
      .get("textarea[aria-label='Goal Prompt']")
      .setValue("Help me become better at planning");
    await wrapper
      .get("select[aria-label='Fake Goal Suggestion mode']")
      .setValue("failure");
    await clickButton(wrapper, "Generate Goal Suggestions");

    expect(wrapper.text()).toContain("Goal Suggestion generation failed.");
    expect(wrapper.text()).toContain("No manual Goals yet");
    expect(wrapper.text()).not.toContain("Ship a Nuxt goals tracker onboarding flow");
  });

  it("lets the user create a manual Goal with one Task and see Goal Progress", async () => {
    const wrapper = mount(AppShell);

    await clickButton(wrapper, "Goals");
    await wrapper.get("input[aria-label='Goal title']").setValue(
      "Ship a portfolio-ready Goals Tracker"
    );
    await clickButton(wrapper, "Create Goal");

    expect(wrapper.text()).toContain("Ship a portfolio-ready Goals Tracker");
    expect(wrapper.text()).toContain("Active");
    expect(wrapper.text()).toContain("Goal Progress: 0 of 0 Tasks completed");

    await addTask(wrapper, {
      goalTitle: "Ship a portfolio-ready Goals Tracker",
      title: "Design the Goal card",
      priority: "High",
      deadline: "2026-07-01",
      effort: "Focus"
    });

    expect(wrapper.text()).toContain("Design the Goal card");
    expect(wrapper.text()).toContain("High Priority");
    expect(wrapper.text()).toContain("Focus Effort");
    expect(wrapper.text()).toContain("Goal Progress: 0 of 1 Tasks completed");

    await wrapper
      .get("select[aria-label='Status for Design the Goal card']")
      .setValue("Completed");

    expect(wrapper.text()).toContain("Goal Progress: 1 of 1 Tasks completed");
  });

  it("lets the user edit Goal details and complete a Goal only after progress and confirmation", async () => {
    const wrapper = mount(AppShell);

    await createGoal(wrapper, "Publish the v1 planner");

    await wrapper
      .get("input[aria-label='Edit Goal title for Publish the v1 planner']")
      .setValue("Publish the v1 goals planner");

    expect(wrapper.text()).toContain("Publish the v1 goals planner");

    await addTask(wrapper, {
      title: "Write the manual Goals screen",
      priority: "Medium",
      deadline: "2026-07-02",
      effort: "Focus"
    });

    await wrapper.get("select[aria-label='Goal Status']").setValue("Completed");

    expect(wrapper.text()).toContain(
      "Complete all Tasks and confirm completion before marking this Goal Completed."
    );
    expect(wrapper.text()).toContain("Active");

    await wrapper
      .get("select[aria-label='Status for Write the manual Goals screen']")
      .setValue("Completed");
    await wrapper.get("input[aria-label='Confirm Goal completion']").setValue(true);
    await wrapper.get("select[aria-label='Goal Status']").setValue("Completed");

    expect(wrapper.text()).toContain("Completed");

    await wrapper.get("select[aria-label='Goal Status']").setValue("Archived");

    expect(wrapper.text()).toContain("Archived");
    expect(wrapper.text()).toContain("Out of future planning");
  });

  it("keeps skipped Tasks in history while removing them from future planning", async () => {
    const wrapper = mount(AppShell);

    await createGoal(wrapper, "Improve planning accuracy");
    await addTask(wrapper, {
      title: "Review last week of deferred Tasks",
      priority: "Low",
      deadline: "2026-07-03",
      effort: "Light"
    });

    expect(wrapper.text()).toContain("Review last week of deferred Tasks");
    expect(wrapper.text()).toContain("Low Priority");
    expect(wrapper.text()).toContain("Light Effort");
    expect(wrapper.text()).toContain("Deadline 2026-07-03");
    expect(wrapper.text()).toContain("Planned");
    expect(wrapper.text()).toContain("Task planning: Included in future planning");

    await wrapper
      .get("select[aria-label='Status for Review last week of deferred Tasks']")
      .setValue("Blocked");

    expect(wrapper.text()).toContain("Blocked");

    await wrapper
      .get("select[aria-label='Status for Review last week of deferred Tasks']")
      .setValue("Skipped");

    expect(wrapper.text()).toContain("Review last week of deferred Tasks");
    expect(wrapper.text()).toContain("Skipped");
    expect(wrapper.text()).toContain("Task planning: Out of future planning");
  });

  it("creates each Task under exactly one Goal", async () => {
    const wrapper = mount(AppShell);

    await createGoal(wrapper, "Build Nuxt foundation");
    await createGoal(wrapper, "Prepare manual planning");

    await wrapper
      .get("input[aria-label='Task title for Prepare manual planning']")
      .setValue("Draft the manual Task model");
    await wrapper
      .get("select[aria-label='Task Priority for Prepare manual planning']")
      .setValue("High");
    await wrapper
      .get("input[aria-label='Task Deadline for Prepare manual planning']")
      .setValue("2026-07-04");
    await wrapper
      .get("select[aria-label='Task Effort for Prepare manual planning']")
      .setValue("Focus");
    await clickButton(wrapper, "Add Task to Prepare manual planning");

    expect(goalCardText(wrapper, "Build Nuxt foundation")).toContain(
      "Goal Progress: 0 of 0 Tasks completed"
    );
    expect(goalCardText(wrapper, "Build Nuxt foundation")).not.toContain(
      "Draft the manual Task model"
    );
    expect(goalCardText(wrapper, "Prepare manual planning")).toContain(
      "Draft the manual Task model"
    );
    expect(goalCardText(wrapper, "Prepare manual planning")).toContain(
      "Goal Progress: 0 of 1 Tasks completed"
    );
  });

  it("lets the user configure the global Reminder Offset and warns when notifications are disabled", async () => {
    const wrapper = mount(AppShell);

    await clickButton(wrapper, "Settings");

    expect(wrapper.text()).toContain(
      "Notifications are strongly recommended for reliable reminders."
    );
    expect(wrapper.text()).toContain("Notifications: Disabled");
    expect(wrapper.text()).toContain("Early reminders: 15 minutes before start");

    await wrapper.get("input[aria-label='Reminder Offset']").setValue(30);

    expect(wrapper.text()).toContain("Early reminders: 30 minutes before start");
  });

  it("lets the user create one-time Events on the Calendar Screen", async () => {
    const wrapper = mount(AppShell);

    await wrapper.get("input[aria-label='Event title']").setValue("Go to a contest");
    await wrapper.get("input[aria-label='Event date']").setValue("2026-07-05");
    await wrapper.get("input[aria-label='Event start time']").setValue("15:00");
    await wrapper.get("input[aria-label='Event end time']").setValue("16:00");
    await clickButton(wrapper, "Create Event");

    expect(wrapper.text()).toContain("Events");
    expect(wrapper.text()).toContain("Go to a contest");
    expect(wrapper.text()).toContain("15:00-16:00");
    expect(wrapper.text()).toContain("Event constraint");
    expect(wrapper.text()).not.toContain("Goal Progress: 1 of");
  });

  it("prevents overlapping Scheduled Tasks in the Daily Plan", async () => {
    const wrapper = mount(AppShell);

    await addScheduledTask(wrapper, {
      title: "Write Calendar UI",
      priority: "High",
      startTime: "09:00",
      endTime: "10:00"
    });

    expect(wrapper.text()).toContain("Daily Plan");
    expect(wrapper.text()).toContain("Write Calendar UI");
    expect(wrapper.text()).toContain("09:00-10:00");
    expect(wrapper.text()).toContain("High Priority");

    await addScheduledTask(wrapper, {
      title: "Overlap the Calendar UI",
      priority: "Medium",
      startTime: "09:30",
      endTime: "10:30"
    });

    expect(wrapper.text()).toContain("Scheduled Tasks cannot overlap.");
    expect(wrapper.text()).not.toContain("Overlap the Calendar UI");
  });

  it("allows Event and Scheduled Task overlaps with Event Conflict Feedback", async () => {
    const wrapper = mount(AppShell);

    await createEvent(wrapper, {
      title: "Go to a contest",
      date: "2026-07-05",
      startTime: "15:00",
      endTime: "16:00"
    });
    await addScheduledTask(wrapper, {
      title: "Practice contest notes",
      priority: "Medium",
      startTime: "15:30",
      endTime: "16:30"
    });

    expect(wrapper.text()).toContain("Practice contest notes");
    expect(wrapper.text()).toContain("Event Conflict Feedback");
    expect(wrapper.text()).toContain(
      "Practice contest notes overlaps Go to a contest."
    );
    expect(wrapper.text()).toContain(
      "Specific fixes: reschedule the Scheduled Task or shorten the task block."
    );
    expect(wrapper.text()).toContain("Not a Lesson Suggestion");
  });

  it("prevents manual Scheduled Task edits that create overlaps", async () => {
    const wrapper = mount(AppShell);

    await addScheduledTask(wrapper, {
      title: "Write Calendar UI",
      priority: "High",
      startTime: "09:00",
      endTime: "10:00"
    });
    await addScheduledTask(wrapper, {
      title: "Review Calendar UI",
      priority: "Medium",
      startTime: "10:30",
      endTime: "11:00"
    });

    await wrapper
      .get("input[aria-label='Start time for Review Calendar UI']")
      .setValue("09:30");

    expect(wrapper.text()).toContain("Scheduled Tasks cannot overlap.");
    expect(wrapper.get("input[aria-label='Start time for Review Calendar UI']").element)
      .toHaveProperty("value", "10:30");
  });

  it("shows early and start-time reminders for Events and Scheduled Tasks", async () => {
    const wrapper = mount(AppShell);

    await createEvent(wrapper, {
      title: "Go to a contest",
      date: "2026-07-05",
      startTime: "15:00",
      endTime: "16:00"
    });
    await addScheduledTask(wrapper, {
      title: "Practice contest notes",
      priority: "High",
      startTime: "17:00",
      endTime: "18:00"
    });

    expect(wrapper.text()).toContain("Reminders");
    expect(wrapper.text()).toContain("Go to a contest");
    expect(wrapper.text()).toContain("Event at 15:00");
    expect(wrapper.text()).toContain("Event starting now");
    expect(wrapper.text()).toContain("Practice contest notes");
    expect(wrapper.text()).toContain("High Priority task starts in 15 minutes");
    expect(wrapper.text()).toContain("High Priority task starting now");
  });

  it("updates reminders after Daily Plan edits and allows one snooze", async () => {
    const wrapper = mount(AppShell);

    await addScheduledTask(wrapper, {
      title: "Practice contest notes",
      priority: "High",
      startTime: "17:00",
      endTime: "18:00"
    });

    expect(wrapper.text()).toContain("High Priority task starts in 15 minutes");
    expect(wrapper.text()).toContain("T16:45:00.000Z");

    await wrapper
      .get("input[aria-label='Start time for Practice contest notes']")
      .setValue("18:00");

    expect(wrapper.text()).toContain("T17:45:00.000Z");

    await clickButton(wrapper, "Snooze reminder for Practice contest notes early");

    expect(wrapper.text()).toContain("Snoozed");
    expect(wrapper.text()).toContain("T17:50:00.000Z");
    expect(
      wrapper
        .findAll("button")
        .some(
          (button) =>
            button.text() === "Snooze reminder for Practice contest notes early"
        )
      ).toBe(false);
  });

  it("generates a tomorrow-only Schedule Suggestion around Events", async () => {
    const wrapper = mount(AppShell);
    const tomorrow = tomorrowDate();

    await connectFakeProvider(wrapper, "Fake Provider", "secret-test-key");
    await createGoal(wrapper, "Ship schedule suggestions");
    await addTask(wrapper, {
      title: "Draft the schedule suggestion flow",
      priority: "High",
      deadline: tomorrow,
      effort: "Focus"
    });
    await clickButton(wrapper, "Calendar");
    await createEvent(wrapper, {
      title: "Morning appointment",
      date: tomorrow,
      startTime: "09:00",
      endTime: "10:00"
    });
    await clickButton(wrapper, "Generate Tomorrow Schedule Suggestion");

    expect(wrapper.text()).toContain("Schedule Suggestions");
    expect(wrapper.text()).toContain(`Suggestion date: ${tomorrow}`);
    expect(wrapper.text()).toContain("Morning appointment");
    expect(wrapper.text()).toContain("Draft the schedule suggestion flow");
    expect(wrapper.text()).toContain("10:00-11:00");
    expect(wrapper.text()).toContain("Works around Events");
  });

  it("lets the user edit and accept one Schedule Suggestion as tomorrow's Daily Plan", async () => {
    const wrapper = mount(AppShell);
    const tomorrow = tomorrowDate();

    await connectFakeProvider(wrapper, "Fake Provider", "secret-test-key");
    await createGoal(wrapper, "Ship schedule suggestions");
    await addTask(wrapper, {
      title: "Draft the schedule suggestion flow",
      priority: "High",
      deadline: tomorrow,
      effort: "Focus"
    });
    await clickButton(wrapper, "Calendar");
    await clickButton(wrapper, "Generate Tomorrow Schedule Suggestion");
    await wrapper
      .get("input[aria-label='Suggested start time for Draft the schedule suggestion flow']")
      .setValue("13:00");
    await wrapper
      .get("input[aria-label='Suggested end time for Draft the schedule suggestion flow']")
      .setValue("14:00");
    await clickButton(wrapper, "Accept Schedule Suggestion");

    expect(wrapper.text()).toContain(`Accepted Daily Plan for ${tomorrow}`);
    expect(wrapper.text()).toContain("Draft the schedule suggestion flow");
    expect(wrapper.text()).toContain("13:00-14:00");
    expect(wrapper.text()).not.toContain("Accept Schedule Suggestion");
  });

  it("requires a free-text Regeneration Reason and keeps multiple Schedule Suggestions before acceptance", async () => {
    const wrapper = mount(AppShell);

    await connectFakeProvider(wrapper, "Fake Provider", "secret-test-key");
    await createGoal(wrapper, "Ship schedule suggestions");
    await addTask(wrapper, {
      title: "Draft the schedule suggestion flow",
      priority: "High",
      deadline: tomorrowDate(),
      effort: "Focus"
    });
    await clickButton(wrapper, "Calendar");
    await clickButton(wrapper, "Generate Tomorrow Schedule Suggestion");
    await clickButton(wrapper, "Regenerate Schedule Suggestion");

    expect(wrapper.text()).toContain("Regeneration Reason is required.");
    expect(wrapper.findAll(".schedule-suggestion-card")).toHaveLength(1);

    await wrapper
      .get("textarea[aria-label='Regeneration Reason']")
      .setValue("Need a later focus block after lunch");
    await clickButton(wrapper, "Regenerate Schedule Suggestion");

    expect(wrapper.text()).toContain(
      "Regeneration Reason stored as structured AI Suggestion History."
    );
    expect(wrapper.findAll(".schedule-suggestion-card")).toHaveLength(2);
    expect(wrapper.text()).toContain("Need a later focus block after lunch");
  });

  it("rejects a Schedule Suggestion into structured AI Suggestion History", async () => {
    const wrapper = mount(AppShell);

    await connectFakeProvider(wrapper, "Fake Provider", "secret-test-key");
    await createGoal(wrapper, "Ship schedule suggestions");
    await addTask(wrapper, {
      title: "Draft the schedule suggestion flow",
      priority: "High",
      deadline: tomorrowDate(),
      effort: "Focus"
    });
    await clickButton(wrapper, "Calendar");
    await clickButton(wrapper, "Generate Tomorrow Schedule Suggestion");
    await clickButton(wrapper, "Reject Schedule Suggestion");

    expect(wrapper.text()).toContain(
      "Schedule Suggestion rejected and stored as structured AI Suggestion History."
    );
    expect(wrapper.findAll(".schedule-suggestion-card")).toHaveLength(0);
    expect(wrapper.text()).not.toContain("Accepted Daily Plan");
  });
});

async function clickButton(wrapper: ReturnType<typeof mount>, text: string) {
  const button = wrapper.findAll("button").find((item) => item.text() === text);

  expect(button).toBeDefined();
  await button?.trigger("click");
}

async function createGoal(wrapper: ReturnType<typeof mount>, title: string) {
  await clickButton(wrapper, "Goals");
  await wrapper.get("input[aria-label='Goal title']").setValue(title);
  await clickButton(wrapper, "Create Goal");
}

async function connectFakeProvider(
  wrapper: ReturnType<typeof mount>,
  providerName: string,
  credential: string
) {
  await clickButton(wrapper, "Onboarding");
  await wrapper.get("input[aria-label='Provider name']").setValue(providerName);
  await wrapper.get("input[aria-label='Provider Credential']").setValue(credential);
  await clickButton(wrapper, "Run Provider Connection Test");
}

async function addTask(
  wrapper: ReturnType<typeof mount>,
  task: {
    goalTitle?: string;
    title: string;
    priority: "High" | "Medium" | "Low";
    deadline: string;
    effort: "Light" | "Focus";
  }
) {
  const goalTitle = task.goalTitle ?? wrapper.get(".goal-card h3").text();

  await wrapper
    .get(`input[aria-label='Task title for ${goalTitle}']`)
    .setValue(task.title);
  await wrapper
    .get(`select[aria-label='Task Priority for ${goalTitle}']`)
    .setValue(task.priority);
  await wrapper
    .get(`input[aria-label='Task Deadline for ${goalTitle}']`)
    .setValue(task.deadline);
  await wrapper
    .get(`select[aria-label='Task Effort for ${goalTitle}']`)
    .setValue(task.effort);
  await clickButton(wrapper, `Add Task to ${goalTitle}`);
}

function goalCardText(wrapper: ReturnType<typeof mount>, goalTitle: string) {
  const card = wrapper
    .findAll(".goal-card")
    .find((item) => item.text().includes(goalTitle));

  expect(card).toBeDefined();
  return card?.text() ?? "";
}

async function addScheduledTask(
  wrapper: ReturnType<typeof mount>,
  task: {
    title: string;
    priority: "High" | "Medium" | "Low";
    startTime: string;
    endTime: string;
  }
) {
  await wrapper
    .get("input[aria-label='Scheduled Task title']")
    .setValue(task.title);
  await wrapper
    .get("select[aria-label='Scheduled Task Priority']")
    .setValue(task.priority);
  await wrapper
    .get("input[aria-label='Scheduled Task start time']")
    .setValue(task.startTime);
  await wrapper
    .get("input[aria-label='Scheduled Task end time']")
    .setValue(task.endTime);
  await clickButton(wrapper, "Add Scheduled Task");
}

async function createEvent(
  wrapper: ReturnType<typeof mount>,
  event: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  }
) {
  await wrapper.get("input[aria-label='Event title']").setValue(event.title);
  await wrapper.get("input[aria-label='Event date']").setValue(event.date);
  await wrapper
    .get("input[aria-label='Event start time']")
    .setValue(event.startTime);
  await wrapper
    .get("input[aria-label='Event end time']")
    .setValue(event.endTime);
  await clickButton(wrapper, "Create Event");
}

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}
