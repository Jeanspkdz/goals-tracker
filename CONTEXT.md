# Goals Tracker

Goals Tracker helps a user reflect on completed work and plan the next day around existing calendar commitments.

## Language

**Task**:
A concrete piece of work the user intended to complete or did complete on a specific day; each task belongs to one goal.
_Avoid_: Todo, chore, action item

**Task Status**:
The user's current review state for a task; v1 statuses are Planned, Completed, Deferred, Skipped, and Blocked. Skipped tasks remain in history but are removed from future planning.
_Avoid_: Progress format, priority

**Task Priority**:
The user-assigned importance of a task for deciding what should be scheduled first when available time is limited; v1 uses High, Medium, and Low.
_Avoid_: Urgency, order

**Task Deadline**:
An optional date by which a task should be completed, used to reduce unnecessary delay while still supporting realistic planning; AI may suggest deadlines from a specified goal, but the user accepts or edits them.
_Avoid_: Priority, alarm

**Task Effort**:
The amount of focus a task is expected to require; v1 uses Light and Focus, suggested by AI and editable by the user.
_Avoid_: Priority, duration

**Scheduled Task**:
A concrete task assigned to a specific date and time range in the user's plan, sized to fit the available block.
_Avoid_: Event, reminder

**Unscheduled Completed Task**:
A rare completed task recorded on a daily plan without a planned time block because it was accepted from unplanned completion evidence or manually added during daily review; it must attach to a goal, counts toward goal progress, appears in weekly review, and should not drive schedule pattern learning. Too many in a week should trigger a gentle weekly review warning.
_Avoid_: Scheduled task, event

**Reminder**:
A prompt shown to the user before and at the time of an event or scheduled task; task reminders show task title and priority, event reminders show event title and time. V1 should make reminders visible through device or browser notifications when available, allow one short snooze, update automatically when the daily plan changes, clearly warn when notifications are disabled, and explain missed task reminders during daily review rather than immediately.
_Avoid_: Notification

**Reminder Offset**:
The user-configurable global amount of time before events and scheduled tasks when early reminders should appear.
_Avoid_: Deadline, task duration

**Goal**:
A specific outcome the user wants to make progress toward over time, concrete enough that related tasks can be chosen and progress can be reviewed.
_Avoid_: Vague aspiration, life goal

**Goal Prompt**:
A rough goal idea entered by the user before it has been clarified into one or more specific goals.
_Avoid_: Goal, task

**Goal Suggestion**:
A specific goal proposed by the app from a goal prompt for the user to accept, edit, or discard; it should include a progress format, an initial task breakdown, a schedule pattern, and a deadline suggestion when useful.
_Avoid_: Recommendation, generated goal

**Active Goal**:
A goal created from an accepted goal suggestion or entered directly by the user, which the app considers when reviewing progress and planning future tasks. Accepting a goal suggestion also creates its progress format, accepted deadline, initial task breakdown, and schedule pattern when present.
_Avoid_: Goal suggestion, draft goal

**Goal Status**:
The user's lifecycle state for a goal; v1 statuses are Active, Completed, and Archived. Only active goals are considered for future schedule suggestions, archived goals stay in history without active planning, and a goal can be marked Completed only when its required tasks or progress criteria are fulfilled and the user confirms completion.
_Avoid_: Task status, progress format

**Goal Progress**:
The user's current advancement toward an active goal, based on completed tasks, milestones, deadlines, or measurable targets when the goal supports them.
_Avoid_: Productivity score, streak

**Progress Format**:
The way progress is measured for an active goal, chosen to fit that goal, such as completed tasks, milestones, or a count toward a measurable target.
_Avoid_: Universal percentage, score

**Task Breakdown**:
A set of concrete tasks proposed from an active goal for the user to edit and approve before those tasks are scheduled.
_Avoid_: Schedule, checklist

**Unblock Task**:
A concrete task that must be completed before a blocked task can realistically continue; blocked tasks stay out of schedule suggestions until unblocked.
_Avoid_: Blocked task, note

**Task Sizing**:
The fit between a task and the time block assigned to it, adjusted over time using the user's completion history and review feedback.
_Avoid_: Priority, deadline

**Planning Feedback**:
Information from daily reviews, plan adjustments, and reminder patterns that helps the app learn how to make future task suggestions more realistic for the user.
_Avoid_: Weekly lesson, completion evidence

**Event Conflict Feedback**:
Planning feedback recorded when an event overlaps or displaces a scheduled task, distinguished from feedback that the original schedule suggestion was unrealistic; it explains the conflict but does not become a lesson suggestion.
_Avoid_: Plan adjustment, incomplete reason

**Plan Adjustment**:
A user change to a daily plan, paired with the user's explanation, that helps distinguish between a schedule suggestion that did not fit reality and a day that changed after planning.
_Avoid_: Completion, reschedule

**Adjustment Response**:
A suggested follow-up to a plan adjustment, such as splitting a task, rescheduling it, changing a schedule pattern, creating a lesson suggestion, or treating the change as a one-off.
_Avoid_: Plan adjustment, reminder

**Incomplete Reason**:
The user's explanation for why a scheduled task was not completed; v1 reasons are Too Large, Interrupted, Not Enough Energy, Blocked, and Not Important Anymore, with an optional free-text note. Evidence import must not suggest the reason.
_Avoid_: Failure, excuse

**Task Split**:
The proposed breakdown of a too-large or conflicted task into smaller concrete tasks that can fit future scheduled blocks, requiring the same user confirmation process before the new tasks become real.
_Avoid_: Subtask, task breakdown

**Event**:
A fixed calendar commitment that occupies time and constrains the user's daily plan; events are independent from goals, do not affect goal progress, and schedule suggestions must work around events rather than move them. If an event overlaps a scheduled task after calendar edits, the app warns the user so the task can be adjusted.
_Avoid_: Task, appointment

**Daily Review**:
A short end-of-day check where the user confirms which planned tasks were completed and records important context from the day; a missed daily review remains visible the next day, then becomes missed rather than staying overdue indefinitely.
_Avoid_: Retrospective, journal entry

**Daily Review Flow**:
The ordered daily review sequence: evidence import, completion confirmation, incomplete reasons, task split or unblock handling, then tomorrow's schedule suggestion.
_Avoid_: Weekly review, daily plan

**Weekly Review**:
A summary across recent daily reviews, shown prominently on the user's chosen review day and kept visible as overdue until completed, that shows progress across active goals, completed tasks, deferred tasks, missed daily review count, capacity patterns, and lesson suggestions.
_Avoid_: Daily review, report card

**Daily Capacity**:
The user's required one-tap rating of how much energy or focus they had, captured during every daily review; v1 uses Low, Normal, and High. Capacity patterns are descriptive, are not used to predict tomorrow directly, and do not become lesson suggestions by themselves.
_Avoid_: Mood, productivity score

**Focus Window**:
A time range where the user prefers or tends to handle focus tasks better, configured by the user and refined by approved AI suggestions from planning feedback.
_Avoid_: Event, scheduled task

**Completion Evidence**:
Information from the user's day that can help suggest whether a scheduled task was completed, but does not replace user confirmation.
_Avoid_: Completion, proof

**Conversation Evidence**:
Completion evidence derived from same-day AI assistant conversations; raw conversations are not kept after review.
_Avoid_: Chat log, task

**Evidence Import**:
An optional user-enabled setting that brings outside activity information into the daily review as completion evidence; once enabled, v1 should visibly extract conversation evidence before completion confirmation through the active user-approved AI provider when supported rather than manual copy/paste, allow the user to skip import for a specific daily review, and only accepted outcomes are stored after review.
_Avoid_: Sync, automatic tracking

**User AI Integration**:
The user's own connected AI or agents API used by the app for goal suggestions, schedule suggestions, evidence import, and planning feedback.
_Avoid_: App-owned AI, built-in assistant

**AI Provider**:
A user-connected service that can power the app's AI features through a provider-neutral interface; v1 providers must support structured text generation, and only one provider may be active at a time.
_Avoid_: User AI integration, model

**Provider Capability**:
A specific AI feature supported by the active provider, such as structured text generation or conversation evidence import; unsupported capabilities should appear disabled with an explanation.
_Avoid_: Provider, setting

**Provider Connection Test**:
A check during onboarding or provider setup that verifies the selected AI provider can return structured text before the app treats it as connected.
_Avoid_: Login, provider credential

**AI Suggestion History**:
The structured record of past AI-generated suggestions and accepted outcomes, including which AI provider produced them, preserved as historical context even if the user switches providers; it is hidden from normal UI, shown only in details or debugging contexts, and deletable only after warning that removal may reduce explanation and future planning quality.
_Avoid_: Current provider state, regenerated plan

**Provider Credential**:
Sensitive connection information that lets the app use a user's AI provider; it must be treated separately from ordinary planning data and never shown back after saving.
_Avoid_: Setting, preference

**Manual Mode**:
The fallback app experience when no AI provider is connected; the user can manage goals, tasks, events, and scheduled tasks manually, while the intended AI-assisted planning experience is unavailable.
_Avoid_: Offline mode, disabled app

**Provider Disconnect**:
The user's removal of the active AI provider, which switches future app behavior to Manual Mode without deleting goals, tasks, plans, reviews, or AI suggestion history.
_Avoid_: Account deletion, history reset

**Onboarding**:
The first-run flow that guides the user to connect an AI provider before entering the main AI-assisted experience, while still allowing Manual Mode as an escape hatch. Onboarding should explain why each question helps the app plan better.
_Avoid_: Tutorial, setup wizard

**Unplanned Completion**:
A meaningful action the user appears to have completed during the day even though it was not originally planned as a scheduled task; it becomes stored progress as a completed task only if the user accepts it, attaches it to a goal, and reconciles it with the daily plan.
_Avoid_: Task, event

**Unplanned Completion Suggestion**:
A proposed unplanned completion shown during daily review for the user to attach to a goal, convert into a completed task, or ignore; its title is AI-normalized and not edited during acceptance, and unaccepted suggestions are not stored long-term.
_Avoid_: Task, completion

**Weekly Lesson**:
A user-approved planning insight from recent daily reviews that helps future schedule suggestions avoid repeating unrealistic patterns.
_Avoid_: Note, memory

**Lesson Suggestion**:
A possible planning insight proposed in the weekly review before the user confirms it as a weekly lesson.
_Avoid_: Weekly lesson, note

**Pinned Lesson**:
A lesson the user has marked as still relevant beyond the normal recent planning window.
_Avoid_: Old note, permanent memory

**Schedule Suggestion**:
A proposed plan for tomorrow, normally generated after a daily review, that places scheduled tasks around events using active goals, recent progress, incomplete work, and relevant lessons; multiple suggestions may exist before one is accepted.
_Avoid_: Calendar, agenda

**Regeneration Reason**:
The user's required free-text explanation for why they requested another schedule suggestion instead of accepting the current one.
_Avoid_: Preset reason, incomplete reason

**Daily Plan**:
The single accepted schedule for a specific day, made of non-overlapping scheduled tasks and events the app should use for reminders and later review.
_Avoid_: Schedule suggestion, calendar

**Calendar Screen**:
The planning surface where the user views events, scheduled tasks, reminders, and daily plans, opening to the current day by default.
_Avoid_: Today screen, dashboard

**Planning Prompt**:
A visible in-app prompt that appears when tomorrow does not yet have a daily plan, without using task reminder notifications.
_Avoid_: Reminder, schedule suggestion

**Schedule Pattern**:
A repeatable planning rhythm attached to an active goal, expressed as preferred days or frequency, that helps the user schedule concrete tasks across multiple days while still bending around events and higher-priority tasks.
_Avoid_: Recurring event, habit

**Deferred Task**:
A task left out of a daily plan because higher-priority work or event constraints used the available time.
_Avoid_: Failed task, deleted task
