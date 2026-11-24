import { expect, type Page } from '@playwright/test';
import type { Perception } from '../dsl/types';
import { CartPage } from '../pages/cartPage';
import { CheckoutPage } from '../pages/checkoutPage';
import { InventoryPage } from '../pages/inventoryPage';
import { LoginPage } from '../pages/loginPage';
import type { ActionExecutor } from './actionExecutor';

export class PerceptionEvaluator {
  private readonly login: LoginPage;
  private readonly inventory: InventoryPage;
  private readonly cart: CartPage;
  private readonly checkout: CheckoutPage;

  constructor(private readonly page: Page, private readonly executor: ActionExecutor) {
    this.login = new LoginPage(page);
    this.inventory = new InventoryPage(page);
    this.cart = new CartPage(page);
    this.checkout = new CheckoutPage(page);
  }

  async evaluate(perception: Perception): Promise<void> {
    switch (perception.type) {
      case 'loginPageIsDisplayed':
        await this.login.isDisplayed();
        return;
      case 'customerIsAuthenticated':
        await this.inventory.isDisplayed();
        return;
      case 'authenticationFailed':
        await expect(this.page.getByTestId('error')).toBeVisible();
        if (perception.reason) await expect(this.page.getByTestId('error')).toContainText(perception.reason);
        return;
      case 'accountIsLocked':
        await expect(this.page.getByTestId('error')).toContainText('locked out');
        return;
      case 'sessionIsTerminated':
        await this.login.isDisplayed();
        return;
      case 'productCatalogIsDisplayed':
        await this.inventory.isDisplayed();
        return;
      case 'productIsDisplayed':
        await this.inventory.hasProduct(perception.product);
        return;
      case 'productsAreSortedBy': {
        const names = await this.inventory.productNames();
        const prices = await this.inventory.productPrices();
        const expected = names.map((name, index) => ({ name, price: prices[index] }));
        if (perception.criterion === 'name-asc') expected.sort((a, b) => a.name.localeCompare(b.name));
        if (perception.criterion === 'name-desc') expected.sort((a, b) => b.name.localeCompare(a.name));
        if (perception.criterion === 'price-asc') expected.sort((a, b) => a.price - b.price);
        if (perception.criterion === 'price-desc') expected.sort((a, b) => b.price - a.price);
        await expect(names).toEqual(expected.map((item) => item.name));
        return;
      }
      case 'productDetailsAreDisplayed':
        await expect(this.page.locator('.inventory_details_container')).toBeVisible();
        await expect(this.page.locator('.inventory_details_name')).toHaveText(perception.product);
        return;
      case 'productPriceIs': {
        if (this.page.url().includes('/inventory-item.html')) {
          await expect(this.page.locator('.inventory_details_price')).toHaveText(perception.price);
          return;
        }
        const product = this.page.getByTestId('inventory-item').filter({ hasText: perception.product });
        await expect(product.getByTestId('inventory-item-price')).toHaveText(perception.price);
        return;
      }
      case 'productIsInCart': {
        const cartRow = this.page.getByTestId('inventory-item').filter({ hasText: perception.product });
        if (this.page.url().endsWith('/cart.html')) await expect(cartRow).toBeVisible();
        else if (this.page.url().endsWith('/inventory.html')) await this.inventory.productIsSelected(perception.product, true);
        else await expect(this.page.getByRole('button', { name: 'Remove' })).toBeVisible();
        await expect(await this.inventory.cartBadgeCount()).toBe(this.executor.selectedProducts.size);
        return;
      }
      case 'productIsNotInCart': {
        const cartRow = this.page.getByTestId('inventory-item').filter({ hasText: perception.product });
        if (this.page.url().endsWith('/cart.html')) await expect(cartRow).toHaveCount(0);
        else if (this.page.url().endsWith('/inventory.html')) await this.inventory.productIsSelected(perception.product, false);
        else await expect(this.page.getByRole('button', { name: 'Add to cart' })).toBeVisible();
        return;
      }
      case 'cartIsDisplayed':
        await this.cart.isDisplayed();
        return;
      case 'cartContains': {
        await this.cart.isDisplayed();
        await expect(await this.cart.productNames()).toEqual(perception.products);
        return;
      }
      case 'cartDoesNotContain':
        await this.cart.doesNotContain(perception.product);
        return;
      case 'cartIsEmpty':
        await expect(await this.cart.itemCount()).toBe(0);
        await expect(await this.cart.cartBadgeCount()).toBe(0);
        return;
      case 'cartItemCountIs':
        await expect(await this.cart.itemCount()).toBe(perception.count);
        await expect(await this.cart.cartBadgeCount()).toBe(perception.count);
        return;
      case 'checkoutIsAvailable':
        await expect(this.page.getByTestId('checkout')).toBeEnabled();
        return;
      case 'checkoutInformationPageIsDisplayed':
        await this.checkout.informationIsDisplayed();
        return;
      case 'checkoutInformationIsAccepted':
        await this.checkout.overviewIsDisplayed();
        return;
      case 'checkoutInformationIsRejected':
        await expect(this.page.getByTestId('error')).toBeVisible();
        if (perception.reason) await expect(this.page.getByTestId('error')).toContainText(perception.reason);
        return;
      case 'requiredFieldErrorIsDisplayed': {
        const error = this.page.getByTestId('error');
        await expect(error).toBeVisible();
        const labels: Record<string, string> = { firstName: 'First Name', lastName: 'Last Name', postalCode: 'Postal Code' };
        for (const field of perception.fields) await expect(error).toContainText(labels[field] ?? field);
        return;
      }
      case 'orderOverviewIsDisplayed':
        await this.checkout.overviewIsDisplayed();
        return;
      case 'orderContains':
        await expect(await this.checkout.orderProductNames()).toEqual(perception.products);
        return;
      case 'orderItemTotalIs':
        await this.assertAmount('subtotal', perception.amount);
        return;
      case 'orderTaxIs':
        await this.assertAmount('tax', perception.amount);
        return;
      case 'orderTotalIs':
        await this.assertAmount('total', perception.amount);
        return;
      case 'orderCalculationIsCorrect': {
        const subtotal = await this.checkout.summaryAmount('subtotal');
        const tax = await this.checkout.summaryAmount('tax');
        const total = await this.checkout.summaryAmount('total');
        expect(subtotal + tax).toBeCloseTo(total, 2);
        return;
      }
      case 'orderInformationIsConsistent':
        await expect(await this.checkout.orderProductNames()).toEqual([...this.executor.selectedProducts]);
        return;
      case 'orderPaymentAndShippingInformationIsDisplayed':
        await expect(this.page.getByTestId('payment-info-label')).toBeVisible();
        await expect(this.page.getByTestId('payment-info-value')).toBeVisible();
        await expect(this.page.getByTestId('shipping-info-label')).toBeVisible();
        await expect(this.page.getByTestId('shipping-info-value')).toBeVisible();
        return;
      case 'orderConfirmationIsDisplayed':
        await this.checkout.confirmationIsDisplayed();
        return;
      case 'purchaseIsCompleted':
        await this.checkout.confirmationIsDisplayed();
        await expect(this.page.getByTestId('complete-header')).toBeVisible();
        return;
      case 'orderSuccessMessageIsDisplayed':
        await expect(await this.checkout.successMessage()).toBe('Thank you for your order!');
        return;
      case 'navigationMenuIsDisplayed':
        await expect(this.page.getByTestId('logout-sidebar-link')).toBeVisible();
        return;
      case 'shoppingStateIsReset': {
        await expect(await this.inventory.cartBadgeCount()).toBe(0);
        const names = await this.inventory.productNames();
        for (const name of names) await this.inventory.productIsSelected(name, false);
        return;
      }
      case 'protectedContentIsUnavailable':
        await this.login.isDisplayed();
        await expect(this.page.getByTestId('inventory-list')).toHaveCount(0);
        return;
      default: {
        const exhaustiveCheck: never = perception;
        throw new Error(`Unsupported perception: ${JSON.stringify(exhaustiveCheck)}`);
      }
    }
  }

  private async assertAmount(label: 'subtotal' | 'tax' | 'total', expected?: number): Promise<void> {
    const actual = await this.checkout.summaryAmount(label);
    if (expected !== undefined) expect(actual).toBeCloseTo(expected, 2);
    else expect(actual).toBeGreaterThanOrEqual(0);
  }
}
