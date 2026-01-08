---
id: task-5
title: "Feature 6: Test Taking & Submission"
status: Done
assignee: []
created_date: "2025-12-09"
labels: []
dependencies: []
priority: high
---

## Description

Students take tests and submit answers: submission & answer tables, services, test viewer UI, taker dashboard

## Implementation Summary

### Database

- Added `submission` table: id, testId, userId, startedAt, submittedAt, createdAt
- Added `answer` table: id, submissionId, questionId, choiceId, textResponse, createdAt
- Junction table pattern for multi-answer storage

### Service Layer (`lib/services/submission.ts`)

- `createSubmission`, `getSubmission`, `getActiveSubmission`
- `getOrCreateSubmission` - resume logic for in-progress submissions
- `saveAnswer` - upsert with transaction
- `submitSubmission`, `canUserAccessSubmission`, `isSubmissionInProgress`

### Server Actions (`lib/actions/submission.ts`)

- `startSubmissionAction`, `saveAnswerAction`, `submitSubmissionAction`
- `getMySubmissionsAction`, `getSubmissionAction`

### UI Components

- `test-viewer.tsx` - Main test-taking with debounced auto-save (500ms)
- `question-response.tsx` - MC/MA/Free text inputs
- `submission-card.tsx` - Submission history display
- `share-test-dialog.tsx` - Share test links

### Pages

- `app/taker/page.tsx` - Student dashboard with test link form
- `app/test/[id]/page.tsx` - Test taking page
- `app/submission/[id]/page.tsx` - Read-only view of completed submissions

### Features

- Auto-save answers with debounce
- Unlimited retakes (new submission each time)
- Shareable test links
- Read-only view for completed submissions with Retake button
- Hard navigation after submit to avoid caching issues
