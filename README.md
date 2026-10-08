<p align="center">
  <img src="resources/icon.png" width="112" alt="OpenRouter Copilot Model Manager" />
</p>

<h1 align="center">OpenRouter Copilot Model Manager</h1>

<p align="center">
  <b>Browse 400+ <a href="https://openrouter.ai">OpenRouter</a> models and put the ones you want into GitHub Copilot Chat.</b><br/>
  Compare price, context and capabilities, pick a few, and apply them to the Copilot model picker in one click.
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=husamettinulutas.openrouter-copilot-model-manager"><img src="https://vsmarketplacebadges.dev/version-short/husamettinulutas.openrouter-copilot-model-manager.svg?color=7E55F0&label=marketplace" alt="Marketplace version" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=husamettinulutas.openrouter-copilot-model-manager"><img src="https://vsmarketplacebadges.dev/installs-short/husamettinulutas.openrouter-copilot-model-manager.svg?color=3FB950&label=installs" alt="Installs" /></a>
  <a href="https://code.visualstudio.com/"><img src="https://img.shields.io/badge/VS%20Code-%5E1.104-00BBD5" alt="VS Code 1.104+" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-BC8CFF" alt="MIT license" /></a>
</p>

<p align="center">
  <img src="media/browse.png" width="820" alt="The model browser in an editor tab: a sortable table with capability chips, input and output price per million tokens, context ring and max output, two drafts waiting in the tray and three models marked Active" />
</p>

---

## What it does

- **Browse the whole OpenRouter catalog.** Search by name, provider or ID, filter by **Vision**, **Tools**, **Free** and **Reasoning**, pick a provider, and sort by name, price, context or release date.
- **Compare at a glance.** Every model shows its capabilities, input and output price per million tokens, context window and max output, with small meters so you can compare while scanning. In an editor tab the list becomes a sortable table.
- **Add to Copilot in one click.** Select models, then press **Apply to Copilot**. They appear in the Copilot Chat model picker under **OpenRouter**, with no reload and no config file.
- **Manage what is live.** The **Active** tab lists every model in Copilot. Remove one, or set its default **Thinking effort**.
- **Full agent mode in Copilot Chat.** Tool calling, vision input, streamed reasoning, prompt caching, retries with backoff, and token usage and cost in the status bar.
- **Web fetch that does not need a Copilot subscription.** Agent mode gets a **Fetch Web Page (OpenRouter)** tool (`#openrouterFetch`) that reads a page and hands its text to the model. Copilot's own fetch tool fails once a Copilot subscription has lapsed; this one does not.
- **See which model answered.** With a router such as `openrouter/auto`, the status bar names the model that actually answered and its provider.
- **Fits anywhere.** The panel follows your VS Code theme (light, dark or high contrast) and works from a narrow sidebar up to a full editor tab.

## Install

Search **OpenRouter Copilot Model Manager** in the VS Code Extensions view, or install a `.vsix`:

```bash
code --install-extension openrouter-copilot-model-manager-1.2.2.vsix
```

Requires VS Code **1.104+** and GitHub Copilot Chat.

## Quick start

1. Open the **OpenRouter Copilot Model Manager** icon in the activity bar.
2. Click the **key** icon and paste your OpenRouter API key. Get one at [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys). It is stored in VS Code **SecretStorage**, never in a file.
3. The catalog loads on its own; click the **sync** icon to refresh it.
4. Find models: press `/` to search, use the filter chips, the provider menu and sort.
5. Press **Select** on the models you want. They wait in the tray at the bottom of the panel.
6. Press **Apply to Copilot** (or `Ctrl+Enter`). Your models are now in the Copilot Chat model picker.

A model that is already in Copilot shows a green **In Copilot** button and an **Active** pill, so you never add it twice. Clicking **In Copilot** removes it again.

### Active in Copilot

<p align="center">
  <img src="media/active.png" width="820" alt="The Active tab in an editor tab: four models live in Copilot Chat, each with a Remove button, a thinking-effort menu and its price, context and max output" />
</p>

Reasoning models get a **Thinking Effort** submenu in the Copilot model picker, so you can set the reasoning depth per request. The Active tab sets the default for each model, and `openrouterModelManager.defaultReasoningEffort` sets a global fallback.

### Light theme, narrow sidebar

<p align="center">
  <img src="media/light.png" width="380" alt="Browsing models in a light VS Code theme in a 400px sidebar: search, filter chips, provider and sort menus, and model cards with price and context meters" />
  &nbsp;
  <img src="media/light-active.png" width="380" alt="The Active tab in a light VS Code theme in a 400px sidebar" />
</p>

### Keyboard

| Key | Action |
| --- | --- |
| `/` | Focus search |
| `Escape` | Clear search, or close the provider menu |
| `Ctrl+Enter` / `⌘+Enter` | Apply drafts to Copilot |
| `←` `→` | Switch between Browse and Active |
| `↑` `↓` | Move through the provider menu |

## Commands

| Command | Description |
| --- | --- |
| `OpenRouter: Browse Models` | Open the model browser in an editor tab |
| `OpenRouter: Set API Key` | Set or update your OpenRouter API key |
| `OpenRouter: Sync Models from API` | Fetch the latest model catalog |

## Settings

All settings are under `openrouterModelManager.*`:

| Setting | Default | Description |
| --- | --- | --- |
| `cache.ttlMinutes` | `60` | Minutes before the model cache is refreshed |
| `requestTimeoutSeconds` | `60` | Request timeout in seconds |
| `maxRetries` | `3` | Retries for rate limits and server errors |
| `defaultTemperature` | *(model default)* | Temperature from 0.0 to 2.0 |
| `defaultMaxTokens` | *(model default)* | Maximum output tokens |
| `defaultReasoningEffort` | *(model default)* | Thinking effort when Copilot has not set one: `none`, `minimal`, `low`, `medium`, `high`, `xhigh` or `max` |
| `maxInputTokensOverride` | *(auto)* | Caps the context size reported to Copilot, so compaction starts earlier |
| `apiEndpoint` | `https://openrouter.ai/api/v1` | Custom API endpoint or proxy |
| `enablePromptCaching` | `true` | OpenRouter prompt caching; cuts input-token costs in agent mode |
| `enableStreamUsage` | `true` | Request token usage while streaming; turn off if a provider answers `invalid_json` |
| `sanitizeBase64Content` | `true` | Strip long base64 blobs from prompts so guardrails do not block them; images are not affected |
| `logLevel` | `info` | Output-channel verbosity: `debug`, `info`, `warn` or `error` |

## Supported capabilities

| Capability | Status |
| --- | --- |
| Chat (text to text) | ✅ |
| Tool calling (agent mode) | ✅ |
| Web fetch without a Copilot subscription | ✅ |
| Vision / image input | ✅ |
| Thinking / reasoning display | ✅ |
| Thinking effort picker | ✅ |
| Streaming | ✅ |
| Retry with backoff | ✅ |
| Usage statistics | ✅ |

## Development

```bash
npm install
npm run watch      # esbuild in watch mode, then press F5 for an Extension Development Host
npm test           # unit tests
npm run build      # production bundle
npm run package    # build a .vsix
```

## Credits

The Copilot model-picker **Thinking Effort** integration was adapted from [@Irvingouj](https://github.com/Irvingouj)'s fork ([`c2dc1de`](https://github.com/Irvingouj/openrouter-copilot-model-manager/commit/c2dc1de61a44ee6504f9c3d2de21b81f3cc1cbc6)), with the model-id heuristic removed and without enabling proposed APIs, so this build stays installable from the Marketplace on stable VS Code.

## License

MIT. See [LICENSE](LICENSE).
