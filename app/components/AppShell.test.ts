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
