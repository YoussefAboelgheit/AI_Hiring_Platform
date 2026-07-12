import { describe, it, before, after } from "node:test";
import assert from "node:assert";

const MAX_VIOLATIONS = 3;

function simulateViolationFlow() {
  let count = 0;
  const results = [];

  const handleViolation = () => {
    count++;
    const currentCount = count;
    const shouldWarn = currentCount >= MAX_VIOLATIONS;
    const shouldAutoSubmit = currentCount > MAX_VIOLATIONS;

    results.push({
      violationCount: currentCount,
      maxViolations: MAX_VIOLATIONS,
      shouldWarn,
      autoSubmitted: shouldAutoSubmit,
    });
  };

  return { count: () => count, results, handleViolation };
}

describe("Assessment Violation System", () => {
  describe("Violation creation and counting", () => {
    it("should increment count on each violation", () => {
      const flow = simulateViolationFlow();
      assert.strictEqual(flow.count(), 0);

      flow.handleViolation();
      assert.strictEqual(flow.count(), 1);

      flow.handleViolation();
      assert.strictEqual(flow.count(), 2);
    });

    it("should track violation count accurately after multiple violations", () => {
      const flow = simulateViolationFlow();
      for (let i = 0; i < 5; i++) {
        flow.handleViolation();
      }
      assert.strictEqual(flow.count(), 5);
    });
  });

  describe("Warning threshold logic", () => {
    it("should not warn before reaching MAX_VIOLATIONS", () => {
      const flow = simulateViolationFlow();
      flow.handleViolation();
      flow.handleViolation();
      assert.strictEqual(flow.results[1].shouldWarn, false);
    });

    it("should warn when violations reach MAX_VIOLATIONS", () => {
      const flow = simulateViolationFlow();
      flow.handleViolation();
      flow.handleViolation();
      flow.handleViolation();
      assert.strictEqual(flow.results[2].shouldWarn, true);
    });

    it("should continue warning after exceeding MAX_VIOLATIONS", () => {
      const flow = simulateViolationFlow();
      for (let i = 0; i < 5; i++) {
        flow.handleViolation();
      }
      assert.strictEqual(flow.results[3].shouldWarn, true);
      assert.strictEqual(flow.results[4].shouldWarn, true);
    });
  });

  describe("Auto-submit condition", () => {
    it("should not auto-submit when violations are below threshold", () => {
      const flow = simulateViolationFlow();
      flow.handleViolation();
      flow.handleViolation();
      assert.strictEqual(flow.results[0].autoSubmitted, false);
      assert.strictEqual(flow.results[1].autoSubmitted, false);
    });

    it("should not auto-submit at exactly MAX_VIOLATIONS", () => {
      const flow = simulateViolationFlow();
      flow.handleViolation();
      flow.handleViolation();
      flow.handleViolation();
      assert.strictEqual(flow.results[2].autoSubmitted, false);
    });

    it("should auto-submit when violations EXCEED MAX_VIOLATIONS", () => {
      const flow = simulateViolationFlow();
      for (let i = 0; i < 4; i++) {
        flow.handleViolation();
      }
      // 4th violation (index 3) should trigger auto-submit
      assert.strictEqual(flow.results[3].autoSubmitted, true);
    });

    it("should return autoSubmitted=true for all violations after exceeding", () => {
      const flow = simulateViolationFlow();
      for (let i = 0; i < 6; i++) {
        flow.handleViolation();
      }
      // Violations 4-6 (indices 3-5) should all show autoSubmitted=true
      for (let i = 3; i < 6; i++) {
        assert.strictEqual(flow.results[i].autoSubmitted, true);
      }
    });
  });

  describe("Response format", () => {
    it("should return correct response structure", () => {
      const flow = simulateViolationFlow();
      flow.handleViolation();
      const result = flow.results[0];

      assert.ok("violationCount" in result);
      assert.ok("maxViolations" in result);
      assert.ok("shouldWarn" in result);
      assert.ok("autoSubmitted" in result);
      assert.strictEqual(result.violationCount, 1);
      assert.strictEqual(result.maxViolations, MAX_VIOLATIONS);
      assert.strictEqual(typeof result.shouldWarn, "boolean");
      assert.strictEqual(typeof result.autoSubmitted, "boolean");
    });
  });
});
