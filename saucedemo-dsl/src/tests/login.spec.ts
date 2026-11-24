import { test } from '@playwright/test';
import { actions } from '../dsl/actions';
import { perceptions } from '../dsl/perceptions';
import { runScenario } from '../interpreter/scenarioRunner';

const lockedUser = process.env.LOCKED_USER ?? 'locked_out_user';
const password = process.env.STANDARD_PASSWORD ?? 'secret_sauce';

test('TC03 / E2E03 — locked account is rejected and remains unauthenticated', async ({ page }) => {
  await runScenario(page, [
    { action: actions.openApplication(), expected: perceptions.loginPageIsDisplayed() },
    {
      action: actions.authenticateAs(lockedUser, password),
      expected: [perceptions.authenticationFailed(), perceptions.accountIsLocked(), perceptions.sessionIsTerminated()],
    },
  ]);
});

test('TC07 / E2E07 — logout prevents access to protected inventory', async ({ page }) => {
  await runScenario(page, [
    { action: actions.openApplication(), expected: perceptions.loginPageIsDisplayed() },
    {
      action: actions.authenticateAs(process.env.STANDARD_USER ?? 'standard_user', password),
      expected: perceptions.customerIsAuthenticated(),
    },
    { action: actions.browseProducts(), expected: perceptions.productCatalogIsDisplayed() },
    { action: actions.openNavigationMenu(), expected: perceptions.navigationMenuIsDisplayed() },
    { action: actions.logout(), expected: perceptions.sessionIsTerminated() },
    { action: actions.browseProducts(), expected: perceptions.protectedContentIsUnavailable() },
  ]);
});
