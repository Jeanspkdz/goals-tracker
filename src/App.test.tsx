import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";

describe("Goals Tracker app shell", () => {
  it("renders the v1 navigation surfaces using domain language", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Goals Tracker" })
    ).toBeInTheDocument();

    for (const surface of [
      "Onboarding",
      "Goals",
      "Calendar",
      "Daily Review",
      "Weekly Review",
      "Settings"
    ]) {
      expect(screen.getByRole("button", { name: surface })).toBeInTheDocument();
    }
  });

  it("opens the Calendar Screen to today by default", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Calendar Screen" })
    ).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(
      screen.getByText(/events, scheduled tasks, reminders, and daily plans/i)
    ).toBeInTheDocument();
  });

  it("lets the user navigate between all v1 surfaces", async () => {
    const user = userEvent.setup();
    render(<App />);

    const expectedHeadings = [
      ["Onboarding", "Onboarding"],
      ["Goals", "Goals"],
      ["Calendar", "Calendar Screen"],
      ["Daily Review", "Daily Review"],
      ["Weekly Review", "Weekly Review"],
      ["Settings", "Settings"]
    ] as const;

    for (const [buttonName, headingName] of expectedHeadings) {
      await user.click(screen.getByRole("button", { name: buttonName }));
      expect(
        screen.getByRole("heading", { name: headingName })
      ).toBeInTheDocument();
    }
  });
});
