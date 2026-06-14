# PRD: AI-assisted goals tracker v1

## Problem Statement

The user needs a personal goals tracker that turns specific goals into repeatable, realistic daily schedules. Existing calendar tools can hold events, but they do not learn from daily review, missed tasks, task sizing, reminders, or goal progress. The product should help the user avoid vague goals, avoid dragging tasks out indefinitely, and build a repeatable schedule around real commitments.

The app must be AI-first: users connect their own AI Provider through a provider-neutral interface. Without an AI Provider, the app still works in Manual Mode as a fallback planner, but the intended experience is AI-assisted goal clarification, task breakdown, schedule suggestion, evidence import, and review learning.

## Solution

Build an AI-assisted personal Goals Tracker that helps the user create specific Active Goals, break them into concrete Tasks, plan tomorrow around one-time Events, and review each day so future Schedule Suggestions become more realistic.

The app starts with Onboarding that guides the user to connect an AI Provider, test the connection, enable notifications, set the global Reminder Offset, add Events, configure Focus Windows, and enter a first Goal Prompt. Goal Suggestions include a Progress Format, initial Task Breakdown, Schedule Pattern, and useful Task Deadline suggestions. Accepting a Goal Suggestion creates the Active Goal package.

The Calendar Screen opens to today and shows Events, Scheduled Tasks, Reminders, the Daily Plan, and Planning Prompts. Schedule Suggestions are generated for tomorrow, normally after the Daily Review. Multiple Schedule Suggestions may exist before one is accepted, but each day has one Daily Plan. Regeneration requires a free-text Regeneration Reason.

Daily Review runs in order: Evidence Import, completion confirmation, Incomplete Reasons, Task Split or Unblock Task handling, then tomorrow's Schedule Suggestion. Weekly Review appears on the user's chosen review day, stays visible as overdue until completed, and summarizes progress, missed reviews, deferred work, unscheduled completed work, capacity patterns, and Lesson Suggestions.

## User Stories

1. As a user, I want to enter a rough Goal Prompt, so that AI can help me turn a vague idea into specific Goal Suggestions.
2. As a user, I want Goal Suggestions to include Progress Format, initial Task Breakdown, Schedule Pattern, and useful Task Deadline suggestions, so that I can judge whether the goal is trackable before accepting it.
3. As a user, I want accepting a Goal Suggestion to create the Active Goal and its planning package automatically, so that I do not re-enter AI output manually.
4. As a user, I want Goals to be Active, Completed, or Archived, so that only relevant goals affect future planning.
5. As a user, I want Goal completion to require fulfilled progress criteria and my confirmation, so that the app does not mark goals complete prematurely.
6. As a user, I want Tasks to belong to one Goal, so that Goal Progress stays clear.
7. As a user, I want Tasks to have High, Medium, or Low Task Priority assigned by me, so that the scheduler respects what matters most.
8. As a user, I want Tasks to have optional Task Deadlines, so that important work does not drag out indefinitely.
9. As a user, I want AI to suggest deadlines from specified goals, so that deadlines are realistic instead of stressful guesses.
10. As a user, I want Tasks to have Light or Focus Task Effort suggested by AI and editable by me, so that the planner can place work in appropriate blocks.
11. As a user, I want Schedule Patterns expressed as preferred days or frequency, so that the app creates a repeatable rhythm without treating them as hard Events.
12. As a user, I want Scheduled Tasks to be concrete and sized to fit their time block, so that Daily Review can evaluate real work.
13. As a user, I want Events to be one-time fixed commitments independent from goals, so that the planner treats them as hard constraints.
14. As a user, I want Events not to affect Goal Progress, so that progress reflects goal work rather than calendar occupancy.
15. As a user, I want the Calendar Screen to open to today, so that I can quickly see the current Daily Plan.
16. As a user, I want tomorrow's Schedule Suggestion to work around Events, so that fixed commitments are respected.
17. As a user, I want only one Daily Plan per day, so that reminders and review have one source of truth.
18. As a user, I want multiple Schedule Suggestions before acceptance, so that I can ask AI for a better plan.
19. As a user, I want to provide a required free-text Regeneration Reason when asking for another Schedule Suggestion, so that AI knows what to change.
20. As a user, I want no preset regeneration reasons, so that I can explain the actual problem in my own words.
21. As a user, I want edited Schedule Suggestions to become the Daily Plan when accepted, so that my approved version is authoritative.
22. As a user, I want Scheduled Tasks to never overlap each other, so that the Daily Plan is realistic.
23. As a user, I want Event and Scheduled Task conflicts to show warnings with specific fixes, so that I can move, shorten, split, or defer the affected task.
24. As a user, I want Event Conflict Feedback to be labeled separately, so that the AI does not mistake late calendar changes for bad planning.
25. As a user, I want Event Conflict Feedback not to become Lesson Suggestions, so that unusual Events do not distort future planning.
26. As a user, I want Reminders for both Events and Scheduled Tasks, so that I notice commitments and planned work.
27. As a user, I want Reminders to use device or browser notifications when available, so that the app can reach me outside the open tab.
28. As a user, I want the app to strongly recommend notifications and warn when they are disabled, so that I understand reminders are less useful without them.
29. As a user, I want task reminders to show only task title and priority, so that notifications stay concise.
30. As a user, I want event reminders to show event title and time, so that commitments are clear.
31. As a user, I want Reminders before and at the scheduled time, so that I can transition into the block.
32. As a user, I want a global Reminder Offset for Events and Scheduled Tasks, so that I control how early reminders appear.
33. As a user, I want one short snooze, so that I can delay a reminder without hiding work indefinitely.
34. As a user, I want reminders to update automatically when the Daily Plan changes, so that stale reminders do not fire.
35. As a user, I want missed task reminders explained during Daily Review instead of immediately, so that reminders do not become nagging prompts.
36. As a user, I want Daily Review to run every day, so that the app learns from what actually happened.
37. As a user, I want Daily Review to ask completion status for planned tasks, so that task history is trustworthy.
38. As a user, I want incomplete Scheduled Tasks to require an Incomplete Reason, so that future schedules can improve.
39. As a user, I want Incomplete Reasons to include Too Large, Interrupted, Not Enough Energy, Blocked, and Not Important Anymore, so that the app understands different failure modes.
40. As a user, I want optional free-text notes on Incomplete Reasons, so that I can add nuance when useful.
41. As a user, I want Evidence Import not to suggest Incomplete Reasons, so that reasons remain my interpretation.
42. As a user, I want Too Large tasks to trigger proposed Task Splits, so that future tasks fit schedule blocks.
43. As a user, I want Task Splits to require my confirmation, so that new tasks do not appear without approval.
44. As a user, I want Blocked tasks to stay out of Schedule Suggestions until unblocked, so that the planner does not schedule impossible work.
45. As a user, I want completing an Unblock Task to unblock the original task, so that it can return to future planning.
46. As a user, I want Interrupted tasks to remain candidates for future planning when priority and deadlines justify it, so that day changes do not erase important work.
47. As a user, I want Not Important Anymore tasks to become Skipped, so that they leave future planning but remain in history.
48. As a user, I want Daily Capacity captured every Daily Review as Low, Normal, or High, so that the week can describe how much energy/focus I actually had.
49. As a user, I want Daily Capacity to be descriptive and not directly predict tomorrow, so that the app does not assume tomorrow will match today.
50. As a user, I want no general day note in v1, so that Daily Review stays fast and focused.
51. As a user, I want Evidence Import to be optional and user-enabled, so that outside activity information is only used with my consent.
52. As a user, I want Evidence Import to use the active AI Provider when supported, so that conversations can be extracted without manual copy/paste.
53. As a user, I want unsupported Evidence Import to appear disabled with explanation, so that I understand provider limitations.
54. As a user, I want Evidence Import to run visibly before completion confirmation, so that I know conversations are being considered.
55. As a user, I want to skip Evidence Import for a specific Daily Review, so that I keep day-by-day privacy control.
56. As a user, I want raw Conversation Evidence discarded after review, so that sensitive conversations are not stored long-term.
57. As a user, I want only accepted outcomes from Evidence Import stored, so that rejected guesses disappear.
58. As a user, I want Evidence Import to suggest likely completed Scheduled Tasks, so that Daily Review is faster.
59. As a user, I want to accept all AI-suggested completed tasks after seeing them, so that obvious evidence does not require repetitive clicks.
60. As a user, I want Evidence Import to surface Unplanned Completion Suggestions, so that important unplanned work can be attached to a Goal.
61. As a user, I want Unplanned Completion Suggestions to have AI-normalized titles that are not edited during acceptance, so that accepted task history remains meaningful.
62. As a user, I want wrong Unplanned Completion Suggestions to be rejected, so that bad evidence does not enter history.
63. As a user, I want accepted Unplanned Completions to become completed tasks only after attaching them to a Goal and reconciling them with the Daily Plan, so that progress stays structured.
64. As a user, I want Unscheduled Completed Tasks to be rare, so that most progress comes through the repeatable schedule.
65. As a user, I want manually added Unscheduled Completed Tasks during Daily Review, so that important unplanned goal work outside Evidence Import can still count.
66. As a user, I want Unscheduled Completed Tasks to count toward Goal Progress when attached to that Goal, so that real completed work is recognized.
67. As a user, I want too many Unscheduled Completed Tasks in a week to trigger a gentle Weekly Review warning, so that I notice when work is drifting outside the plan.
68. As a user, I want Weekly Review on my chosen review day, so that reflection fits my life.
69. As a user, I want Weekly Review shown prominently on that day and kept overdue until completed, so that the learning loop does not disappear.
70. As a user, I want Weekly Review to summarize missed Daily Reviews, so that planning accuracy has context.
71. As a user, I want Weekly Review to show completed tasks, deferred tasks, capacity patterns, unscheduled completed work, and Lesson Suggestions, so that I see how the week actually went.
72. As a user, I want capacity patterns to be descriptive only, so that they do not become lessons by themselves.
73. As a user, I want Lesson Suggestions only in Weekly Review, so that daily use stays light.
74. As a user, I want Weekly Lessons to require my approval, so that AI does not silently learn false rules about me.
75. As a user, I want Pinned Lessons to stay relevant beyond the normal recent planning window, so that durable planning insights can keep helping.
76. As a user, I want AI Provider connection to be required for the main AI-assisted experience, so that the app's core value is available from the start.
77. As a user, I want Manual Mode as an escape hatch, so that the app remains usable if no provider is connected.
78. As a user, I want Onboarding to explain why each question helps planning, so that setup feels useful rather than arbitrary.
79. As a user, I want the Provider Connection Test to verify structured text generation, so that failed providers are caught before planning.
80. As a user, I want only one AI Provider active at a time, so that AI behavior is predictable.
81. As a user, I want Provider Capabilities surfaced when unsupported, so that disabled AI features are understandable.
82. As a user, I want Provider Credentials treated separately from planning data and never shown back after saving, so that secrets stay protected.
83. As a user, I want Provider Disconnect to switch to Manual Mode without deleting history, so that I control provider access without losing data.
84. As a user, I want AI Suggestion History to store structured suggestion data only, so that raw prompts and sensitive context are not retained.
85. As a user, I want AI Suggestion History hidden from normal UI, so that the everyday app remains clean.
86. As a user, I want AI Suggestion History deletable only after a warning, so that I understand losing it may reduce explanation and future planning quality.
87. As a user, I want old AI suggestions preserved as history when switching providers, so that past planning is not rewritten.
88. As a user, I want v1 to avoid streaks, scores, habits, recurring Events, subtasks, multi-user sharing, and multi-day AI scheduling, so that the product stays focused on repeatable daily planning.

## Implementation Decisions

- Build the product as an AI-first personal tracker with Manual Mode only as a fallback.
- Use the glossary terms from `CONTEXT.md` as product language: Goal, Task, Event, Daily Plan, Schedule Suggestion, Daily Review, Weekly Review, Evidence Import, AI Provider, and related terms.
- Support one active AI Provider at a time behind a provider-neutral interface.
- Require v1 AI Providers to support structured text generation.
- Model provider-specific features as Provider Capabilities. Evidence Import is available only when the active provider supports conversation evidence import.
- Require a Provider Connection Test before treating a provider as connected.
- Treat Provider Credentials as sensitive data separate from planning data. Never show credentials back after saving.
- Store only structured AI Suggestion History, not raw prompts or raw conversation evidence.
- Preserve AI Suggestion History across provider switches, including provider attribution.
- Hide AI Suggestion History from normal UI and show it only in details/debug contexts.
- Allow AI Suggestion History deletion only after warning about reduced explanation and future planning quality.
- Implement Onboarding as AI-provider-first, with Manual Mode as an escape hatch.
- Onboarding should explain why each setup question helps planning.
- Onboarding should guide provider connection, provider test, notifications, Reminder Offset, Events, Focus Windows, and first Goal Prompt.
- Goal Suggestions should include Progress Format, initial Task Breakdown, Schedule Pattern, and useful Task Deadline suggestions.
- Accepting a Goal Suggestion creates the Active Goal and the accepted planning package.
- Goal Status values are Active, Completed, and Archived. Only Active Goals affect future planning.
- Goal completion requires fulfilled required tasks or progress criteria plus user confirmation.
- Each Task belongs to exactly one Goal.
- Task Priority is user-assigned with High, Medium, and Low.
- Task Effort uses Light and Focus, suggested by AI and editable by the user.
- Task Status values are Planned, Completed, Deferred, Skipped, and Blocked.
- Skipped tasks stay in history but leave future planning.
- Blocked tasks stay out of Schedule Suggestions until unblocked.
- Task Split is proposed by AI and requires user confirmation before new tasks become real.
- Events are one-time fixed commitments, independent from goals, and do not affect Goal Progress.
- Schedule Patterns are preferred days or frequency attached to Active Goals, not fixed calendar commitments.
- Schedule Suggestions are for tomorrow only. Manual planning farther ahead is allowed for Events only.
- Multiple Schedule Suggestions may exist before acceptance, but each day has one Daily Plan.
- Regeneration requires a free-text Regeneration Reason, not presets.
- Rejected Schedule Suggestions and Regeneration Reasons are stored as structured AI Suggestion History.
- The accepted Daily Plan contains non-overlapping Scheduled Tasks.
- Manual edits that create Scheduled Task overlaps are prevented.
- Event/Scheduled Task overlaps after edits are allowed with a warning and suggested fixes.
- Event Conflict Feedback is recorded separately and does not become a Lesson Suggestion.
- Reminders apply to both Events and Scheduled Tasks.
- Reminders use the global Reminder Offset for early reminders and also fire at the scheduled time.
- Reminders should use device/browser notifications when available and warn clearly when notifications are disabled.
- Reminders allow one short snooze.
- Reminders update automatically when the Daily Plan changes.
- Daily Review Flow order is Evidence Import, completion confirmation, Incomplete Reasons, Task Split or Unblock Task handling, then tomorrow Schedule Suggestion.
- Daily Capacity is required every Daily Review as one tap: Low, Normal, or High.
- Daily Capacity is descriptive, not a direct predictor for tomorrow, and does not become Lesson Suggestions by itself.
- Daily Review has no general day note in v1.
- Incomplete Reasons are required for incomplete Scheduled Tasks and may include optional notes.
- Evidence Import must not suggest Incomplete Reasons.
- Evidence Import can be globally enabled and skipped for a specific Daily Review.
- Evidence Import visibly runs before completion confirmation when enabled and supported.
- Raw Conversation Evidence is not stored after review.
- Unaccepted Unplanned Completion Suggestions and rejected evidence completions are not stored long-term.
- Accepted Unplanned Completions become completed tasks only after user acceptance, Goal attachment, and Daily Plan reconciliation.
- Unscheduled Completed Tasks are rare, can be accepted from evidence or manually added during Daily Review, must attach to a Goal, count toward Goal Progress, appear in Weekly Review, and do not drive Schedule Pattern learning.
- More than 3 Unscheduled Completed Tasks in a week triggers a gentle Weekly Review warning.
- Weekly Review appears on the user's chosen day, remains visible as overdue until completed, and contains Lesson Suggestions.
- Lesson Suggestions appear only in Weekly Review and require user approval to become Weekly Lessons.
- Pinned Lessons remain relevant beyond the recent planning window.

## Testing Decisions

- Prefer behavior tests over implementation-detail tests. Tests should assert observable domain outcomes, not private helper internals.
- Domain behavior tests should cover Goal Suggestion acceptance into Active Goals, Goal Status transitions, Task Status transitions, Daily Review Flow, Weekly Review visibility, and Schedule Suggestion acceptance/regeneration.
- AI provider contract tests should cover structured generation, Provider Capability detection, Provider Connection Test failures, and unsupported Evidence Import shown disabled with explanation.
- Scheduling tests should cover Events as hard independent constraints, non-overlapping Scheduled Tasks, Event/Scheduled Task conflict warnings, Schedule Suggestion regeneration requiring free-text Regeneration Reason, and single Daily Plan per day.
- Reminder tests should cover reminder creation on Daily Plan acceptance, global Reminder Offset usage, reminders for Events and Scheduled Tasks, one short snooze, notification-disabled warning, and reminder updates after Daily Plan edits.
- Privacy/security behavior tests should cover Provider Credentials never shown back, raw Conversation Evidence not stored, only accepted evidence outcomes stored, rejected evidence guesses discarded, and structured AI Suggestion History only.
- Review workflow tests should cover Evidence Import before completion confirmation, required Incomplete Reasons, Daily Capacity required every review, skipped Evidence Import not becoming Planning Feedback, Task Split confirmation, Unblock Task flow, and Schedule Suggestion generation after review.
- End-to-end workflow tests should cover onboarding, provider connection, goal creation, task breakdown, Daily Plan acceptance, reminders, Daily Review, tomorrow Schedule Suggestion, and Weekly Review.
- Because this repo currently contains documentation and agent setup but no app implementation, the first implementation issues should establish the app architecture and test seams before feature slices are built.

## Out of Scope

- Native mobile apps.
- Multi-user collaboration or sharing.
- Recurring Events.
- Separate habit tracking.
- Streaks, scores, or gamified productivity metrics.
- Nested subtasks.
- Tasks belonging to multiple Goals.
- AI-generated schedules more than one day ahead.
- Raw prompt storage by default.
- Raw conversation evidence retention after Daily Review.
- Automatic Goal completion without user confirmation.
- AI-inferred Goal archiving.
- AI-suggested Incomplete Reasons.
- Multiple active AI Providers at the same time.
- Provider-specific conversation integrations beyond capabilities exposed by the active AI Provider.
- Configurable unscheduled-completed-task warning threshold in v1.
- General journal/day notes in v1.

## Further Notes

Likely ADRs are needed for provider-neutral AI integration, Provider Credential storage, cloud persistence, and PWA notification behavior. The PRD intentionally describes the product behavior first; implementation issues should split this into vertical slices rather than building all AI features at once.
