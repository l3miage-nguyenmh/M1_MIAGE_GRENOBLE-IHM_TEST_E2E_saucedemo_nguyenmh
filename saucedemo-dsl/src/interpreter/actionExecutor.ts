import type { Page } from '@playwright/test';
import type { Action } from '../dsl/types';
import { CartPage } from '../pages/cartPage';
import { CheckoutPage } from '../pages/checkoutPage';
import { InventoryPage } from '../pages/inventoryPage';
import { LoginPage } from '../pages/loginPage';

export class ActionExecutor {
  readonly selectedProducts = new Set<string>();
  private readonly login: LoginPage;
  private readonly inventory: InventoryPage;
  private readonly cart: CartPage;
  private readonly checkout: CheckoutPage;

  constructor(private readonly page: Page) {
    this.login = new LoginPage(page);
    this.inventory = new InventoryPage(page);
    this.cart = new CartPage(page);
    this.checkout = new CheckoutPage(page);
  }

  async execute(action: Action): Promise<void> {
    switch (action.type) {
      case 'openApplication':
        await this.login.open();
        return;
      case 'authenticateAs':
        await this.login.login(action.username, action.password);
        return;
      case 'openNavigationMenu':
        await this.inventory.openMenu();
        return;
      case 'logout':
        await this.inventory.logout();
        return;
      case 'browseProducts':
        if (!this.page.url().endsWith('/inventory.html')) await this.page.goto('/inventory.html');
        return;
      case 'sortProductsBy':
        await this.inventory.sortBy(action.criterion);
        return;
      case 'viewProductDetails':
        await this.inventory.openProduct(action.product);
        return;
      case 'addProductToCart':
        if (this.page.url().endsWith('/inventory.html')) await this.inventory.addProduct(action.product);
        else await this.page.getByRole('button', { name: 'Add to cart' }).click();
        this.selectedProducts.add(action.product);
        return;
      case 'removeProductFromCart':
        if (this.page.url().endsWith('/cart.html')) await this.cart.remove(action.product);
        else if (this.page.url().endsWith('/inventory.html')) await this.inventory.removeProduct(action.product);
        else await this.page.getByRole('button', { name: 'Remove' }).click();
        this.selectedProducts.delete(action.product);
        return;
      case 'reviewCart':
        await this.inventory.goToCart();
        return;
      case 'continueShopping':
        await this.cart.continueShopping();
        return;
      case 'startCheckout':
        await this.cart.checkout();
        return;
      case 'provideCheckoutInformation':
        await this.checkout.provideInformation(action.information);
        return;
      case 'submitCheckoutInformation':
        await this.checkout.submitInformation();
        return;
      case 'cancelCheckout':
        await this.checkout.cancel();
        return;
      case 'reviewOrder':
        await this.checkout.overviewIsDisplayed();
        return;
      case 'completePurchase':
        await this.checkout.finish();
        return;
      case 'returnToShopping':
        if (this.page.url().endsWith('/checkout-complete.html')) await this.checkout.backHome();
        else if (this.page.url().endsWith('/cart.html')) await this.cart.continueShopping();
        else await this.page.goto('/inventory.html');
        return;
      case 'resetShoppingState':
        await this.inventory.resetState();
        this.selectedProducts.clear();
        return;
      case 'openAboutInformation':
        await this.inventory.openAbout();
        return;
      default: {
        const exhaustiveCheck: never = action;
        throw new Error(`Unsupported action: ${JSON.stringify(exhaustiveCheck)}`);
      }
    }
  }
}
