# Live presentation components

## Plan

Build embeddable React components for real-time audience interaction during live presentations. Components use REST + polling (no Supabase client needed in user projects).

### Deliverables

- [x] 1. Database migration: qa_questions, word_cloud_entries tables
- [x] 2. API route: POST/GET reactions
- [x] 3. API route: GET poll results (aggregated)
- [x] 4. API route: POST/GET/PATCH qa_questions
- [x] 5. API route: POST/GET word_cloud_entries
- [x] 6. API route: GET/POST audience count
- [x] 7. Shared types and hooks for live components
- [x] 8. LivePoll component
- [x] 9. LiveReactions component
- [x] 10. LiveQA component
- [x] 11. LiveAudienceCount component
- [x] 12. LiveWordCloud component
- [x] 13. Export from runtime index (both packages)
- [x] 14. Tests for API routes (5 test files)
- [x] 15. Tests for components (16 tests)
- [x] 16. Verify build passes

## Results

- 245 tests passing (up from 131)
- All typechecks pass (runtime, slide-nerds, web)
- Both runtime packages build cleanly
- Web app build failure is pre-existing (Stripe portal route, unrelated)
- No new lint errors introduced
