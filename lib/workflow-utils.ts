import { parseVariables } from "./utils";

export type Condition = {
  leftOperand: string;
  operator: string;
  rightOperand: string;
};

export function evaluateCondition(
  conditions: Condition[],
  rootLogic: "AND" | "OR",
  elements: any[],
): boolean {
  if (conditions.length === 0) return true;

  const results = conditions.map((c) => {
    const left = parseVariables(c.leftOperand, elements);
    const right = parseVariables(c.rightOperand, elements);

    switch (c.operator) {
      case "equals":
        return left === right;
      case "not_equals":
        return left !== right;
      case "contains":
        return String(left).includes(String(right));
      case "not_contains":
        return !String(left).includes(String(right));
      case "starts_with":
        return String(left).startsWith(String(right));
      case "ends_with":
        return String(left).endsWith(String(right));
      case "greater_than":
        return Number(left) > Number(right);
      case "less_than":
        return Number(left) < Number(right);
      case "exists":
        return left !== "" && left !== null && left !== undefined;
      case "is_empty":
        return left === "" || left === null || left === undefined;
      default:
        return false;
    }
  });

  return rootLogic === "AND" ? results.every((r) => r) : results.some((r) => r);
}
