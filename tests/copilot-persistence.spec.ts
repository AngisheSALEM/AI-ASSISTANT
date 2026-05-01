import { test, expect } from '@playwright/test';

test.describe('Copilot Persistence and UI', () => {
  test('should render the copilot page and show header components', async ({ page }) => {
    // Go to the copilot page
    await page.goto('/copilot');

    // Check header
    await expect(page.getByText('Opere Copilot')).toBeVisible();
    await expect(page.getByText('Ouvrir le Centre de Contrôle')).toBeVisible();

    // Check progress bar
    await expect(page.getByText('Choix Agent')).toBeVisible();
    await expect(page.getByText('Prêt')).toBeVisible();

    // Check initial greeting
    await expect(page.getByText('Comment puis-je vous aider ?')).toBeVisible();
  });

  test('should handle localstorage persistence and show loading state', async ({ page }) => {
    // Mock the history API to return a simulated conversation
    await page.route('**/api/chat/history?conversationId=test-conv-id', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          messages: [
            { id: '1', role: 'user', content: 'Hello', createdAt: new Date() },
            {
              id: '2',
              role: 'assistant',
              content: 'Hi! Choose an agent.',
              uiType: 'AGENT_SELECTION',
              uiData: { status: 'success' },
              createdAt: new Date()
            }
          ]
        }),
      });
    });

    // Set localstorage
    await page.addInitScript(() => {
      window.localStorage.setItem('copilot_conversation_id', 'test-conv-id');
    });

    await page.goto('/copilot');

    // Check if the history messages are rendered
    await expect(page.getByText('Hi! Choose an agent.')).toBeVisible();

    // Check if the Agent Selection UI is rendered from persistence
    await expect(page.getByText('Support Client')).toBeVisible();
    await expect(page.getByText('Ventes')).toBeVisible();
  });
});
