# ⚡ OpenRouter Copilot Model Manager

Browse, filter, and add [OpenRouter](https://openrouter.ai) models to **VS Code Copilot Chat** with a rich visual interface.

## ✨ Features

- 🔍 **Browse 400+ Models** — Search and filter OpenRouter's entire model catalog
- 👁️ **Capability Filtering** — Filter by Vision, Tool Calling (Function Call), Free models
- 💰 **Pricing Display** — See input/output costs per million tokens
- 📊 **Context & Output Info** — View context window and max output token limits
- 🚀 **Native Copilot Integration** — Models register directly as a VS Code `LanguageModelChatProvider` — no external config files needed
- 🔧 **Full Agentic Mode** — Tool calling, terminal access, file operations, and web search through Copilot Chat
- 💭 **Thinking/Reasoning Display** — See model reasoning (Claude, DeepSeek-R1, Qwen3, etc.)
- 🔄 **Auto Retry with Backoff** — Graceful handling of rate limits (429) and server errors
- ⏱️ **Configurable Timeout** — Prevent hanging requests with customizable timeouts
- 📈 **Usage Stats** — Token usage displayed in the status bar after each request
- 🔑 **Secure API Key Storage** — Keys stored in VS Code's SecretStorage
- ⚙️ **Rich Settings** — Temperature, max tokens, timeout, retries, custom API endpoint, and more

## 🚀 Quick Start

1. **Install the extension** (`.vsix` file)
2. Open Command Palette → `OpenRouter: Set API Key`
3. Open Command Palette → `OpenRouter: Browse Models`
4. Browse, filter, and add models
5. Click **"Apply to Copilot"**
6. Your models now appear in Copilot Chat model picker! 🎉

## 📦 Install from VSIX

```bash
code --install-extension openrouter-copilot-model-manager-1.0.3.vsix
```

Or: VS Code → Extensions → `...` menu → **Install from VSIX...**

## 🔧 Commands

| Command | Description |
|---------|-------------|
| `OpenRouter: Browse Models` | Open the Model Browser panel |
| `OpenRouter: Set API Key` | Set/update your OpenRouter API key |
| `OpenRouter: Sync Models from API` | Manually fetch latest models |

## ⚙️ Settings

All settings are under `openrouterModelManager.*` in VS Code Settings:

| Setting | Default | Description |
|---------|---------|-------------|
| `cache.ttlMinutes` | `60` | Cache TTL in minutes before auto-refresh |
| `requestTimeoutSeconds` | `60` | Request timeout in seconds |
| `maxRetries` | `3` | Max retry attempts for failed requests |
| `defaultTemperature` | `null` | Default temperature (0.0–2.0), empty = model default |
| `defaultMaxTokens` | `null` | Default max output tokens, empty = model default |
| `apiEndpoint` | `https://openrouter.ai/api/v1` | Custom API endpoint URL |
| `logLevel` | `info` | Log level: debug, info, warn, error |

## 🧠 Supported Capabilities

| Capability | Status |
|------------|--------|
| Chat (text-to-text) | ✅ |
| Tool Calling (Function Call) | ✅ |
| Vision / Image Input | ✅ |
| Thinking/Reasoning | ✅ |
| System Messages | ✅ |
| Streaming | ✅ |
| Retry with Backoff | ✅ |
| Usage Statistics | ✅ |

## 📄 License

MIT
