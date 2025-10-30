# Workflow Step Rejection & User Assignment Guide

This guide explains how to handle user assignment when rejecting workflow steps in Dockflow. This is a detailed companion to the main Workflow Guide, focusing specifically on the rejection and reassignment process.

## Table of Contents
- [Overview](#overview)
- [Rejection Types](#rejection-types)
- [User Assignment During Rejection](#user-assignment-during-rejection)
- [API Reference](#api-reference)
- [Implementation Examples](#implementation-examples)
- [Frontend UI Patterns](#frontend-ui-patterns)
- [Business Logic & Rules](#business-logic--rules)
- [Advanced Scenarios](#advanced-scenarios)
- [Troubleshooting](#troubleshooting)

---

## Overview

When a workflow step is rejected, there are multiple ways to handle the next action:

1. **Simple Rejection** - Just reject without reassignment
2. **Rejection with Rollback** - Send back to a previous step user
3. **Rejection with New Assignment** - Assign to a different user (future enhancement)

This guide covers how these work, when to use each, and how to implement them in your frontend application.

---

## Rejection Types

### Type 1: Simple Rejection (No Rollback)

**When to Use:**
- Document needs major rework before resubmission
- Workflow should stop until issues are addressed
- No specific previous step needs to be revisited

**What Happens:**
- Current step is marked as `REJECTED`
- Workflow stops at this step
- No automatic reassignment occurs
- Workflow status remains `ACTIVE` but paused

**Example:**
```json
{
  "rejectionReason": "Document does not meet requirements",
  "comment": "Please resubmit when all sections are complete"
}
```

---

### Type 2: Rejection with Rollback (CONSECUTIVE only)

**When to Use:**
- Previous reviewer needs to fix/update their work
- Issue originated from an earlier step
- Want to maintain workflow continuity
- Need to send document back to specific person

**What Happens:**
1. Current step is marked as `REJECTED`
2. System finds the step assigned to `rollbackToUserId`
3. That step is reset to `IN_PROGRESS`
4. All intermediate steps are reset to `NOT_STARTED`
5. Workflow's `currentStepOrder` moves back
6. Rollback actions are logged in history

**Example:**
```json
{
  "rejectionReason": "Missing financial data in manager's section",
  "comment": "Please add Q4 budget breakdown",
  "rollbackToUserId": "user-uuid-of-manager"
}
```

---

## User Assignment During Rejection

### Understanding Rollback Assignment

The rollback feature uses **user ID** to determine which step to return to, not step ID. This is important because:

1. **Flexibility**: Same user might have multiple steps in a workflow
2. **Simplicity**: Frontend can show user names/roles instead of step numbers
3. **Intent-based**: You're sending back to a person, not a step number

### How the System Finds the Rollback Step

When you provide `rollbackToUserId`, the backend:

```typescript
// Backend logic (conceptual)
1. Validates this is a CONSECUTIVE workflow
2. Gets current step's order
3. Searches for the MOST RECENT step where:
   - assignedToUserId matches rollbackToUserId
   - step.order < currentStep.order (must be previous)
4. If found, resets that step to IN_PROGRESS
5. Resets all steps between that one and current to NOT_STARTED
```

### Rules for Rollback User Selection

✅ **Valid Rollback Users:**
- Any user assigned to a previous step (order < current)
- User must exist in the workflow history
- Can be from any previous step, not just immediately prior

❌ **Invalid Rollback Users:**
- Users not in the workflow
- Users assigned to future steps (order >= current)
- Users assigned to the current step
- Random users not part of this workflow

---

## API Reference

### Reject Workflow Step

**Endpoint:**
```http
PATCH /api/v1/workflow-step/:id/reject
```

**Request Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body Schema:**

```typescript
interface RejectWorkflowStepDto {
  rejectionReason: string;        // Required - Why rejecting
  comment?: string;                // Optional - Additional context
  rollbackToUserId?: string;       // Optional - UUID of user to rollback to
}
```

**Field Details:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `rejectionReason` | string | ✅ Yes | Primary reason for rejection | Min 1 char, Max 500 chars |
| `comment` | string | ❌ No | Additional notes or instructions | Max 1000 chars |
| `rollbackToUserId` | string | ❌ No | UUID of user from previous step | Must be valid user UUID |

**Success Response (200):**

```json
{
  "id": "step-uuid",
  "workflowId": "workflow-uuid",
  "order": 3,
  "status": "REJECTED",
  "isRejected": true,
  "rejectionReason": "Missing financial data in manager's section",
  "rejectedAt": "2025-01-29T15:30:00Z",
  "completedAt": "2025-01-29T15:30:00Z",
  "assignedToUserId": "current-user-id",
  "actionType": "APPROVE",
  "workflowStep": {
    "workflow": {
      "currentStepOrder": 1,
      "status": "ACTIVE"
    }
  }
}
```

**Error Responses:**

```json
// 400 - Not a CONSECUTIVE workflow
{
  "statusCode": 400,
  "message": "Rollback feature is only available for CONSECUTIVE workflows"
}

// 400 - Invalid rollback user
{
  "statusCode": 400,
  "message": "Cannot rollback to this user. They are not assigned to any previous step."
}

// 400 - Step already completed
{
  "statusCode": 400,
  "message": "This step has already been completed"
}

// 400 - Not current step (CONSECUTIVE)
{
  "statusCode": 400,
  "message": "Cannot complete this step. Current workflow step is 2, but you are trying to complete step 3."
}

// 404 - Step not found or unauthorized
{
  "statusCode": 404,
  "message": "Workflow step not found"
}

// 404 - Rollback user not found
{
  "statusCode": 404,
  "message": "No previous workflow step found for user John Doe in this workflow"
}
```

---

## Implementation Examples

### Example 1: Simple Rejection Without Rollback

**Scenario:** Document is fundamentally incomplete and needs complete rework.

```typescript
async function rejectStepSimple(stepId: string) {
  const response = await fetch(`/api/v1/workflow-step/${stepId}/reject`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rejectionReason: 'Document incomplete - missing multiple required sections',
      comment: 'Please ensure sections 2, 4, and 7 are completed before resubmission'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}
```

**Result:**
- Step marked as `REJECTED`
- Workflow pauses
- No one is automatically assigned to fix it
- Document creator needs to resubmit

---

### Example 2: Rejection with Rollback to Previous Reviewer

**Scenario:** Issue found that originated in a previous step.

```typescript
async function rejectStepWithRollback(
  stepId: string,
  rollbackToUserId: string,
  reason: string,
  comment?: string
) {
  const response = await fetch(`/api/v1/workflow-step/${stepId}/reject`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rejectionReason: reason,
      comment: comment,
      rollbackToUserId: rollbackToUserId
    })
  });

  if (!response.ok) {
    const error = await response.json();

    // Handle specific errors
    if (error.statusCode === 400) {
      if (error.message.includes('CONSECUTIVE')) {
        throw new Error('Cannot rollback in parallel workflows');
      }
      if (error.message.includes('previous step')) {
        throw new Error('Selected user is not in a previous step');
      }
    }

    throw new Error(error.message);
  }

  return await response.json();
}

// Usage
await rejectStepWithRollback(
  'current-step-id',
  'manager-user-id',
  'Budget calculations are incorrect',
  'Please review and update the Q4 financial projections'
);
```

**Result:**
- Current step (e.g., Step 3) marked as `REJECTED`
- Manager's step (e.g., Step 1) reset to `IN_PROGRESS`
- Intermediate steps (e.g., Step 2) reset to `NOT_STARTED`
- Workflow continues from Step 1

---

### Example 3: Getting Available Rollback Users

**Frontend Helper Function:**

```typescript
interface RollbackUser {
  userId: string;
  userName: string;
  userRole: string;
  stepOrder: number;
  stepActionType: string;
  stepStatus: string;
}

function getAvailableRollbackUsers(
  currentStep: WorkflowStep,
  workflow: Workflow
): RollbackUser[] {

  // Only for CONSECUTIVE workflows
  if (workflow.type !== 'CONSECUTIVE') {
    return [];
  }

  // Filter previous steps that have assigned users
  const previousSteps = workflow.workflowSteps
    .filter(step =>
      step.order < currentStep.order &&
      step.assignedToUserId != null
    )
    .map(step => ({
      userId: step.assignedToUserId,
      userName: step.assignedUser?.fullname || 'Unknown User',
      userRole: step.assignedUser?.role?.name || 'No Role',
      stepOrder: step.order,
      stepActionType: step.actionType,
      stepStatus: step.status
    }))
    .sort((a, b) => b.stepOrder - a.stepOrder); // Most recent first

  return previousSteps;
}

// Usage in component
const rollbackUsers = getAvailableRollbackUsers(currentStep, workflow);

if (rollbackUsers.length === 0) {
  console.log('No previous steps available for rollback');
} else {
  console.log('Can rollback to:', rollbackUsers);
}
```

---

### Example 4: Complete Rejection Flow with User Selection

```typescript
// React/Next.js example with state management
import { useState } from 'react';

function WorkflowStepRejectionModal({
  step,
  workflow,
  onReject,
  onCancel
}) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [comment, setComment] = useState('');
  const [enableRollback, setEnableRollback] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rollbackUsers = getAvailableRollbackUsers(step, workflow);
  const canRollback = workflow.type === 'CONSECUTIVE' && rollbackUsers.length > 0;

  const handleSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (enableRollback && !selectedUserId) {
      alert('Please select a user to rollback to');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        rejectionReason: rejectionReason.trim(),
        comment: comment.trim() || undefined,
        rollbackToUserId: enableRollback ? selectedUserId : undefined
      };

      await rejectStepWithRollback(step.id, payload);
      onReject();
    } catch (error) {
      alert(`Rejection failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal">
      <h2>Reject Workflow Step</h2>

      <div className="form-group">
        <label>Rejection Reason *</label>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Why are you rejecting this step?"
          maxLength={500}
          required
        />
        <small>{rejectionReason.length}/500</small>
      </div>

      <div className="form-group">
        <label>Additional Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional: Provide additional context or instructions"
          maxLength={1000}
        />
        <small>{comment.length}/1000</small>
      </div>

      {canRollback && (
        <>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={enableRollback}
                onChange={(e) => setEnableRollback(e.target.checked)}
              />
              Send back to previous reviewer
            </label>
          </div>

          {enableRollback && (
            <div className="form-group">
              <label>Select Reviewer to Rollback To *</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
              >
                <option value="">-- Select User --</option>
                {rollbackUsers.map(user => (
                  <option key={user.userId} value={user.userId}>
                    Step {user.stepOrder}: {user.userName} ({user.stepActionType})
                  </option>
                ))}
              </select>
              <small>
                Workflow will restart from this user's step
              </small>
            </div>
          )}
        </>
      )}

      <div className="modal-actions">
        <button onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn-danger"
        >
          {isSubmitting ? 'Rejecting...' : 'Reject Step'}
        </button>
      </div>
    </div>
  );
}
```

---

## Frontend UI Patterns

### Pattern 1: Simple Rejection Modal (No Rollback Support)

Use for PARALLEL workflows or when rollback is not needed.

```
┌─────────────────────────────────────────┐
│ Reject Workflow Step                    │
├─────────────────────────────────────────┤
│                                         │
│ Rejection Reason: *                     │
│ ┌─────────────────────────────────────┐ │
│ │ Document does not meet requirements │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Additional Comment:                     │
│ ┌─────────────────────────────────────┐ │
│ │ Please complete sections 3-5        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│              [Cancel]  [Reject]         │
└─────────────────────────────────────────┘
```

---

### Pattern 2: Advanced Rejection Modal (With Rollback)

Use for CONSECUTIVE workflows where rollback is available.

```
┌─────────────────────────────────────────────┐
│ Reject Workflow Step                        │
├─────────────────────────────────────────────┤
│                                             │
│ Rejection Reason: *                         │
│ ┌─────────────────────────────────────────┐ │
│ │ Financial data is incomplete            │ │
│ └─────────────────────────────────────────┘ │
│ Character count: 30/500                     │
│                                             │
│ Additional Comment:                         │
│ ┌─────────────────────────────────────────┐ │
│ │ Please add Q4 budget breakdown and      │ │
│ │ update revenue projections              │ │
│ └─────────────────────────────────────────┘ │
│ Character count: 65/1000                    │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ ☑ Send back to previous reviewer      │   │
│ └───────────────────────────────────────┘   │
│                                             │
│ Select User to Rollback To: *               │
│ ┌─────────────────────────────────────────┐ │
│ │ Step 1: John Doe (REVIEW)            ▼ │ │
│ ├─────────────────────────────────────────┤ │
│ │ Step 2: Jane Smith (APPROVE)           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ⚠️  Warning: This will reset all steps      │
│    between Step 1 and current step          │
│                                             │
│               [Cancel]  [Reject & Rollback] │
└─────────────────────────────────────────────┘
```

---

### Pattern 3: Mobile-Optimized Bottom Sheet

```
┌─────────────────────────┐
│    ═══  Reject Step     │
├─────────────────────────┤
│                         │
│ Why reject? *           │
│ ┌─────────────────────┐ │
│ │ Missing data        │ │
│ └─────────────────────┘ │
│                         │
│ Comments                │
│ ┌─────────────────────┐ │
│ │ Add Q4 data         │ │
│ └─────────────────────┘ │
│                         │
│ ☑ Send to previous     │
│                         │
│ Rollback to:            │
│ ┌─────────────────────┐ │
│ │ John (Step 1)     ▼ │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │   REJECT STEP       │ │
│ └─────────────────────┘ │
│                         │
│      [Cancel]           │
└─────────────────────────┘
```

---

## Business Logic & Rules

### Rule 1: Workflow Type Restrictions

```typescript
// Rollback is ONLY available for CONSECUTIVE workflows
if (workflow.type === 'PARALLEL') {
  // Do NOT show rollback checkbox
  // Rejection will only stop the current step
}

if (workflow.type === 'CONSECUTIVE') {
  // Rollback is available
  // Show checkbox and user dropdown
}
```

---

### Rule 2: User Eligibility for Rollback

```typescript
// A user is eligible for rollback if:
function isUserEligibleForRollback(
  userId: string,
  currentStep: WorkflowStep,
  workflow: Workflow
): boolean {

  // Find steps assigned to this user
  const userSteps = workflow.workflowSteps.filter(
    step => step.assignedToUserId === userId
  );

  // Check if ANY of their steps are before current step
  const hasPreviousStep = userSteps.some(
    step => step.order < currentStep.order
  );

  return hasPreviousStep;
}
```

---

### Rule 3: Current Step Validation

Only the current step can be rejected in CONSECUTIVE workflows:

```typescript
function canRejectStep(
  step: WorkflowStep,
  workflow: Workflow,
  currentUserId: string
): { canReject: boolean; reason?: string } {

  // Must be assigned to current user
  if (step.assignedToUserId !== currentUserId) {
    return {
      canReject: false,
      reason: 'This step is not assigned to you'
    };
  }

  // Must be IN_PROGRESS
  if (step.status !== 'IN_PROGRESS') {
    return {
      canReject: false,
      reason: `Step is ${step.status}, cannot reject`
    };
  }

  // For CONSECUTIVE, must be current step
  if (workflow.type === 'CONSECUTIVE' &&
      step.order !== workflow.currentStepOrder) {
    return {
      canReject: false,
      reason: 'Only the current workflow step can be rejected'
    };
  }

  return { canReject: true };
}
```

---

### Rule 4: Rollback Impact Calculation

Show users what will be affected by rollback:

```typescript
function calculateRollbackImpact(
  currentStepOrder: number,
  rollbackTargetOrder: number,
  workflow: Workflow
) {
  const affectedSteps = workflow.workflowSteps.filter(
    step => step.order >= rollbackTargetOrder &&
            step.order <= currentStepOrder
  );

  return {
    stepsAffected: affectedSteps.length,
    willBeReset: affectedSteps.filter(s => s.order !== rollbackTargetOrder).length,
    targetStepOrder: rollbackTargetOrder,
    message: `Rolling back to Step ${rollbackTargetOrder} will reset ${affectedSteps.length - 1} step(s)`
  };
}

// Display in UI
const impact = calculateRollbackImpact(3, 1, workflow);
console.log(impact.message);
// "Rolling back to Step 1 will reset 2 step(s)"
```

---

## Advanced Scenarios

### Scenario 1: Multi-Level Rollback Chain

**Situation:** Document gets rejected multiple times and rolled back.

```
Initial Flow:
Step 1 (Manager) → Step 2 (Director) → Step 3 (CFO)

Action 1: CFO rejects, rollbacks to Manager (Step 1)
Result: Step 1 IN_PROGRESS, Step 2-3 NOT_STARTED

Action 2: Manager completes Step 1
Result: Step 2 IN_PROGRESS

Action 3: Director rejects, rollbacks to Manager again
Result: Step 1 IN_PROGRESS, Step 2 REJECTED

Action 4: Manager completes Step 1 (second time)
Result: Step 2 IN_PROGRESS (same Director)

Action 5: All steps complete successfully
Result: Workflow COMPLETED
```

**Action History:**
```json
[
  { "actionType": "STARTED", "stepOrder": 1, "user": "Manager" },
  { "actionType": "APPROVED", "stepOrder": 1, "user": "Manager" },
  { "actionType": "STARTED", "stepOrder": 2, "user": "Director" },
  { "actionType": "APPROVED", "stepOrder": 2, "user": "Director" },
  { "actionType": "STARTED", "stepOrder": 3, "user": "CFO" },
  {
    "actionType": "REJECTED",
    "stepOrder": 3,
    "user": "CFO",
    "metadata": { "rollbackToUserId": "manager-id", "rollbackToStepId": "step-1-id" }
  },
  {
    "actionType": "ROLLBACK",
    "stepOrder": 1,
    "user": "Manager",
    "metadata": { "rolledBackFrom": 3 }
  },
  { "actionType": "APPROVED", "stepOrder": 1, "user": "Manager" },
  { "actionType": "STARTED", "stepOrder": 2, "user": "Director" },
  {
    "actionType": "REJECTED",
    "stepOrder": 2,
    "user": "Director",
    "metadata": { "rollbackToUserId": "manager-id" }
  },
  { "actionType": "ROLLBACK", "stepOrder": 1, "user": "Manager" },
  { "actionType": "APPROVED", "stepOrder": 1, "user": "Manager" },
  { "actionType": "APPROVED", "stepOrder": 2, "user": "Director" },
  { "actionType": "APPROVED", "stepOrder": 3, "user": "CFO" },
  { "actionType": "COMPLETED", "workflow": true }
]
```

---

### Scenario 2: Same User in Multiple Steps

**Situation:** A user appears in multiple steps of the workflow.

```
Workflow Steps:
Step 1: John (Initial Review)
Step 2: Sarah (Approval)
Step 3: John (Final Sign-off)
Step 4: CEO (Executive Approval)
```

**Current Position:** Step 4 (CEO)

**Rollback Options:**
When CEO wants to rollback to "John", system needs clarity:

```typescript
// Get all John's steps
const johnSteps = workflow.workflowSteps.filter(
  step => step.assignedToUserId === 'john-user-id'
);
// Returns: [Step 1, Step 3]

// System picks the MOST RECENT previous step
const rollbackStep = johnSteps
  .filter(step => step.order < currentStep.order)
  .sort((a, b) => b.order - a.order)[0];
// Returns: Step 3 (most recent)
```

**Frontend Display:**
```
Select User to Rollback To:
┌─────────────────────────────────────┐
│ Step 3: John Doe (Final Sign-off)  │ ← Most recent
│ Step 2: Sarah Smith (Approval)     │
│ Step 1: John Doe (Initial Review)  │
└─────────────────────────────────────┘
```

**Best Practice:** Show step details, not just names, to avoid confusion.

---

### Scenario 3: Rejection Without Rollback on CONSECUTIVE Workflow

**Situation:** Rejecting a CONSECUTIVE workflow step without rollback.

```
Current State:
Step 1: COMPLETED
Step 2: COMPLETED
Step 3: IN_PROGRESS (Current)
Step 4: NOT_STARTED

User Action: Reject Step 3 without rollback

Result:
Step 1: COMPLETED
Step 2: COMPLETED
Step 3: REJECTED ✗
Step 4: NOT_STARTED

Workflow Status: ACTIVE
Current Step Order: 3 (unchanged)
```

**What Happens Next:**
- Workflow is effectively paused
- No one can work on the document
- Document creator or admin needs to:
  - Fix the document
  - Manually reassign the step
  - Or create a new workflow

**Use Case:**
- Fundamental issue that can't be fixed by previous reviewers
- Document needs to go back to creator for major changes
- Workflow should be restarted

---

## Troubleshooting

### Problem 1: "Rollback feature is only available for CONSECUTIVE workflows"

**Cause:** Trying to use `rollbackToUserId` on a PARALLEL workflow.

**Solution:**
```typescript
// Check workflow type before showing rollback option
if (workflow.type === 'PARALLEL') {
  // Don't show rollback checkbox
  // Remove rollbackToUserId from payload
}
```

---

### Problem 2: "No previous workflow step found for user"

**Cause:** Specified user ID is not assigned to any previous step.

**Solutions:**

1. **Validate before sending:**
```typescript
const validUsers = getAvailableRollbackUsers(currentStep, workflow);
const isValid = validUsers.some(u => u.userId === selectedUserId);

if (!isValid) {
  throw new Error('Selected user is not in a previous step');
}
```

2. **Only show valid users in dropdown:**
```typescript
// Dropdown should only contain users from previous steps
{rollbackUsers.map(user => (
  <option key={user.userId} value={user.userId}>
    {user.userName}
  </option>
))}
```

---

### Problem 3: "Cannot complete this step. Current workflow step is X"

**Cause:** Trying to reject a step that is not the current step in a CONSECUTIVE workflow.

**Solution:**
```typescript
// Disable reject button for non-current steps
const isCurrentStep = step.order === workflow.currentStepOrder;
const canReject = isCurrentStep && step.status === 'IN_PROGRESS';

<button disabled={!canReject}>
  {canReject ? 'Reject' : 'Not Current Step'}
</button>
```

---

### Problem 4: Rollback Not Resetting Intermediate Steps

**Cause:** This is expected behavior - intermediate steps are reset to `NOT_STARTED`.

**Verification:**
```typescript
// After rollback, check step statuses
const rollbackTargetStep = workflow.workflowSteps.find(
  s => s.assignedToUserId === rollbackUserId && s.order < currentStep.order
);

const intermediateSteps = workflow.workflowSteps.filter(
  s => s.order > rollbackTargetStep.order && s.order < currentStep.order
);

// All intermediate steps should be NOT_STARTED
intermediateSteps.forEach(step => {
  console.assert(step.status === 'NOT_STARTED', 'Step should be reset');
});
```

---

### Problem 5: User Confused About Which Step Will Be Active After Rollback

**Solution:** Show clear preview before rollback:

```typescript
function RollbackPreview({ selectedUserId, currentStep, workflow }) {
  const targetStep = workflow.workflowSteps.find(
    s => s.assignedToUserId === selectedUserId && s.order < currentStep.order
  );

  if (!targetStep) return null;

  const impact = calculateRollbackImpact(
    currentStep.order,
    targetStep.order,
    workflow
  );

  return (
    <div className="rollback-preview">
      <h4>Rollback Preview:</h4>
      <ul>
        <li>✅ Step {targetStep.order} will become ACTIVE</li>
        <li>❌ Current step ({currentStep.order}) will be REJECTED</li>
        <li>🔄 {impact.willBeReset} step(s) will be reset</li>
      </ul>
      <p className="warning">
        ⚠️ This will require {impact.stepsAffected} step(s) to be completed again.
      </p>
    </div>
  );
}
```

---

## Best Practices

### 1. Always Validate Workflow Type

```typescript
// Before showing rollback UI
if (workflow.type !== 'CONSECUTIVE') {
  return <SimpleRejectionModal />; // No rollback option
}

return <AdvancedRejectionModal />; // With rollback
```

---

### 2. Provide Clear User Feedback

```typescript
// Show what will happen
const handleRollbackChange = (enabled: boolean) => {
  setEnableRollback(enabled);

  if (enabled) {
    toast.info('Workflow will be sent back to the selected reviewer');
  } else {
    toast.info('Workflow will stop at this step');
  }
};
```

---

### 3. Require Confirmation for Rollback

```typescript
const confirmRollback = () => {
  const confirmed = window.confirm(
    `Are you sure you want to reject and rollback to ${selectedUser.name}? ` +
    `This will reset ${affectedStepsCount} step(s).`
  );

  if (confirmed) {
    performRejection();
  }
};
```

---

### 4. Log Rejection History

```typescript
// After successful rejection, fetch updated actions
await refreshWorkflowActions();

// Display in timeline
<Timeline>
  {actions.map(action => (
    <TimelineItem key={action.id}>
      {action.actionType === 'REJECTED' && (
        <>
          <strong>Rejected by {action.performedBy.fullname}</strong>
          <p>Reason: {action.metadata.rejectionReason}</p>
          {action.metadata.rollbackToUserId && (
            <p>Rolled back to Step {action.metadata.rollbackToStepId}</p>
          )}
        </>
      )}
    </TimelineItem>
  ))}
</Timeline>
```

---

### 5. Handle Edge Cases Gracefully

```typescript
// Edge case: No previous steps available
if (rollbackUsers.length === 0) {
  return (
    <div className="info-message">
      ℹ️ This is the first step in the workflow.
      Rollback is not available.
    </div>
  );
}

// Edge case: User was deleted
const safeUserName = step.assignedUser?.fullname || '[Deleted User]';
```

---

## Testing Checklist

When implementing rejection with rollback, test these scenarios:

- [ ] Simple rejection without rollback works
- [ ] Rollback to immediately previous step works
- [ ] Rollback to step several steps back works
- [ ] Rollback with same user in multiple steps works correctly
- [ ] PARALLEL workflow does NOT show rollback option
- [ ] CONSECUTIVE workflow shows rollback option
- [ ] Validation prevents rollback to invalid users
- [ ] Intermediate steps are properly reset
- [ ] Action history logs all rollback events
- [ ] UI shows clear preview of rollback impact
- [ ] Error messages are user-friendly
- [ ] Rejection reason is required
- [ ] Character limits are enforced
- [ ] Mobile UI is responsive and usable

---

## Related Documentation

- [WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md) - Main workflow documentation
- API Docs: http://localhost:5058/docs

---

**Last Updated:** 2025-01-29
**API Version:** v1
**Feature Status:** Production Ready
