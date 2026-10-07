# Changelog

All notable changes to **OpenRouter Copilot Model Manager** are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [1.2.0]

**A redesigned Model Browser.** The panel was rebuilt from scratch. Every feature and the extension's message protocol stay the same; only the webview and the icons changed.

- **The panel follows your VS Code theme.** It now works in light themes too; before, it was always dark. Surfaces, text, borders and focus rings come from the active theme. High-contrast themes drop the gradients, glows and shadows and use the theme's contrast borders.
- **New model cards.** Each card has a provider monogram, labeled capability chips (Vision, Tools, Reasoning, Image out, Free) and a metric strip with input and output price per million tokens, context window and max output. Price dots, a context ring and a max-output bar let you compare models while scanning.
- **You can tell drafts from live models.** A model you picked shows **Selected**. A model that is already in Copilot shows a green **In Copilot** button, an **Active** pill and a dot on its monogram. Clicking **In Copilot** removes the model from Copilot and refreshes the Active tab and its count at once; before, the Active tab stayed out of date.
- **Table view in the editor panel.** At 900px and wider, a Cards / Table switch sits next to sort. The table has a sticky header, and you can sort it by model, input price or context from the header. The panel remembers your choice.
- **A brand header in the sidebar.** The panel opens with the logo and *OpenRouter Copilot Model Manager*, with the key and sync buttons beside it and the Browse / Active tabs below.
- **A single title for the sidebar.** The view header reads just *OpenRouter Copilot Model Manager* instead of *OpenRouter: Model Browser*. Its duplicate refresh button is gone; sync from the panel's own header or the `OpenRouter: Sync Models from API` command.
- **Search and filters stay on screen** while you scroll the list, so you can refine a search without scrolling back up.
- **Active tab:**
  - A summary at the top shows how many models are live in Copilot Chat.
  - **Thinking effort** shows a small gauge next to the menu, and says *always on* for models that always reason.
  - **Remove** is always visible.
  - In the editor panel, cards sit in two even columns.
- **The draft tray** is a floating bar at the bottom. It names the models waiting to be applied and keeps **Apply to Copilot** one click away.
- **More than 100 results:** a **Show more** button loads the rest; before, you had to refine the search.
- **Keyboard:**
  - Press `/` to focus search, and `Ctrl+Enter` (`⌘+Enter` on macOS) to apply drafts.
  - Arrow keys move between tabs and through the provider menu; `Escape` clears search or closes the menu.
  - Focus stays where it was after the list re-renders.
  - Every control has a visible focus ring and is at least 28px.
- **Works in a narrow sidebar.** Nothing clips or scrolls sideways at 300px, and four full cards fit at 300×900.
- **First run:** while no API key is set, the panel shows one **Set API key** action and hides the search and filters until there is a catalog.
- **Calmer feedback.** Add and remove toasts are a single short line, and a new toast replaces the previous one. Errors stay longer and are announced to screen readers.
- **Icons are inline SVG** instead of emoji, so they look the same on every platform. Animations are turned off when your system asks for reduced motion.
- **A new icon.** The Marketplace icon and a new matching activity-bar icon show a model card stack with a spark.

## [1.1.0]

- **Thinking effort in the Copilot model picker.** Reasoning models get a **Thinking Effort** submenu in Copilot Chat. The Active tab has a per-model default, and `openrouterModelManager.defaultReasoningEffort` sets a global fallback.

## [1.0.6]

- New setting `openrouterModelManager.maxInputTokensOverride` caps the context size reported to Copilot, so conversation compaction starts earlier.

## [1.0.5]

- New setting `openrouterModelManager.enableStreamUsage` turns off `stream_options.include_usage` for providers that reject it with `invalid_json`.

## [1.0.4]

- Long base64-like blobs are stripped from prompts before sending (`openrouterModelManager.sanitizeBase64Content`), so OpenRouter guardrails no longer block requests as prompt injection. Image attachments are not affected.

## [1.0.3]

- OpenRouter guardrail 403 errors are now reported accurately.

## [1.0.2]

- OpenRouter prompt caching (`openrouterModelManager.enablePromptCaching`) cuts input-token costs in agent mode.

## [1.0.1]

- Reasoning content is shown as native thinking in Copilot Chat when available, without requiring proposed APIs, so the extension installs from the Marketplace.

## [1.0.0]

- First release: a webview model browser for the OpenRouter catalog and a native Copilot Chat language-model provider.
