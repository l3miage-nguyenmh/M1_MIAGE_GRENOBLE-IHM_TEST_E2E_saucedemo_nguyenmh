import { expect, type Locator, type Page } from '@playwright/test';
import type { SortCriterion } from '../dsl/types';

export class InventoryPage {
  constructor(private readonly page: Page) {}

  async isDisplayed(): Promise<void> {
    await expect(this.page.getByTestId('title')).toHaveText('Products');
    await expect(this.page.getByTestId('inventory-list')).toBeVisible();
  }

  async productNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allTextContents();
  }

  async hasProduct(name: string): Promise<void> {
    const card = this.productCard(name);
    await expect(card).toBeVisible();
    await expect(card.getByTestId('inventory-item-name')).toBeVisible();
    await expect(card.getByTestId('inventory-item-desc')).toBeVisible();
    await expect(card.getByTestId('inventory-item-price')).toBeVisible();
    await expect(card.locator('img')).toBeVisible();
  }

  async openProduct(name: string): Promise<void> {
    await this.productCard(name).getByTestId('inventory-item-name').click();
  }

  async addProduct(name: string): Promise<void> {
    await this.productCard(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeProduct(name: string): Promise<void> {
    await this.productCard(name).getByRole('button', { name: 'Remove' }).click();
  }

  async productIsSelected(name: string, selected: boolean): Promise<void> {
    const button = this.productCard(name).locator('button[data-test^="add-to-cart-"], button[data-test^="remove-"]');
    await expect(button).toHaveText(selected ? 'Remove' : 'Add to cart');
  }

  async sortBy(criterion: SortCriterion): Promise<void> {
    const option: Record<SortCriterion, string> = {
      'name-asc': 'az',
      'name-desc': 'za',
      'price-asc': 'lohi',
      'price-desc': 'hilo',
    };
    await this.page.getByTestId('product-sort-container').selectOption(option[criterion]);
  }

  async productPrices(): Promise<number[]> {
    const values = await this.page.getByTestId('inventory-item-price').allTextContents();
    return values.map((value) => Number(value.replace('$', '')));
  }

  async openMenu(): Promise<void> {
    await this.page.getByRole('button', { name: 'Open Menu' }).click();
  }

  async logout(): Promise<void> {
    const logoutLink = this.page.getByTestId('logout-sidebar-link');
    if (!(await logoutLink.isVisible())) await this.openMenu();
    await expect(logoutLink).toBeVisible();
    await logoutLink.click();
  }

  async resetState(): Promise<void> {
    await this.openMenu();
    await this.page.getByTestId('reset-sidebar-link').click();
    await this.page.reload();
    await this.isDisplayed();
  }

  async openAbout(): Promise<void> {
    await this.openMenu();
    await this.page.getByTestId('about-sidebar-link').click();
  }

  async cartBadgeCount(): Promise<number> {
    const badge = this.page.getByTestId('shopping-cart-badge');
    return await badge.isVisible() ? Number(await badge.innerText()) : 0;
  }

  async goToCart(): Promise<void> {
    await this.page.getByTestId('shopping-cart-link').click();
  }

  private productCard(name: string): Locator {
    return this.page.getByTestId('inventory-item').filter({ hasText: name });
  }
}
