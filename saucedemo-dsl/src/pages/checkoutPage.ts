import { expect, type Page } from '@playwright/test';
import type { CheckoutInformation } from '../dsl/types';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async informationIsDisplayed(): Promise<void> {
    await expect(this.page.getByTestId('title')).toHaveText('Checkout: Your Information');
  }

  async provideInformation(information: CheckoutInformation): Promise<void> {
    await this.page.getByTestId('firstName').fill(information.firstName);
    await this.page.getByTestId('lastName').fill(information.lastName);
    await this.page.getByTestId('postalCode').fill(information.postalCode);
  }

  async submitInformation(): Promise<void> {
    await this.page.getByTestId('continue').click();
  }

  async cancel(): Promise<void> {
    await this.page.getByTestId('cancel').click();
  }

  async errorText(): Promise<string> {
    return (await this.page.getByTestId('error').innerText()).trim();
  }

  async overviewIsDisplayed(): Promise<void> {
    await expect(this.page.getByTestId('title')).toHaveText('Checkout: Overview');
  }

  async orderProductNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allTextContents();
  }

  async summaryAmount(label: 'subtotal' | 'tax' | 'total'): Promise<number> {
    const testId = { subtotal: 'subtotal-label', tax: 'tax-label', total: 'total-label' }[label];
    const text = await this.page.getByTestId(testId).innerText();
    const amount = text.match(/\$([\d.]+)/)?.[1];
    if (!amount) throw new Error(`Could not read the ${label} amount from: ${text}`);
    return Number(amount);
  }

  async finish(): Promise<void> {
    await this.page.getByTestId('finish').click();
  }

  async confirmationIsDisplayed(): Promise<void> {
    await expect(this.page.getByTestId('title')).toHaveText('Checkout: Complete!');
  }

  async successMessage(): Promise<string> {
    return (await this.page.getByTestId('complete-header').innerText()).trim();
  }

  async backHome(): Promise<void> {
    await this.page.getByTestId('back-to-products').click();
  }
}
