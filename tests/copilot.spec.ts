import { test, expect } from '@playwright/test';

test('Copilot Page Components Rendering', async ({ page }) => {
  await page.goto('/copilot');
  await expect(page.getByText('Opere Copilot')).toBeVisible();
  const controlCenterBtn = page.getByRole('button', { name: 'Ouvrir le Centre de Contrôle' });
  await expect(controlCenterBtn).toBeVisible();
  await page.screenshot({ path: 'copilot-ok.png' });
});
