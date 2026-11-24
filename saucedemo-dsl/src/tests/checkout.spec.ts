import { test } from '@playwright/test';
import { actions } from '../dsl/actions';
import { perceptions } from '../dsl/perceptions';
import { runScenario } from '../interpreter/scenarioRunner';
import { authenticatedSteps, products, validInformation } from './testData';

test('TC01 / E2E01 — complete a successful purchase of one product', async ({ page }) => {
  await runScenario(page, [
    ...authenticatedSteps(),
    { action: actions.browseProducts(), expected: perceptions.productCatalogIsDisplayed() },
    { action: actions.addProductToCart(products.backpack), expected: perceptions.productIsInCart(products.backpack) },
    { action: actions.reviewCart(), expected: perceptions.cartContains(products.backpack) },
    { action: actions.startCheckout(), expected: perceptions.checkoutInformationPageIsDisplayed() },
    { action: actions.provideCheckoutInformation(validInformation), expected: perceptions.checkoutInformationPageIsDisplayed() },
    { action: actions.submitCheckoutInformation(), expected: perceptions.checkoutInformationIsAccepted() },
    {
      action: actions.reviewOrder(),
      expected: [
        perceptions.orderContains(products.backpack),
        perceptions.orderItemTotalIs(29.99),
        perceptions.orderPaymentAndShippingInformationIsDisplayed(),
        perceptions.orderCalculationIsCorrect(),
        perceptions.orderInformationIsConsistent(),
      ],
    },
    {
      action: actions.completePurchase(),
      expected: [perceptions.purchaseIsCompleted(), perceptions.orderConfirmationIsDisplayed(), perceptions.orderSuccessMessageIsDisplayed()],
    },
    { action: actions.returnToShopping(), expected: perceptions.productCatalogIsDisplayed() },
  ]);
});

test('TC02 / E2E02 — aggregate multiple products and calculate order total', async ({ page }) => {
  await runScenario(page, [
    ...authenticatedSteps(),
    { action: actions.addProductToCart(products.backpack), expected: perceptions.productIsInCart(products.backpack) },
    { action: actions.addProductToCart(products.bikeLight), expected: perceptions.productIsInCart(products.bikeLight) },
    {
      action: actions.reviewCart(),
      expected: [perceptions.cartContains(products.backpack, products.bikeLight), perceptions.cartItemCountIs(2)],
    },
    { action: actions.startCheckout(), expected: perceptions.checkoutInformationPageIsDisplayed() },
    { action: actions.provideCheckoutInformation(validInformation), expected: perceptions.checkoutInformationPageIsDisplayed() },
    { action: actions.submitCheckoutInformation(), expected: perceptions.orderOverviewIsDisplayed() },
    {
      action: actions.reviewOrder(),
      expected: [
        perceptions.orderContains(products.backpack, products.bikeLight),
        perceptions.orderItemTotalIs(39.98),
        perceptions.orderCalculationIsCorrect(),
        perceptions.orderInformationIsConsistent(),
      ],
    },
    {
      action: actions.completePurchase(),
      expected: [perceptions.purchaseIsCompleted(), perceptions.orderSuccessMessageIsDisplayed()],
    },
  ]);
});

test('TC04 / E2E04 — required checkout fields reject omissions and allow recovery', async ({ page }) => {
  await runScenario(page, [
    ...authenticatedSteps(),
    { action: actions.addProductToCart(products.backpack), expected: perceptions.productIsInCart(products.backpack) },
    { action: actions.reviewCart(), expected: perceptions.cartContains(products.backpack) },
    { action: actions.startCheckout(), expected: perceptions.checkoutInformationPageIsDisplayed() },
    { action: actions.submitCheckoutInformation(), expected: [perceptions.checkoutInformationIsRejected(), perceptions.requiredFieldErrorIsDisplayed('firstName')] },
    {
      action: actions.provideCheckoutInformation({ firstName: 'Ada', lastName: '', postalCode: '' }),
      expected: perceptions.checkoutInformationPageIsDisplayed(),
    },
    { action: actions.submitCheckoutInformation(), expected: [perceptions.checkoutInformationIsRejected(), perceptions.requiredFieldErrorIsDisplayed('lastName')] },
    {
      action: actions.provideCheckoutInformation({ firstName: 'Ada', lastName: 'Lovelace', postalCode: '' }),
      expected: perceptions.checkoutInformationPageIsDisplayed(),
    },
    { action: actions.submitCheckoutInformation(), expected: [perceptions.checkoutInformationIsRejected(), perceptions.requiredFieldErrorIsDisplayed('postalCode')] },
    { action: actions.provideCheckoutInformation(validInformation), expected: perceptions.checkoutInformationPageIsDisplayed() },
    { action: actions.submitCheckoutInformation(), expected: perceptions.checkoutInformationIsAccepted() },
  ]);
});

test('TC06 / E2E06 — cancel checkout without losing the cart selection', async ({ page }) => {
  await runScenario(page, [
    ...authenticatedSteps(),
    { action: actions.addProductToCart(products.backpack), expected: perceptions.productIsInCart(products.backpack) },
    { action: actions.reviewCart(), expected: perceptions.cartContains(products.backpack) },
    { action: actions.startCheckout(), expected: perceptions.checkoutInformationPageIsDisplayed() },
    { action: actions.cancelCheckout(), expected: perceptions.cartIsDisplayed() },
    { action: actions.reviewCart(), expected: perceptions.cartContains(products.backpack) },
  ]);
});

test('TC10 — cancel from order overview returns to product discovery', async ({ page }) => {
  await runScenario(page, [
    ...authenticatedSteps(),
    { action: actions.addProductToCart(products.backpack), expected: perceptions.productIsInCart(products.backpack) },
    { action: actions.reviewCart(), expected: perceptions.cartContains(products.backpack) },
    { action: actions.startCheckout(), expected: perceptions.checkoutInformationPageIsDisplayed() },
    { action: actions.provideCheckoutInformation(validInformation), expected: perceptions.checkoutInformationPageIsDisplayed() },
    { action: actions.submitCheckoutInformation(), expected: perceptions.orderOverviewIsDisplayed() },
    { action: actions.cancelCheckout(), expected: perceptions.productCatalogIsDisplayed() },
  ]);
});
