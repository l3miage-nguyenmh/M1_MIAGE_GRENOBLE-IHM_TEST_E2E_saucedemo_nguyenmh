import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.getByTestId('username').fill(username);
    await this.page.getByTestId('password').fill(password);
    await this.page.getByTestId('login-button').click();
  }

  async isDisplayed(): Promise<void> {
    await expect(this.page.getByTestId('login-button')).toBeVisible();
  }

  async errorText(): Promise<string> {
    return (await this.page.getByTestId('error').innerText()).trim();
  }
}
