import * as vscode from 'vscode';
import { OpenRouterClient } from './api/openRouterClient';
import { ModelCache } from './cache/modelCache';
import { ModelBrowserProvider } from './views/webviewProvider';
import { OpenRouterChatProvider } from './provider/openRouterProvider';
import { SecretsManager } from './utils/secrets';
import { Logger } from './utils/logger';

const PROVIDER_VENDOR_ID = 'openrouter-copilot-model-manager';

/**
 * Ensure `chat.byokUtilityModelDefault` is configured so Copilot can perform
 * utility tasks with the selected OpenRouter (BYOK) model. Only sets the value
 * when the user has not explicitly configured it, to respect user choice.
 */
async function ensureByokUtilityDefault(): Promise<void> {
  try {
    const config = vscode.workspace.getConfiguration();
    const inspected = config.inspect<string>('chat.byokUtilityModelDefault');
    const alreadySet =
      inspected?.globalValue !== undefined ||
      inspected?.workspaceValue !== undefined ||
      inspected?.workspaceFolderValue !== undefined;

    if (!alreadySet) {
      await config.update(
        'chat.byokUtilityModelDefault',
        'mainAgent',
        vscode.ConfigurationTarget.Global
      );
      Logger.info("Set 'chat.byokUtilityModelDefault' to 'mainAgent'");
    }
  } catch (error) {
    Logger.warn('Failed to set chat.byokUtilityModelDefault', error);
  }
}


/**
 * Extension activation point.
 * Registers native VS Code LanguageModelChatProvider for OpenRouter and Webview Provider.
 */
export function activate(context: vscode.ExtensionContext) {
  Logger.init();
  Logger.info('OpenRouter Copilot Model Manager activating...');

  // Ensure Copilot can use the BYOK (OpenRouter) model itself for utility tasks,
  // otherwise Copilot throws "No utility model is configured for 'copilot-utility-small'".
  ensureByokUtilityDefault();

  // Initialize services
  const secrets = new SecretsManager(context.secrets);
  const apiClient = new OpenRouterClient();
  const cache = new ModelCache(context.globalState);

  // Create native VS Code LanguageModelChatProvider for OpenRouter
  const openRouterProvider = new OpenRouterChatProvider(
    cache,
    secrets,
    context.globalState
  );

  // Register native provider with a dedicated vendor id to avoid conflicts
  // with VS Code's built-in BYOK OpenRouter provider.
  context.subscriptions.push(
    vscode.lm.registerLanguageModelChatProvider(PROVIDER_VENDOR_ID, openRouterProvider)
  );

  // Create status bar item for token usage stats
  const usageStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 50);
  usageStatusBar.name = 'OpenRouter Token Usage';
  usageStatusBar.tooltip = 'Token usage from last OpenRouter request';
  context.subscriptions.push(usageStatusBar);
  openRouterProvider.setUsageStatusBar(usageStatusBar);

  // Create the webview provider (passes openRouterProvider so UI updates refresh provider)
  const browserProvider = new ModelBrowserProvider(
    context.extensionUri,
    apiClient,
    cache,
    secrets,
    context.globalState,
    openRouterProvider
  );

  // Register sidebar webview provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ModelBrowserProvider.viewType,
      browserProvider
    )
  );

  // Command: Open Model Browser as full panel
  context.subscriptions.push(
    vscode.commands.registerCommand('openrouter-copilot.openBrowser', () => {
      browserProvider.openAsPanel();
    })
  );

  // Command: Set API Key
  context.subscriptions.push(
    vscode.commands.registerCommand('openrouter-copilot.setApiKey', async () => {
      const result = await secrets.promptForApiKey();
      if (result) {
        const key = await secrets.getApiKey();
        if (key) {
          apiClient.setApiKey(key);
        }
        openRouterProvider.refresh();
      }
    })
  );

  // Command: Manual Sync
  context.subscriptions.push(
    vscode.commands.registerCommand('openrouter-copilot.syncModels', async () => {
      try {
        const hasKey = await secrets.hasApiKey();
        if (hasKey) {
          const key = await secrets.getApiKey();
          apiClient.setApiKey(key!);
        }

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Syncing OpenRouter models...',
            cancellable: false,
          },
          async () => {
            const models = await apiClient.fetchModels();
            await cache.saveModels(models);
            openRouterProvider.refresh();
            vscode.window.showInformationMessage(
              `✅ Synced ${models.length} models from OpenRouter`
            );
          }
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    })
  );

  // Load cache on startup (silent, no network)
  cache.loadFromDisk().then((models) => {
    if (models.length > 0) {
      Logger.info(`Loaded ${models.length} cached models on startup`);
      openRouterProvider.refresh();
    }
  });

  Logger.info('OpenRouter Copilot Model Manager activated ✅');
}

export function deactivate() {
  Logger.info('OpenRouter Copilot Model Manager deactivating...');
  Logger.info('OpenRouter Copilot Model Manager deactivated');
  Logger.dispose();
}