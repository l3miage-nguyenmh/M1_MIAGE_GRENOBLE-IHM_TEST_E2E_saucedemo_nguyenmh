import { test, type Page } from '@playwright/test';
import type { ScenarioStep } from '../dsl/types';
import { ActionExecutor } from './actionExecutor';
import { PerceptionEvaluator } from './perceptionEvaluator';

export async function runScenario(page: Page, steps: ScenarioStep[]): Promise<void> {
  const executor = new ActionExecutor(page);
  const evaluator = new PerceptionEvaluator(page, executor);

  for (const [index, step] of steps.entries()) {
    await test.step(`${index + 1}. ${step.action.type} → ${formatExpected(step.expected)}`, async () => {
      await executor.execute(step.action);
      const perceptions = Array.isArray(step.expected) ? step.expected : [step.expected];
      for (const perception of perceptions) await evaluator.evaluate(perception);
    });
  }
}

function formatExpected(expected: ScenarioStep['expected']): string {
  return (Array.isArray(expected) ? expected : [expected]).map(({ type }) => type).join(', ');
}
