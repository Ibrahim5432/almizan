import test from 'node:test';
import assert from 'node:assert/strict';
import { runEditorialEvalSuite } from './eval-suite';

test('32-Case Editorial & AdSense Evaluation Suite passes 100% of cases', () => {
  const results = runEditorialEvalSuite();
  assert.ok(results.total >= 30, `Expected at least 30 eval cases, got ${results.total}`);
  for (const c of results.cases) {
    assert.equal(
      c.passed,
      true,
      `Eval case #${c.id} (${c.nameAr}) failed: expected ${c.expectedOutcome}, got ${c.actualOutcome}`
    );
  }
  assert.equal(results.failed, 0);
});
