# Workflow & Workflow Step Guide for Frontend

This guide explains how the document workflow and approval system works in Dockflow. Use this as a reference for implementing frontend features.

## Table of Contents
- [Overview](#overview)
- [Workflow Types](#workflow-types)
- [Workflow Status](#workflow-status)
- [Workflow Step Status](#workflow-step-status)
- [API Endpoints](#api-endpoints)
- [Complete Workflow Flow](#complete-workflow-flow)
- [Rollback Feature](#rollback-feature)
- [Error Handling](#error-handling)
- [Common Scenarios](#common-scenarios)

---

## Overview

The workflow system manages multi-step approval processes for documents. Each workflow consists of multiple steps that must be completed in sequence (CONSECUTIVE) or in parallel (PARALLEL).

### Key Concepts

- **Workflow**: Container for the entire approval process
  - Linked to a Document
  - Has a type (CONSECUTIVE or PARALLEL)
  - Tracks current step order
  - Has overall status

- **Workflow Step**: Individual approval step
  - Assigned to a specific user
  - Has its own status
  - Contains action type (APPROVE, REVIEW, SIGN, etc.)
  - Maintains order in the workflow

- **Workflow Step Action**: History log of actions taken on a step
  - Records who performed the action
  - Timestamps when action occurred
  - Stores metadata (rejection reasons, rollback info, etc.)

---

## Workflow Types

### CONSECUTIVE
Steps must be completed in sequential order. Users can only work on their step when it's the current step.

```
Step 1 (Order: 1) → Step 2 (Order: 2) → Step 3 (Order: 3) → Complete
```

**Rules:**
- Only the current step can be completed/rejected
- Completing a step automatically starts the next step
- Supports rollback feature (can go back to previous steps)
- `currentStepOrder` tracks which step is active

### PARALLEL
Multiple steps can be worked on simultaneously. Steps don't depend on each other.

```
Step 1 (Order: 1) ──┐
Step 2 (Order: 2) ──┼──→ All Complete → Workflow Complete
Step 3 (Order: 3) ──┘
```

**Rules:**
- Any step can be completed at any time
- Workflow completes when ALL steps are done
- Rollback feature is NOT supported
- All steps typically start at the same time

---

## Workflow Status

| Status | Description |
|--------|-------------|
| `ACTIVE` | Workflow is currently in progress |
| `COMPLETED` | All steps have been completed |
| `CANCELLED` | Workflow has been cancelled |
| `PAUSED` | Workflow is temporarily paused |

---

## Workflow Step Status

| Status | Description | User Action Available |
|--------|-------------|----------------------|
| `NOT_STARTED` | Step hasn't begun yet | None - Wait for turn |
| `IN_PROGRESS` | Step is currently active | Can Approve/Reject |
| `COMPLETED` | Step has been approved | None - Read only |
| `REJECTED` | Step has been rejected | None - See rejection reason |

---

## API Endpoints

All endpoints require authentication via Bearer token. Base path: `/api/v1`

### Workflow Endpoints

#### 1. Get Workflow by ID
```http
GET /workflow/:id
```

**Response:**
```json
{
  "id": "workflow-uuid",
  "documentId": "document-uuid",
  "currentStepOrder": 2,
  "type": "CONSECUTIVE",
  "status": "ACTIVE",
  "document": { /* document details */ },
  "workflowSteps": [
    {
      "id": "step-uuid-1",
      "order": 1,
      "status": "COMPLETED",
      "actionType": "REVIEW",
      "assignedToUserId": "user-uuid-1",
      "completedAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": "step-uuid-2",
      "order": 2,
      "status": "IN_PROGRESS",
      "actionType": "APPROVE",
      "assignedToUserId": "user-uuid-2",
      "startedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "createdAt": "2025-01-15T09:00:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

#### 2. Get Steps by Workflow
```http
GET /workflow-step/workflow/:workflowId
```

**Response:** Returns all steps for a workflow (filtered by user access)

---

### Workflow Step Endpoints

#### 3. Get User's Workflow Steps
```http
GET /workflow-step?pageNumber=1&pageSize=10&status=IN_PROGRESS
```

**Query Parameters:**
- `workflowId` (optional): Filter by workflow
- `assignedToUserId` (optional): Filter by assigned user
- `status` (optional): Filter by status
- `pageNumber`: Page number (default: 1)
- `pageSize`: Items per page (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": "step-uuid",
      "order": 2,
      "status": "IN_PROGRESS",
      "actionType": "APPROVE",
      "workflowId": "workflow-uuid",
      "assignedToUserId": "user-uuid",
      "startedAt": "2025-01-15T10:30:00Z",
      "dueDate": "2025-01-20T17:00:00Z",
      "workflow": {
        "id": "workflow-uuid",
        "type": "CONSECUTIVE",
        "document": { /* document details */ }
      },
      "actions": [
        {
          "id": "action-uuid",
          "actionType": "STARTED",
          "performedBy": {
            "id": "user-uuid",
            "fullname": "John Doe",
            "username": "john.doe"
          },
          "createdAt": "2025-01-15T10:30:00Z"
        }
      ]
    }
  ],
  "pageCount": 5,
  "pageNumber": 1,
  "pageSize": 10,
  "count": 45
}
```

#### 4. Get Single Workflow Step
```http
GET /workflow-step/:id
```

**Response:** Same structure as items in the list above, with full details

---

#### 5. Complete/Approve a Step
```http
PATCH /workflow-step/:id/complete
```

**Request Body:**
```json
{
  "comment": "Approved - all requirements met"
}
```

**Success Response (200):**
```json
{
  "id": "step-uuid",
  "status": "COMPLETED",
  "completedAt": "2025-01-15T11:00:00Z",
  /* ... other step details ... */
}
```

**Error Responses:**
- `400`: Step already completed or not current step
- `404`: Workflow step not found

**What Happens:**
1. Current step is marked as `COMPLETED`
2. An `APPROVED` action is logged
3. Next step (if exists) is set to `IN_PROGRESS`
4. If no next step, workflow is marked as `COMPLETED`
5. Workflow's `currentStepOrder` is incremented

---

#### 6. Reject a Step
```http
PATCH /workflow-step/:id/reject
```

**Request Body:**
```json
{
  "rejectionReason": "Document requires additional details in section 3",
  "comment": "Please review and add the missing financial data",
  "rollbackToUserId": "user-uuid-from-previous-step"
}
```

**Field Details:**
- `rejectionReason` (required): Why the step is being rejected
- `comment` (optional): Additional comments
- `rollbackToUserId` (optional): User ID from a previous step to rollback to
  - Only works for CONSECUTIVE workflows
  - Must be a user assigned to a PREVIOUS step
  - Causes workflow to reset to that user's step

**Success Response (200):**
```json
{
  "id": "step-uuid",
  "status": "REJECTED",
  "isRejected": true,
  "rejectionReason": "Document requires additional details in section 3",
  "rejectedAt": "2025-01-15T11:30:00Z",
  "completedAt": "2025-01-15T11:30:00Z"
}
```

**Error Responses:**
- `400`: Not a CONSECUTIVE workflow (when using rollback)
- `400`: Rollback user not found in previous steps
- `400`: Not current step (for CONSECUTIVE workflows)
- `404`: Workflow step or rollback user not found

**What Happens Without Rollback:**
1. Current step is marked as `REJECTED`
2. A `REJECTED` action is logged with the reason
3. Workflow stops at this step

**What Happens With Rollback:**
1. Current step is marked as `REJECTED`
2. System finds the step where `rollbackToUserId` was assigned
3. That step is reset to `IN_PROGRESS`
4. All steps between rollback step and current step are reset to `NOT_STARTED`
5. Workflow's `currentStepOrder` goes back to the rollback step's order
6. Rollback actions are logged for traceability

---

#### 7. Assign Step to User
```http
PATCH /workflow-step/:id/assign
```

**Request Body:**
```json
{
  "assignedToUserId": "user-uuid"
}
```

**Response:** Updated step with new assigned user

**What Happens:**
1. Step's assigned user is changed
2. Step status is set to `IN_PROGRESS`
3. A `REASSIGNED` action is logged

---

#### 8. Get Step Actions (History)
```http
GET /workflow-step/:id/actions?pageNumber=1&pageSize=10
```

**Response:**
```json
{
  "data": [
    {
      "id": "action-uuid",
      "workflowStepId": "step-uuid",
      "actionType": "REJECTED",
      "performedBy": {
        "id": "user-uuid",
        "fullname": "Jane Smith",
        "username": "jane.smith",
        "avatarUrl": "https://..."
      },
      "comment": "Needs more details",
      "metadata": {
        "rejectionReason": "Document incomplete",
        "rollbackToUserId": "user-uuid-2",
        "rollbackToStepId": "step-uuid-2"
      },
      "createdAt": "2025-01-15T11:30:00Z"
    }
  ],
  "pageCount": 1,
  "pageNumber": 1,
  "pageSize": 10,
  "count": 3
}
```

---

#### 9. Get All Workflow Actions
```http
GET /workflow/:workflowId/actions?pageNumber=1&pageSize=50
```

**Response:** Same as step actions, but includes all actions across all steps in the workflow

---

## Complete Workflow Flow

### Example: 3-Step Document Approval (CONSECUTIVE)

#### Initial State
```
Document Created → Workflow Created

Workflow:
  - type: CONSECUTIVE
  - currentStepOrder: 1
  - status: ACTIVE

Steps:
  Step 1 (Manager Review)   → IN_PROGRESS
  Step 2 (Director Approve) → NOT_STARTED
  Step 3 (CEO Sign)         → NOT_STARTED
```

#### Step 1: Manager Completes Review
**Frontend Action:**
```javascript
await fetch('/api/v1/workflow-step/step-1-id/complete', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    comment: 'Document looks good, approved for next review'
  })
})
```

**Result:**
```
Workflow:
  - currentStepOrder: 2 ← Advanced

Steps:
  Step 1 → COMPLETED ✓
  Step 2 → IN_PROGRESS ← Now active
  Step 3 → NOT_STARTED
```

#### Step 2: Director Rejects and Rolls Back to Manager
**Frontend Action:**
```javascript
await fetch('/api/v1/workflow-step/step-2-id/reject', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rejectionReason: 'Missing financial section',
    comment: 'Please add Q4 financial data',
    rollbackToUserId: 'manager-user-id' // Rolls back to Step 1
  })
})
```

**Result:**
```
Workflow:
  - currentStepOrder: 1 ← Rolled back

Steps:
  Step 1 → IN_PROGRESS ← Needs re-review
  Step 2 → REJECTED ✗
  Step 3 → NOT_STARTED
```

#### Step 1: Manager Re-completes
```
Workflow:
  - currentStepOrder: 2

Steps:
  Step 1 → COMPLETED ✓
  Step 2 → IN_PROGRESS ← Reset to active
  Step 3 → NOT_STARTED
```

#### Step 2 & 3: Complete Successfully
```
Final State:
  Workflow: COMPLETED ✓

  Steps:
    Step 1 → COMPLETED ✓
    Step 2 → COMPLETED ✓
    Step 3 → COMPLETED ✓
```

---

## Rollback Feature

### How It Works

The rollback feature allows reviewers to send documents back to previous steps for corrections.

**Key Rules:**
- ✅ Only works for `CONSECUTIVE` workflows
- ✅ Can only rollback to PREVIOUS steps (not forward)
- ✅ Specify user ID, not step ID (system finds their step)
- ✅ Resets all intermediate steps
- ✅ Preserves history in actions

### Use Cases

#### Use Case 1: Send Back to Previous Reviewer
```
Current State: Step 3 (CFO)
Rollback To: Step 1 (Accountant)

Reason: "Missing expense breakdown"
```

**Implementation:**
```javascript
// Get list of users from previous steps
const previousSteps = workflow.workflowSteps
  .filter(step => step.order < currentStep.order)
  .map(step => ({
    userId: step.assignedToUserId,
    userName: step.assignedUser.fullname,
    stepOrder: step.order
  }))

// Show dropdown to select user
<select>
  {previousSteps.map(step => (
    <option value={step.userId}>
      Step {step.stepOrder}: {step.userName}
    </option>
  ))}
</select>

// On reject with rollback
await rejectStep(currentStepId, {
  rejectionReason: reason,
  comment: comment,
  rollbackToUserId: selectedUserId
})
```

#### Use Case 2: Simple Rejection (No Rollback)
```javascript
// Just reject without rolling back
await rejectStep(currentStepId, {
  rejectionReason: 'Document not ready',
  comment: 'Please resubmit when complete'
  // No rollbackToUserId
})
```

### Frontend UI Recommendations

**Rejection Modal:**
```
┌─────────────────────────────────────┐
│ Reject Workflow Step                │
├─────────────────────────────────────┤
│ Reason: [Required]                  │
│ ┌─────────────────────────────────┐ │
│ │ Missing required information    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Comment: [Optional]                 │
│ ┌─────────────────────────────────┐ │
│ │ Please add sections 3.2 and 4   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ☐ Send back to previous reviewer   │
│                                     │
│ [When checked, shows:]              │
│ Select Reviewer:                    │
│ ┌─────────────────────────────────┐ │
│ │ Step 1: John Doe (Manager)    ▼ │ │
│ │ Step 2: Jane Smith (Director)   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel]  [Reject]                  │
└─────────────────────────────────────┘
```

---

## Error Handling

### Common Errors

#### 1. Step Already Completed
```json
{
  "statusCode": 400,
  "message": "This step has already been completed"
}
```
**Frontend Action:** Refresh workflow data, show error message

#### 2. Not Current Step (CONSECUTIVE)
```json
{
  "statusCode": 400,
  "message": "Cannot complete this step. Current workflow step is 2, but you are trying to complete step 3. Steps must be completed in order."
}
```
**Frontend Action:** Show "Please wait for previous steps" message

#### 3. Rollback on Parallel Workflow
```json
{
  "statusCode": 400,
  "message": "Rollback feature is only available for CONSECUTIVE workflows"
}
```
**Frontend Action:** Don't show rollback option for parallel workflows

#### 4. Invalid Rollback User
```json
{
  "statusCode": 404,
  "message": "No previous workflow step found for user John Doe in this workflow"
}
```
**Frontend Action:** Show error, verify user selection

#### 5. Unauthorized
```json
{
  "statusCode": 404,
  "message": "Workflow step not found"
}
```
**Note:** Returns 404 instead of 403 for security (users can only see their assigned steps)

---

## Common Scenarios

### Scenario 1: Display User's Pending Tasks
```javascript
// Fetch all IN_PROGRESS steps assigned to current user
const response = await fetch('/api/v1/workflow-step?status=IN_PROGRESS', {
  headers: { 'Authorization': `Bearer ${token}` }
})

const { data: pendingSteps } = await response.json()

// Display list
pendingSteps.forEach(step => {
  console.log(`Document: ${step.workflow.document.title}`)
  console.log(`Action Required: ${step.actionType}`)
  console.log(`Due: ${step.dueDate}`)
})
```

### Scenario 2: Show Workflow Progress
```javascript
// Get workflow with all steps
const workflow = await fetch(`/api/v1/workflow/${workflowId}`)
  .then(r => r.json())

// Calculate progress
const totalSteps = workflow.workflowSteps.length
const completedSteps = workflow.workflowSteps
  .filter(s => s.status === 'COMPLETED').length

const progress = (completedSteps / totalSteps) * 100

// Visual representation
// Step 1 ✓ → Step 2 (Current) → Step 3 ⏱
```

### Scenario 3: Show Step History
```javascript
// Get all actions for a step
const { data: actions } = await fetch(
  `/api/v1/workflow-step/${stepId}/actions`
).then(r => r.json())

// Timeline view
actions.forEach(action => {
  console.log(`${action.createdAt}: ${action.actionType}`)
  console.log(`By: ${action.performedBy.fullname}`)
  if (action.comment) console.log(`Note: ${action.comment}`)
})

// Example output:
// 2025-01-15 09:00: STARTED by John Doe
// 2025-01-15 11:30: REJECTED by Jane Smith
//   Note: Missing financial data
//   Rolled back to Step 1
// 2025-01-16 10:00: STARTED by John Doe (rollback)
// 2025-01-16 14:00: APPROVED by John Doe
```

### Scenario 4: Validate User Can Act on Step
```javascript
const canUserAct = (step, currentUserId, workflow) => {
  // Must be assigned to user
  if (step.assignedToUserId !== currentUserId) return false

  // Must be in progress
  if (step.status !== 'IN_PROGRESS') return false

  // For CONSECUTIVE workflows, must be current step
  if (workflow.type === 'CONSECUTIVE'
      && step.order !== workflow.currentStepOrder) {
    return false
  }

  return true
}
```

### Scenario 5: Get Available Rollback Users
```javascript
const getAvailableRollbackUsers = (currentStep, workflow) => {
  // Only for CONSECUTIVE workflows
  if (workflow.type !== 'CONSECUTIVE') return []

  // Get all previous steps with assigned users
  return workflow.workflowSteps
    .filter(step =>
      step.order < currentStep.order &&
      step.assignedToUserId != null
    )
    .map(step => ({
      userId: step.assignedToUserId,
      userName: step.assignedUser?.fullname || 'Unknown',
      stepOrder: step.order,
      stepType: step.actionType
    }))
    .sort((a, b) => b.stepOrder - a.stepOrder) // Most recent first
}
```

---

## Best Practices

### 1. Real-time Updates
- Use WebSockets or polling to refresh workflow status
- When a step is completed, notify next user
- Update UI immediately after actions

### 2. Permission Checks
- Always validate user can act on step before showing buttons
- Hide reject/approve buttons if not current user's step
- Show read-only view for completed/not-started steps

### 3. User Experience
- Show clear step progress indicators
- Display due dates prominently
- Show who completed each step and when
- Provide clear error messages

### 4. Rollback UX
- Only show rollback option for CONSECUTIVE workflows
- Pre-populate dropdown with previous step users
- Show warning before rolling back (it affects multiple steps)
- Require confirmation for rollback actions

### 5. History Tracking
- Display complete action history for transparency
- Show rollback chain clearly
- Include timestamps and user info
- Allow filtering by action type

### 6. Mobile Considerations
- Make approve/reject easy to access
- Use bottom sheets for rejection modals
- Show notifications for assigned steps
- Optimize step list for smaller screens

---

## Swagger API Documentation

Access the complete API documentation with interactive testing at:
```
http://localhost:5058/docs
```

All endpoints are documented with:
- Request/response schemas
- Example payloads
- Error responses
- Authentication requirements

---

## Questions?

If you encounter issues or have questions:
1. Check the Swagger docs at `/docs`
2. Review the error messages (they're descriptive)
3. Check the workflow type (CONSECUTIVE vs PARALLEL)
4. Verify user permissions and step assignments
5. Consult the backend team

---

**Last Updated:** 2025-01-29
**API Version:** v1
