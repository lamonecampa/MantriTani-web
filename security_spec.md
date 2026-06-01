# MantriTani Security Specification

## 1. Data Invariants
- Users can only read and write their own profile data.
- Diagnoses must be linked to the authenticated `userId` and are private to that user.
- Calculations must be linked to the authenticated `userId` and are private to that user.
- Diagnoses cannot be modified once set to `archived` (terminal state).

## 2. The "Dirty Dozen" Payloads

1. **Identity Theft (User Profile)**: Attempting to create a user profile with a different `userId` in the path than the auth token.
2. **PII Leak (User Profile)**: Attempting to read another user's profile without being an admin.
3. **Identity Spoofing (Diagnosis)**: Creating a diagnosis with a `userId` field that doesn't match `request.auth.uid`.
4. **Ghost Field Injection**: Adding an `isVerified: true` field to a diagnosis result to bypass future logic.
5. **Terminal State Bypass**: Attempting to update a diagnosis that has `status: "archived"`.
6. **Value Poisoning (Yield)**: Setting `expectedYield` to a 1MB string instead of a number.
7. **Orphaned Diagnosis**: Creating a diagnosis for a `userId` that exists in the payload but doesn't have a corresponding `users/{userId}` document.
8. **Resource Exhaustion (ID Poisoning)**: Creating a document with a 2KB junk string as the document ID.
9. **Query Scraping**: Attempting to `list` all diagnoses without filtering by `userId`.
10. **Timestamp Fraud**: Providing a `createdAt` date from 10 years ago instead of using `request.time`.
11. **Negative Profits**: Setting `laborCost` or `inputCost` to a negative number.
12. **Malicious Admin Escalation**: Attempting to create an `admins` document for oneself.

## 3. Test Runner
Refer to `firestore.rules.test.ts` for implementation details.
