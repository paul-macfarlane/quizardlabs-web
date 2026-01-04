# Quizardlabs MVP Implementation Plan

## Architecture Overview

**Separation of Concerns**:

- `lib/services/` - Business logic (testable, framework-agnostic)
- `lib/actions/` - Next.js Server Actions (thin wrappers)
- `lib/components/ui/` - Shad CN components
- `app/` - Next.js pages with Suspense boundaries

## Feature 1: Foundation & Setup

**Goal**: Set up tooling and create task tracking system.

### Tasks:

1. Install dependencies (Shad CN with Slate theme, Vitest, react-media-recorder, etc.)
2. Configure Vitest for testing (`vitest.config.ts`)
3. Create `backlog.md` for task tracking
4. Install base Shad CN components: `button card input label textarea select badge dialog dropdown-menu separator tabs toast form`

**No code to test yet - just setup.**

---

## Feature 2: User Role Management

**Goal**: Users can select and update their role (test_maker or test_taker).

### Database:

- Add `user_roles` junction table: userId (FK), role (enum: test_maker, test_taker), createdAt
- Add unique constraint on (userId, role)
- This allows users to have multiple roles in the future without migration
- Run migration

### Service Layer:

- `lib/services/user-service.ts`:
  - `getUserRole(userId)` - Get user's role
  - `setUserRole(userId, role)` - Set user's role
- Write unit tests in `lib/services/__tests__/user-service.test.ts`

### Server Actions:

- `lib/actions/user-actions.ts`:
  - `getUserRoleAction()` - Get current user's role
  - `setUserRoleAction(role)` - Set current user's role

### UI Components:

- `lib/components/role-selector.tsx` - Radio group to select role

### Pages:

- Update `app/page.tsx` - Redirect to `/setup` if no role, else to `/maker` or `/taker`
- Create `app/setup/page.tsx` - Role selection page
- Add loading states with Suspense

**Test end-to-end**: Auth → select role → redirected to dashboard.

---

## Feature 3: Test Creation & Listing

**Goal**: Teachers can create tests and see a list of their tests.

### Database:

- Add `test` table: id, name, description, createdBy, createdAt, updatedAt
- Add relations between `user` and `test`
- Run migration

### Service Layer:

- `lib/services/test-service.ts`:
  - `createTest({ name, description }, userId)` - Create new test
  - `getTestsByCreator(userId)` - List user's tests
  - `getTest(id)` - Get single test
  - `updateTest(id, { name, description })` - Update test
  - `deleteTest(id)` - Delete test
- Write unit tests

### Server Actions:

- `lib/actions/test-actions.ts`:
  - `createTestAction(data)` - Create test
  - `getMyTestsAction()` - List current user's tests
  - `getTestAction(id)` - Get single test
  - `updateTestAction(id, data)` - Update test
  - `deleteTestAction(id)` - Delete test

### UI Components:

- `lib/components/test-form.tsx` - Form for name/description
- `lib/components/test-card.tsx` - Display test in list

### Pages:

- Create `app/maker/page.tsx` - Dashboard with test list and "Create Test" button
- Create `app/maker/test/[id]/page.tsx` - Test editor page (basic layout, no questions yet)
- Add Suspense boundaries for test list loading

**Test end-to-end**: Create test → see in list → edit → delete.

---

## Feature 4: Question Management (Text Only)

**Goal**: Teachers can add/edit/delete questions with text and type selection (no media yet).

### Database:

- Add `question` table: id, testId, orderIndex, text, type, imagePath, audioPath, createdAt
- Add `choice` table: id, questionId, orderIndex, text, audioPath, isCorrect
- Add relations
- Run migration

### Service Layer:

- `lib/services/question-service.ts`:
  - `getQuestionsForTest(testId)` - Get all questions
  - `addQuestion(testId, data)` - Add question
  - `updateQuestion(id, data)` - Update question
  - `deleteQuestion(id)` - Delete question
  - `reorderQuestions(testId, orderMap)` - Reorder
- `lib/services/choice-service.ts`:
  - `addChoice(questionId, data)` - Add choice
  - `updateChoice(id, data)` - Update choice
  - `deleteChoice(id)` - Delete choice
- Write unit tests

### Server Actions:

- `lib/actions/question-actions.ts` - CRUD actions for questions and choices

### UI Components:

- `lib/components/question-editor.tsx` - Edit single question (text, type, choices)
- `lib/components/choice-editor.tsx` - Add/edit answer choices
- `lib/components/question-list.tsx` - List of questions with edit/delete

### Pages:

- Update `app/maker/test/[id]/page.tsx` - Add question management UI with Suspense

**Test end-to-end**: Add questions → add choices → reorder → delete.

---

## Feature 5: Media Upload (Images & Audio)

**Goal**: Teachers can upload images and record/upload audio for questions and choices.

### Implementation Details

Questions on tests can have image as well as audio. Choices can also have audio.

**Permissions**

- Test makers need permissions to upload media AND associate it with tests they can manage.
- Test makers need permissions to read media IF it is for a test they have access to.

If the entire bucket is made private the application can control access by signing urls for clients. The authorization question is not “can the user access this asset?” but rather “can they access the question/choice it is for?”.

Assets URLs are stored at the question and/or choice levels, so there will need to be a retrieval of the test and checking the permissions of the user related to the test.

Upload URL formats

- Question Image:`/tests/{test_id}/questions/{question_id}/images/{uuid}`
- Question Audio: `/tests/{test_id}/questions/{question_id}/audio/{uuid}
- Choice Audio: `/tests/{test_id}/questions/{question_id}/choices/{choice_id}/audio/{uuid}`

When updating an existing asset, the old asset should be removed.

### Service Layer:

- `lib/services/media-service.ts`:
  - `generateMediaUploadUrl(type, userId)` - Generate presigned upload URL
  - `generateMediaDownloadUrl(path)` - Generate presigned download URL
  - `deleteMedia(path)` - Delete from R2
- Write unit tests (mock R2 client)

### Server Actions:

- `lib/actions/media-actions.ts`:
  - `getUploadUrlAction(type)` - Get upload URL
  - `getDownloadUrlAction(path)` - Get download URL

### UI Components:

- `lib/components/image-uploader.tsx` - Upload images to R2
- `lib/components/audio-recorder.tsx` - Record audio using react-media-recorder
- `lib/components/audio-player.tsx` - Play audio with controls

### Pages:

- Update `lib/components/question-editor.tsx` - Add image and audio upload/recording

**Test end-to-end**: Upload image → record audio → see in question editor.

---

## Feature 6: Test Taking & Submission

**Goal**: Students can view tests, play audio, answer questions, and submit.

### Database:

- Add `submission` table: id, testId, userId, submittedAt, createdAt
- Add `answer` table: id, submissionId, questionId, selectedChoiceIds, textValue
- Add relations
- Run migration

### Service Layer:

- `lib/services/submission-service.ts`:
  - `getTestForTaking(testId)` - Get test with all data for taking
  - `createSubmission(testId, userId)` - Create submission
  - `saveAnswer(submissionId, questionId, value)` - Save answer
  - `submitTest(submissionId)` - Finalize submission
  - `getSubmissionsByUser(userId)` - Get user's submissions
- Write unit tests

### Server Actions:

- `lib/actions/submission-actions.ts`:
  - `getTestForTakingAction(testId)` - Get test data
  - `createSubmissionAction(testId)` - Start submission
  - `saveAnswerAction(submissionId, questionId, value)` - Save answer
  - `submitTestAction(submissionId)` - Submit test
  - `getMySubmissionsAction()` - Get submissions

### UI Components:

- `lib/components/test-viewer.tsx` - Display test questions
- `lib/components/question-response.tsx` - Answer input (MC/MA/Free text with audio playback)

### Pages:

- Create `app/taker/page.tsx` - Student dashboard (enter test link, recent submissions)
- Create `app/test/[id]/page.tsx` - Test taking page with Suspense
- Add loading and error boundaries

**Test end-to-end**: Open test → play audio → answer questions → submit.

---

## Feature 7: Polish & Production Readiness

**Goal**: Add loading states, error handling, accessibility, and polish.

### Tasks:

1. Add `loading.tsx` files for all pages
2. Add `error.tsx` boundaries for graceful error handling
3. Add toast notifications (success/error feedback)
4. Accessibility improvements:
   - ARIA labels for audio players
   - Keyboard navigation
   - Screen reader support

5. Add proper TypeScript types for all actions
6. Update `backlog.md` with future features
7. Add basic E2E testing documentation

**Test end-to-end**: Full user journey from auth to test creation to test taking.

## Key Files Structure

```
lib/
  services/
    test-service.ts
    question-service.ts
    choice-service.ts
    submission-service.ts
    media-service.ts
    __tests__/
      test-service.test.ts
      question-service.test.ts
      ...
  actions/
    test-actions.ts
    question-actions.ts
    submission-actions.ts
    media-actions.ts
  components/
    ui/ (Shad CN components)
    role-selector.tsx
    audio-recorder.tsx
    audio-player.tsx
    question-editor.tsx
    ...
app/
  setup/page.tsx
  maker/
    page.tsx
    test/[id]/page.tsx
  taker/page.tsx
  test/[id]/page.tsx
backlog.md
vitest.config.ts
```

## Testing Strategy

- **Unit tests**: All service layer functions
- **Integration tests**: Server Actions with mocked DB
- **E2E**: Manual testing for MVP
- **CI**: Future enhancement

## Future Considerations (Post-MVP)

Track in backlog.md:

- Scoring and results
- Test groups and assignments
- Import from DOCX/PDF
- AI TTS fallback
- Enhanced security
- Analytics
