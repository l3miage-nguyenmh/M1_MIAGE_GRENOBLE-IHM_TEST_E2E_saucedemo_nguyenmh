import { test } from '@playwright/test';
import { actions } from '../dsl/actions';
import { perceptions } from '../dsl/perceptions';
import { runScenario } from '../interpreter/scenarioRunner';
import { authenticatedSteps, products } from './testData';

test('TC05 / E2E05 — removing an item synchronizes cart and order contents', async ({ page }) => {
  await runScenario(page, [
    ...authenticatedSteps(),
    { action: actions.browseProducts(), expected: perceptions.productCatalogIsDisplayed() },
    { action: actions.addProductToCart(products.backpack), expected: perceptions.productIsInCart(products.backpack) },
    { action: actions.addProductToCart(products.bikeLight), expected: perceptions.productIsInCart(products.bikeLight) },
    { action: actions.addProductToCart(products.boltTShirt), expected: perceptions.productIsInCart(products.boltTShirt) },
    {
      action: actions.reviewCart(),
      expected: [
        perceptions.cartContains(products.backpack, products.bikeLight, products.boltTShirt),
        perceptions.cartItemCountIs(3),
      ],
    },
    {
      action: actions.removeProductFromCart(products.bikeLight),
      expected: [perceptions.cartDoesNotContain(products.bikeLight), perceptions.cartItemCountIs(2)],
    },
    { action: actions.startCheckout(), expected: perceptions.checkoutInformationPageIsDisplayed() },
    { action: actions.provideCheckoutInformation({ firstName: 'Ada', lastName: 'Lovelace', postalCode: '10001' }), expected: perceptions.checkoutInformationPageIsDisplayed() },
    {
      action: actions.submitCheckoutInformation(),
      expected: [
        perceptions.checkoutInformationIsAccepted(),
        perceptions.orderContains(products.backpack, products.boltTShirt),
        perceptions.orderInformationIsConsistent(),
      ],
    },
  ]);
});

test('TC08 — sorting, product inspection, and application-state reset', async ({ page }) => {
  await runScenario(page, [
    ...authenticatedSteps(),
    { action: actions.browseProducts(), expected: perceptions.productIsDisplayed(products.backpack) },
    { action: actions.sortProductsBy('price-asc'), expected: perceptions.productsAreSortedBy('price-asc') },
    { action: actions.sortProductsBy('name-asc'), expected: perceptions.productsAreSortedBy('name-asc') },
    { action: actions.sortProductsBy('name-desc'), expected: perceptions.productsAreSortedBy('name-desc') },
    { action: actions.sortProductsBy('price-desc'), expected: perceptions.productsAreSortedBy('price-desc') },
    { action: actions.viewProductDetails(products.backpack), expected: [perceptions.productDetailsAreDisplayed(products.backpack), perceptions.productPriceIs(products.backpack, '$29.99')] },
    { action: actions.addProductToCart(products.backpack), expected: perceptions.productIsInCart(products.backpack) },
    { action: actions.removeProductFromCart(products.backpack), expected: perceptions.productIsNotInCart(products.backpack) },
    { action: actions.addProductToCart(products.backpack), expected: perceptions.productIsInCart(products.backpack) },
    { action: actions.returnToShopping(), expected: perceptions.productCatalogIsDisplayed() },
    { action: actions.resetShoppingState(), expected: perceptions.shoppingStateIsReset() },
  ]);
});

test('TC09 — empty cart and continue-shopping boundary', async ({ page }) => {
  await runScenario(page, [
    ...authenticatedSteps(),
    { action: actions.reviewCart(), expected: perceptions.cartIsEmpty() },
    { action: actions.continueShopping(), expected: perceptions.productCatalogIsDisplayed() },
  ]);
});
