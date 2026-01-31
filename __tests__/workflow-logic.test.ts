import { describe, it, expect } from "vitest";
import { evaluateCondition, Condition } from "../lib/workflow-utils";

describe("Workflow Logic - Condition Evaluation", () => {
  const mockElements = [
    {
      id: "node-1",
      data: {
        metadata: {
          sampleData: {
            status: "success",
            count: 15,
            message: "Hello world",
          },
        },
      },
    },
  ];

  it("should evaluate EQUALS correctly", () => {
    const conditions: Condition[] = [
      {
        leftOperand: "{{node-1.status}}",
        operator: "equals",
        rightOperand: "success",
      },
    ];
    expect(evaluateCondition(conditions, "AND", mockElements)).toBe(true);

    const failConditions: Condition[] = [
      {
        leftOperand: "{{node-1.status}}",
        operator: "equals",
        rightOperand: "failure",
      },
    ];
    expect(evaluateCondition(failConditions, "AND", mockElements)).toBe(false);
  });

  it("should evaluate GREATER_THAN correctly", () => {
    const conditions: Condition[] = [
      {
        leftOperand: "{{node-1.count}}",
        operator: "greater_than",
        rightOperand: "10",
      },
    ];
    expect(evaluateCondition(conditions, "AND", mockElements)).toBe(true);

    const failConditions: Condition[] = [
      {
        leftOperand: "{{node-1.count}}",
        operator: "greater_than",
        rightOperand: "20",
      },
    ];
    expect(evaluateCondition(failConditions, "AND", mockElements)).toBe(false);
  });

  it("should handle AND logic multiple conditions", () => {
    const conditions: Condition[] = [
      {
        leftOperand: "{{node-1.status}}",
        operator: "equals",
        rightOperand: "success",
      },
      {
        leftOperand: "{{node-1.count}}",
        operator: "greater_than",
        rightOperand: "10",
      },
    ];
    expect(evaluateCondition(conditions, "AND", mockElements)).toBe(true);
  });

  it("should handle OR logic multiple conditions", () => {
    const conditions: Condition[] = [
      {
        leftOperand: "{{node-1.status}}",
        operator: "equals",
        rightOperand: "failure",
      },
      {
        leftOperand: "{{node-1.count}}",
        operator: "greater_than",
        rightOperand: "10",
      },
    ];
    expect(evaluateCondition(conditions, "OR", mockElements)).toBe(true);
  });
});
