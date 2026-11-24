import { actions } from '../dsl/actions';
import type { ScenarioStep } from '../dsl/types';

export const products = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTShirt: 'Sauce Labs Bolt T-Shirt',
};

export const validInformation = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  postalCode: '10001',
};

export function authenticatedSteps(): ScenarioStep[] {
  return [
    {
      action: actions.openApplication(),
      expected: { type: 'loginPageIsDisplayed' },
    },
    {
      action: actions.authenticateAs(
        process.env.STANDARD_USER ?? 'standard_user',
        process.env.STANDARD_PASSWORD ?? 'secret_sauce',
      ),
      expected: { type: 'customerIsAuthenticated' },
    },
  ];
}
