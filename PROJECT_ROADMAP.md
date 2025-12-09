# Quizardlabs MVP - Project Roadmap

> **Note**: This project uses [backlog.md](https://github.com/MrLesk/Backlog.md) for task management.
>
> **View Tasks**: `backlog task list` or `backlog board` or `backlog browser`
>
> **Create Tasks**: `backlog task create "Task name" -d "Description" -s "To Do"`

## MVP Status

Currently implementing the MVP focused on two core workflows:

1. **Test Making** - Teachers create tests with audio dictation
2. **Test Taking** - Students consume tests with audio playback

## Tasks Tracked in backlog.md

All feature tasks are tracked in the `backlog/tasks/` directory using the backlog.md CLI tool.

View current progress:

```bash
cd /Users/paulmacfarlane/code/quizardlabs-web
backlog board        # Interactive Kanban board
backlog browser      # Web UI on http://localhost:6420
backlog task list    # List all tasks
```

## Feature Overview

### ✅ Feature 1: Foundation & Setup (task-7) - DONE

### 🔲 Feature 2: User Role Management (task-1) - TO DO

### 🔲 Feature 3: Test Creation & Listing (task-2) - TO DO

### 🔲 Feature 4: Question Management (task-3) - TO DO

### 🔲 Feature 5: Media Upload (task-4) - TO DO

### 🔲 Feature 6: Test Taking & Submission (task-5) - TO DO

### 🔲 Feature 7: Polish & Production Readiness (task-6) - TO DO

---

## View Current Status

```bash
# Terminal Kanban board
backlog board

# Web interface
backlog browser

# Task list
backlog task list
```

## Known Limitations (MVP)

- **Hard Deletes**: Tests/questions are hard-deleted. If a teacher deletes a test after submissions exist, those submissions will reference missing data. Plan to migrate to soft deletes post-MVP.
- **Test Versioning**: When a teacher edits a test after submissions exist, submissions reference the current version, not the version taken. We mitigate this by storing denormalized question/choice text in answers, but a proper versioning system is needed for production.
- **No Teacher Verification**: Role selection is based on trust. Anyone can select "teacher" role. Need email domain allowlist or manual approval for production.

## Future Features (Post-MVP)

### Short-Term Extensions

- [ ] Automatic scoring of MC/MA questions
- [ ] Student results page
- [ ] Teacher grading UI for free text responses
- [ ] Secure test delivery (signed URLs, anti-copy measures)
- [ ] Basic organization and test group management
- [ ] Test sharing/collaboration between teachers
- [ ] Soft delete implementation for data integrity
- [ ] Test versioning/snapshots

### Mid-Term Extensions

- [ ] Import tests from DOCX/PDF
- [ ] LLM-assisted test parsing
- [ ] Audio enhancements with AI TTS fallback
- [ ] Student accommodation profiles
- [ ] Test analytics and reporting
- [ ] Teacher verification system (email domains or manual approval)
- [ ] Test assignment system (assign specific tests to specific students)
- [ ] Progress saving for students (in_progress submissions)

### Long-Term Extensions

- [ ] Full accommodations platform:
  - Speech-to-text
  - Predictive text
  - Word processing tools
  - Grammar/spell check
- [ ] Large-scale district support
- [ ] SIS/LMS integrations
- [ ] Enterprise-level workflow orchestration (Temporal)
- [ ] Question banks and question reuse
- [ ] Test randomization and question shuffling
- [ ] Timer support for timed assessments

## Technical Debt

- [ ] Add database indexes for performance (test.createdBy, submission.userId, etc.)
- [ ] Add proper error handling and validation
- [ ] Add rate limiting for API endpoints
- [ ] Add proper logging and monitoring
- [ ] Set up CI/CD pipeline
- [ ] Add E2E testing framework
- [ ] Security audit and hardening
- [ ] Performance testing and optimization

## Media Path Structure

Using consistent R2 key structure for easy management:

```
users/{userId}/tests/{testId}/questions/{questionId}/audio-{timestamp}.mp3
users/{userId}/tests/{testId}/questions/{questionId}/image-{timestamp}.jpg
users/{userId}/tests/{testId}/questions/{questionId}/choices/{choiceId}/audio-{timestamp}.mp3
```

## Database Schema Decisions

- **user_roles junction table**: Allows users to have multiple roles in future without migration
- **Hard deletes**: Using ON DELETE CASCADE for MVP, will migrate to soft deletes later
- **Denormalized submission data**: Storing full question/choice text in answers to preserve what student saw
