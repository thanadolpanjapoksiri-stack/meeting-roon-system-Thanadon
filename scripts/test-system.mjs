import assert from "node:assert/strict";
import test from "node:test";

// ====================================================================
// SMART MEETING ROOM - AUTOMATED UNIT & INTEGRATION TESTS
// ====================================================================

// Test 1: Double-Booking Overlap Detection Algorithm
function checkOverlap(
  existingStart,
  existingEnd,
  proposedStart,
  proposedEnd
) {
  const eS = new Date(existingStart).getTime();
  const eE = new Date(existingEnd).getTime();
  const pS = new Date(proposedStart).getTime();
  const pE = new Date(proposedEnd).getTime();

  // Half-open interval overlap: [pS, pE) && [eS, eE)
  return pS < eE && pE > eS;
}

test("Double-Booking Detection: Identifies exact same time conflict", () => {
  const conflict = checkOverlap(
    "2026-10-28T10:00:00+07:00",
    "2026-10-28T12:00:00+07:00",
    "2026-10-28T10:00:00+07:00",
    "2026-10-28T12:00:00+07:00"
  );
  assert.equal(conflict, true, "Exact interval must conflict");
});

test("Double-Booking Detection: Identifies overlapping start", () => {
  const conflict = checkOverlap(
    "2026-10-28T10:00:00+07:00",
    "2026-10-28T12:00:00+07:00",
    "2026-10-28T09:00:00+07:00",
    "2026-10-28T10:30:00+07:00"
  );
  assert.equal(conflict, true, "Start overlap must conflict");
});

test("Double-Booking Detection: Identifies overlapping end", () => {
  const conflict = checkOverlap(
    "2026-10-28T10:00:00+07:00",
    "2026-10-28T12:00:00+07:00",
    "2026-10-28T11:30:00+07:00",
    "2026-10-28T13:00:00+07:00"
  );
  assert.equal(conflict, true, "End overlap must conflict");
});

test("Double-Booking Detection: Identifies completely contained interval", () => {
  const conflict = checkOverlap(
    "2026-10-28T09:00:00+07:00",
    "2026-10-28T15:00:00+07:00",
    "2026-10-28T10:00:00+07:00",
    "2026-10-28T11:00:00+07:00"
  );
  assert.equal(conflict, true, "Contained interval must conflict");
});

test("Double-Booking Detection: Allows back-to-back adjacent bookings without overlap", () => {
  // Booking A: 10:00 - 11:00, Booking B: 11:00 - 12:00
  const conflictBefore = checkOverlap(
    "2026-10-28T10:00:00+07:00",
    "2026-10-28T11:00:00+07:00",
    "2026-10-28T09:00:00+07:00",
    "2026-10-28T10:00:00+07:00"
  );
  assert.equal(conflictBefore, false, "Consecutive booking ending at start must NOT conflict");

  const conflictAfter = checkOverlap(
    "2026-10-28T10:00:00+07:00",
    "2026-10-28T11:00:00+07:00",
    "2026-10-28T11:00:00+07:00",
    "2026-10-28T12:00:00+07:00"
  );
  assert.equal(conflictAfter, false, "Consecutive booking starting at end must NOT conflict");
});

// Test 2: Role Permission Guard
function canApproveOrReject(role) {
  return role === "admin" || role === "approver";
}

function canCancelBooking(role, currentUserId, bookingOwnerId) {
  if (role === "admin") return true;
  return currentUserId === bookingOwnerId;
}

test("Permissions: Only Admin and Approver can approve or reject bookings", () => {
  assert.equal(canApproveOrReject("admin"), true);
  assert.equal(canApproveOrReject("approver"), true);
  assert.equal(canApproveOrReject("user"), false);
});

test("Permissions: User can only cancel their own booking, while Admin can cancel any", () => {
  const user1 = "u-101";
  const user2 = "u-102";
  const admin = "u-999";

  assert.equal(canCancelBooking("user", user1, user1), true, "User can cancel own booking");
  assert.equal(canCancelBooking("user", user2, user1), false, "User cannot cancel another user's booking");
  assert.equal(canCancelBooking("admin", admin, user1), true, "Admin can cancel any user's booking");
});

// Test 3: Capacity validation
function validateCapacity(roomCapacity, attendeesCount) {
  return attendeesCount <= roomCapacity && attendeesCount > 0;
}

test("Capacity: Validates attendees vs room capacity", () => {
  assert.equal(validateCapacity(10, 5), true);
  assert.equal(validateCapacity(10, 10), true);
  assert.equal(validateCapacity(10, 11), false, "Attendees exceeding room capacity must fail");
  assert.equal(validateCapacity(10, 0), false, "0 attendees must fail");
});

console.log("All automated test specifications compiled.");
