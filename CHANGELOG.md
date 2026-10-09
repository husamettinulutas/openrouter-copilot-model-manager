# Changelog

All notable changes to **OpenRouter Copilot Model Manager** are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [1.3.1]

- **Web fetch works while you are signed in without a Copilot plan.** Models often picked Copilot's own `fetch_webpage` tool, which fails with *"Your subscription has ended"* for a signed-in account whose plan has lapsed, so signing out of GitHub was the only fix. When **Fetch Web Page (OpenRouter)** is available, Copilot's fetch tool is now left out of requests to OpenRouter models. Turn this off with `openrouterModelManager.replaceCopilotFetch`.
- **The utility model offer appears once.** It used to come back in every window and every new project until you clicked **Don't ask again**, because a notification closed or left unanswered did not count. It is now shown once per install, and only once you use OpenRouter models in Copilot. **OpenRouter: Choose Utility Model for Copilot** sets it any time.

## [1.3.0]

**Use Copilot without a Copilot subscription.** Several Copilot features call GitHub's own services and fail, or are missing, without a paid plan. The extension now provides each of them through OpenRouter. The README has a table of what is covered.

- **Web search.** Run **OpenRouter: Toggle Web Search** and models that call tools can search the web while answering, through OpenRouter's web search. The pages the answer used are listed under it. It uses Exa by default (about $0.007 per search), which returned current results in our tests; Parallel costs about $0.001 but its results can be months old. If a provider refuses web search, the request goes through without it.
- **Semantic code search.** A **Codebase Search (OpenRouter)** tool (`#openrouterCodebase`) finds code by meaning, which Copilot's `#codebase` no longer offers to OpenRouter models. The first search asks before indexing the workspace with OpenRouter embeddings; the index stays on your machine, and later searches only embed files that changed. `.env`, key files, binaries and build output are never sent.
- **Chat titles, commit messages and edit repair.** **OpenRouter: Choose Utility Model for Copilot** points Copilot's utility models at a small OpenRouter model (Gemini 3.1 Flash Lite is suggested). Without one, these fail when you have no Copilot plan. The extension offers this once; it never replaces a utility model you set yourself without asking.
- **Inline suggestions.** **OpenRouter: Toggle Inline Completions** turns on ghost-text suggestions from an OpenRouter model (Codestral by default, about a second per suggestion). Off by default: every suggestion is a paid request.
- **API key from the environment.** When no key is stored, the extension uses `OPENROUTER_API_KEY`.

## [1.2.2]

- **Web fetch without a Copilot subscription.** Copilot's built-in `fetch_webpage` tool sends page text to GitHub's servers to pick the relevant parts, so it fails with *"Your subscription has ended"* when your Copilot subscription has lapsed, whichever model you use. The extension now adds its own **Fetch Web Page (OpenRouter)** tool to agent mode. It downloads the page itself, turns it into readable text with headings, lists, links and code blocks, and returns long pages in parts. VS Code asks before each fetch, and you can allow a site for the session or always. Models are told to prefer it; you can also name it with `#openrouterFetch`.

## [1.2.1]

- **See which model answered.** When you use a router such as `openrouter/auto`, the status bar now names the model that actually answered, for example `· claude-4-sonnet-20250522`. Its tooltip lists the requested model, the model that answered and the upstream provider, and the **OpenRouter** output channel logs them for every request.
- **The cost in the status bar is what OpenRouter billed.** When OpenRouter reports the request's cost, the status bar shows that figure. Otherwise it prices the tokens with the model that answered, not with the router.
- **Routers show "Varies" instead of a broken price.** OpenRouter lists routers with a price of `-1`, which the panel showed as a large negative number and counted in price sorting. Their price now reads **Varies**, and they sort last by price.
- **Tool results reach the model intact.** Text, JSON and structured (prompt-tsx) output that Copilot tools return is sent to the model as text; before, structured output could arrive as `[object Object]`. Images a tool returns are now forwarded to models that accept images, and models that do not are told the images were left out.

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
