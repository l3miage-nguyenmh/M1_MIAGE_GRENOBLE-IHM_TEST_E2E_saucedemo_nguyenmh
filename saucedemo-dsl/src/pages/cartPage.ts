import { expect, type Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  async isDisplayed(): Promise<void> {
    await expect(this.page.getByTestId('title')).toHaveText('Your Cart');
  }

  async productNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allTextContents();
  }

  async contains(name: string): Promise<void> {
    await expect(this.page.getByTestId('inventory-item').filter({ hasText: name })).toBeVisible();
  }

  async doesNotContain(name: string): Promise<void> {
    await expect(this.page.getByTestId('inventory-item').filter({ hasText: name })).toHaveCount(0);
  }

  async remove(name: string): Promise<void> {
    const row = this.page.getByTestId('inventory-item').filter({ hasText: name });
    await row.getByRole('button', { name: 'Remove' }).click();
  }

  async itemCount(): Promise<number> {
    return this.page.getByTestId('inventory-item').count();
  }

  async cartBadgeCount(): Promise<number> {
    const badge = this.page.getByTestId('shopping-cart-badge');
    return await badge.isVisible() ? Number(await badge.innerText()) : 0;
  }

  async continueShopping(): Promise<void> {
    await this.page.getByTestId('continue-shopping').click();
  }

  async checkout(): Promise<void> {
    await this.page.getByTestId('checkout').click();
  }
}
