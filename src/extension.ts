import * as vscode from 'vscode';
import { OpenRouterClient } from './api/openRouterClient';
import { ModelCache } from './cache/modelCache';
import { ModelBrowserProvider } from './views/webviewProvider';
import { OpenRouterChatProvider } from './provider/openRouterProvider';
import { SecretsManager } from './utils/secrets';
import { Logger } from './utils/logger';
import { FETCH_TOOL_NAME, FetchWebPageTool } from './tools/fetchWebPageTool';
import { CODEBASE_TOOL_NAME, CodebaseSearchTool } from './tools/codebaseSearchTool';
import { CodebaseIndex } from './codebase/codebaseIndex';
import { OpenRouterInlineCompletionProvider } from './inline/inlineCompletionProvider';
import { chooseUtilityModel, offerUtilityModel } from './features/utilityModels';
import { PROVIDER_VENDOR_ID } from './utils/utilityModel';

/** Flip a boolean setting globally and say what it does now. */
async function toggleSetting(key: string, on: string, off: string): Promise<void> {
  const config = vscode.workspace.getConfiguration('openrouterModelManager');
  const next = !config.get<boolean>(key, false);
  await config.update(key, next, vscode.ConfigurationTarget.Global);
  vscode.window.showInformationMessage(next ? on : off);
}

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

  // Copilot's fetch_webpage needs an active Copilot subscription; this one does not.
  context.subscriptions.push(
    vscode.lm.registerTool(FETCH_TOOL_NAME, new FetchWebPageTool())
  );

  // Semantic code search: Copilot's #codebase is not offered to BYOK models.
  const codebaseIndex = new CodebaseIndex(context.storageUri, () => secrets.getApiKey());
  context.subscriptions.push(
    vscode.lm.registerTool(CODEBASE_TOOL_NAME, new CodebaseSearchTool(codebaseIndex))
  );

  // Inline completions: Copilot's need a Copilot subscription. Off by default.
  context.subscriptions.push(
    vscode.languages.registerInlineCompletionItemProvider(
      { pattern: '**' },
      new OpenRouterInlineCompletionProvider(() => secrets.getApiKey(), cache)
    )
  );

  // The provider offers the utility model to Copilot, so changes must reach it.
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('openrouterModelManager.utilityModel')) {
        openRouterProvider.refresh();
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('openrouter-copilot.chooseUtilityModel', () =>
      chooseUtilityModel(cache, context.globalState)
    ),
    vscode.commands.registerCommand('openrouter-copilot.toggleWebSearch', () =>
      toggleSetting(
        'webSearch.enabled',
        'OpenRouter web search is on: models that call tools can search the web while answering (about $0.007 per search with the default engine, Exa).',
        'OpenRouter web search is off.'
      )
    ),
    vscode.commands.registerCommand('openrouter-copilot.toggleInlineCompletions', () =>
      toggleSetting(
        'inlineCompletions.enabled',
        'OpenRouter inline completions are on. Each suggestion is a paid request; pick the model with openrouterModelManager.inlineCompletions.model.',
        'OpenRouter inline completions are off.'
      )
    ),
    vscode.commands.registerCommand('openrouter-copilot.rebuildCodebaseIndex', async () => {
      try {
        await codebaseIndex.clear();
        const result = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: 'OpenRouter: indexing the workspace', cancellable: true },
          (progress, token) => {
            let last = 0;
            return codebaseIndex.update(token, (done, total) => {
              const percent = total ? Math.round((done / total) * 100) : 100;
              progress.report({ increment: percent - last, message: `${done} / ${total} chunks` });
              last = percent;
            }, true);
          }
        );
        vscode.window.showInformationMessage(
          `Indexed ${result.embeddedFiles} files for semantic search ($${result.cost.toFixed(4)}).`
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Indexing failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
    vscode.commands.registerCommand('openrouter-copilot.clearCodebaseIndex', async () => {
      await codebaseIndex.clear();
      vscode.window.showInformationMessage('Deleted the semantic search index of this workspace.');
    })
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
  cache.loadFromDisk().then(async (models) => {
    if (models.length > 0) {
      Logger.info(`Loaded ${models.length} cached models on startup`);
      openRouterProvider.refresh();
      await offerUtilityModel(cache, context.globalState, await secrets.hasApiKey());
    }
  });

  Logger.info('OpenRouter Copilot Model Manager activated ✅');
}

export function deactivate() {
  Logger.info('OpenRouter Copilot Model Manager deactivating...');
  Logger.info('OpenRouter Copilot Model Manager deactivated');
  Logger.dispose();
}