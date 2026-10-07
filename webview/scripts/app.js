/**
 * OpenRouter Copilot Model Manager — Main Application ("Aurora Glass" UI)
 * Orchestrates UI rendering, user interaction, tabs, and extension communication.
 * The message protocol with the extension host is unchanged.
 */
(function() {
  'use strict';

  // ===== ICONS (inline SVG, 24px grid, 2px stroke) =====
  const ICON_PATHS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4.35-4.35"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    key: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    eye: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronUp: '<path d="m18 15-6-6-6 6"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    sort: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
    building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>',
    sparkle: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    cloud: '<path d="M12 13v8l-4-4"/><path d="m12 21 4-4"/><path d="M4.39 15.27A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.44 8.28"/>',
    searchX: '<path d="m13.5 8.5-5 5M8.5 8.5l5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    bulbOff: '<path d="M16.8 11.2c.8-.9 1.2-2 1.2-3.2a6 6 0 0 0-9.3-5"/><path d="m2 2 20 20"/><path d="M6.3 6.3a4.67 4.67 0 0 0 1.2 5.2c.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    list: '<path d="M3 6h.01M3 12h.01M3 18h.01"/><path d="M8 6h13M8 12h13M8 18h13"/>',
    pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  };
  function icon(name, size) {
    const s = size || 14;
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name] || ''}</svg>`;
  }
  function hydrateIcons(rootEl) {
    rootEl.querySelectorAll('.ico[data-icon]').forEach((el) => {
      if (!el.firstElementChild) el.innerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 14);
    });
  }

  // ===== STATE =====
  const RENDER_STEP = 100;
  let allModels = [];
  let selectedModelIds = new Set();
  let selectedModelsData = [];
  let activeCopilotModels = [];
  let hasApiKey = true;
  let apiKeyKnown = false;
  let isLoading = false;
  let activeTab = 'browse'; // 'browse' | 'active'
  let searchDebounceTimer = null;
  let renderLimit = RENDER_STEP;
  const expanded = new Set();
  let lastListSig = '';
  let lastActiveSig = '';
  let pendingApplyIds = [];
  let highlightIds = new Set();

  const persisted = (safe(() => vscodeApi.getState()) || {});
  let trayOpen = !!persisted.trayOpen;
  let viewMode = persisted.viewMode === 'cards' ? 'cards' : 'table'; // table only applies >= 900px
  const pendingLiveRemovals = new Set();
  const IS_MAC = /Mac|iPhone|iPad/i.test(navigator.platform || '');

  // ===== DOM REFS =====
  const $ = (sel) => document.querySelector(sel);

  const dom = {
    app:              $('#app'),
    tabs:             $('#tabs'),
    tabBrowse:        $('#tab-browse'),
    tabActive:        $('#tab-active'),
    tabContentBrowse: $('#tab-content-browse'),
    tabContentActive: $('#tab-content-active'),
    activeTabCount:   $('#active-tab-count'),
    activeModelsList: $('#active-models-list'),
    activeSummary:    $('#active-summary'),
    filters:          $('#filters'),
    search:           $('.search'),
    searchInput:      $('#search-input'),
    searchClear:      $('#search-clear'),
    filterVision:     $('#filter-vision'),
    filterTools:      $('#filter-tools'),
    filterFree:       $('#filter-free'),
    filterReasoning:  $('#filter-reasoning'),
    sortSelect:       $('#sort-select'),
    providerBtn:      $('#provider-filter-btn'),
    providerLabel:    $('#provider-label'),
    providerMenu:     $('#provider-menu'),
    statsCount:       $('#stats-count'),
    statsFiltered:    $('#stats-filtered'),
    statsClear:       $('#stats-clear'),
    modelList:        $('#model-list'),
    listHead:         $('#list-head'),
    viewCards:        $('#view-cards'),
    viewTable:        $('#view-table'),
    applyKbd:         $('#apply-kbd'),
    bottomPanel:      $('#bottom-panel'),
    bottomToggle:     $('#bottom-panel-toggle'),
    bottomBody:       $('#bottom-panel-body'),
    selectedList:     $('#selected-model-list'),
    selectedCount:    $('#selected-count'),
    trayTitle:        $('#tray-title'),
    trayNames:        $('#tray-names'),
    applyBtn:         $('#apply-btn'),
    syncBtn:          $('#sync-btn'),
    apiKeyBtn:        $('#apikey-btn'),
    apiKeyBanner:     $('#apikey-banner'),
    apiKeyBannerBtn:  $('#apikey-banner-btn'),
    loadingOverlay:   $('#loading-overlay'),
    toastContainer:   $('#toast-container'),
  };

  const CHIP_FILTERS = [
    { el: () => dom.filterVision, key: 'vision' },
    { el: () => dom.filterTools, key: 'toolCalling' },
    { el: () => dom.filterFree, key: 'free' },
    { el: () => dom.filterReasoning, key: 'reasoning' },
  ];

  // ===== INIT =====
  function init() {
    hydrateIcons(document);
    if (IS_MAC && dom.applyKbd) dom.applyKbd.textContent = '\u2318 \u21B5';
    bindEvents();
    applyViewMode();
    applyTrayState();
    renderSelectedModels();
    renderModels();
    renderActiveModels();
    observeTray();
    observeFilters();
    vscodeApi.onMessage(handleExtensionMessage);
    vscodeApi.postMessage({ type: 'ready' });
  }

  // ===== EVENT BINDING =====
  function bindEvents() {
    // Tabs (click + arrow keys, WAI-ARIA tabs pattern)
    dom.tabBrowse.addEventListener('click', () => switchTab('browse'));
    dom.tabActive.addEventListener('click', () => switchTab('active'));
    dom.tabs.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        const next = (e.key === 'ArrowRight' || e.key === 'End') ? 'active' : 'browse';
        switchTab(next);
        (next === 'active' ? dom.tabActive : dom.tabBrowse).focus();
      }
    });

    // Search
    dom.searchInput.addEventListener('input', () => {
      const val = dom.searchInput.value;
      syncSearchUi();
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        Filters.set('search', val);
        filtersChanged();
      }, 200);
    });
    dom.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.searchInput.value) {
        e.preventDefault();
        clearSearch();
      } else if (e.key === 'ArrowDown') {
        const first = dom.modelList.querySelector('.sel-btn');
        if (first) { e.preventDefault(); first.focus(); }
      }
    });
    dom.searchClear.addEventListener('click', () => {
      clearSearch();
      dom.searchInput.focus();
    });

    // Capability chips
    CHIP_FILTERS.forEach(({ el, key }) => {
      const btn = el();
      if (!btn) return;
      btn.addEventListener('click', () => {
        const next = Filters.toggle(key);
        setPressed(btn, !!next[key]);
        filtersChanged();
      });
    });

    // Sort
    dom.sortSelect.addEventListener('change', () => {
      Filters.set('sortBy', dom.sortSelect.value);
      filtersChanged();
    });

    // Provider dropdown
    dom.providerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleProviderMenu(!dom.providerMenu.classList.contains('open'));
    });
    dom.providerBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        toggleProviderMenu(true);
      }
    });
    dom.providerMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      const opt = e.target.closest('.provider-option');
      if (opt) pickProvider(opt.dataset.provider || '');
    });
    dom.providerMenu.addEventListener('keydown', (e) => {
      const opts = [...dom.providerMenu.querySelectorAll('.provider-option')];
      const i = opts.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (opts[i + 1] || opts[0]).focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (opts[i - 1] || opts[opts.length - 1]).focus(); }
      else if (e.key === 'Home') { e.preventDefault(); opts[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); opts[opts.length - 1].focus(); }
      else if (e.key === 'Escape' || e.key === 'Tab') {
        if (e.key === 'Escape') e.preventDefault();
        toggleProviderMenu(false);
        if (e.key === 'Escape') dom.providerBtn.focus();
      }
    });
    document.addEventListener('click', () => toggleProviderMenu(false));

    dom.statsClear.addEventListener('click', () => window.resetFilters());

    // Table header sort buttons drive the existing sort select
    dom.listHead.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sort]');
      if (!b) return;
      dom.sortSelect.value = b.dataset.sort;
      dom.sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Cards / Table layout (panel only)
    [dom.viewCards, dom.viewTable].forEach((b) => b.addEventListener('click', () => {
      viewMode = b.dataset.view;
      persist({ viewMode });
      applyViewMode();
      renderModels();
    }));

    // Model list (delegated)
    dom.modelList.addEventListener('click', (e) => {
      const t = e.target.closest('[data-action]');
      if (!t) return;
      const action = t.dataset.action;
      const modelId = t.dataset.modelId;
      if (action === 'toggle') {
        if (isLive(modelId)) {
          // Live in Copilot: the toggle removes it from Copilot (existing protocol message)
          pendingLiveRemovals.add(modelId);
          vscodeApi.postMessage({ type: 'removeActiveModel', modelId });
        } else if (selectedModelIds.has(modelId)) {
          vscodeApi.postMessage({ type: 'removeModel', modelId });
        } else {
          vscodeApi.postMessage({ type: 'addModel', modelId });
        }
      } else if (action === 'details') {
        const card = t.closest('.card');
        const desc = card && card.querySelector('.desc');
        if (!desc) return;
        const open = !desc.classList.contains('open');
        desc.classList.toggle('open', open);
        t.setAttribute('aria-expanded', String(open));
        if (open) expanded.add(modelId); else expanded.delete(modelId);
      } else if (action === 'more') {
        renderLimit += RENDER_STEP;
        renderModels({ keepFocusOn: RENDER_STEP });
      } else if (action === 'clear-filters') {
        window.resetFilters();
        dom.searchInput.focus();
      } else if (action === 'set-key') {
        vscodeApi.postMessage({ type: 'setApiKey' });
      } else if (action === 'sync') {
        vscodeApi.postMessage({ type: 'syncModels' });
      }
    });

    // Active list (delegated)
    dom.activeModelsList.addEventListener('click', (e) => {
      const t = e.target.closest('[data-action]');
      if (!t) return;
      if (t.dataset.action === 'remove-active') window.removeActiveModel(t.dataset.modelId);
      else if (t.dataset.action === 'go-browse') { switchTab('browse'); dom.searchInput.focus(); }
    });
    dom.activeModelsList.addEventListener('change', (e) => {
      if (e.target.classList.contains('effort-select')) window.setReasoningEffort(e.target);
    });

    // Draft tray
    dom.bottomToggle.addEventListener('click', () => {
      if (dom.bottomToggle.disabled) return;
      trayOpen = !trayOpen;
      applyTrayState();
      persist({ trayOpen });
    });
    dom.selectedList.addEventListener('click', (e) => {
      const t = e.target.closest('[data-action="remove-draft"]');
      if (!t) return;
      const next = t.closest('.draft-item');
      const sib = next && (next.nextElementSibling || next.previousElementSibling);
      const sibId = sib && sib.dataset.modelId;
      window.removeModel(t.dataset.modelId);
      // keep keyboard focus inside the tray after the list re-renders
      setTimeout(() => {
        const f = sibId && dom.selectedList.querySelector(`.draft-item[data-model-id="${cssEsc(sibId)}"] .draft-remove`);
        (f || dom.bottomToggle).focus();
      }, 60);
    });

    // Apply to Copilot
    dom.applyBtn.addEventListener('click', () => {
      pendingApplyIds = selectedModelsData.filter(m => !m.enabled).map(m => m.id);
      vscodeApi.postMessage({ type: 'applyToCopilot' });
    });

    // Sync
    dom.syncBtn.addEventListener('click', () => {
      vscodeApi.postMessage({ type: 'syncModels' });
    });

    // API Key buttons
    dom.apiKeyBtn.addEventListener('click', () => {
      vscodeApi.postMessage({ type: 'setApiKey' });
    });
    if (dom.apiKeyBannerBtn) {
      dom.apiKeyBannerBtn.addEventListener('click', () => {
        vscodeApi.postMessage({ type: 'setApiKey' });
      });
    }

    // Sticky filter header shadow once content scrolls under it
    dom.tabContentBrowse.addEventListener('scroll', () => {
      dom.filters.classList.toggle('is-stuck', dom.tabContentBrowse.scrollTop > 2);
    }, { passive: true });

    // Global shortcuts: "/" focuses search, Ctrl/Cmd+Enter applies drafts
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      const typing = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
      if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (activeTab !== 'browse') switchTab('browse');
        dom.searchInput.focus();
        dom.searchInput.select();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !dom.applyBtn.disabled) {
        e.preventDefault();
        dom.applyBtn.click();
      } else if (e.key === 'Escape' && dom.providerMenu.classList.contains('open')) {
        toggleProviderMenu(false);
        dom.providerBtn.focus();
      }
    });
  }

  function switchTab(tab) {
    activeTab = tab;
    const isBrowse = tab === 'browse';
    dom.tabBrowse.classList.toggle('active', isBrowse);
    dom.tabActive.classList.toggle('active', !isBrowse);
    dom.tabBrowse.setAttribute('aria-selected', String(isBrowse));
    dom.tabActive.setAttribute('aria-selected', String(!isBrowse));
    dom.tabBrowse.tabIndex = isBrowse ? 0 : -1;
    dom.tabActive.tabIndex = isBrowse ? -1 : 0;
    dom.tabContentBrowse.classList.toggle('active', isBrowse);
    dom.tabContentActive.classList.toggle('active', !isBrowse);
    dom.tabs.dataset.active = tab;
    if (!isBrowse) {
      toggleProviderMenu(false);
      renderActiveModels();
    }
  }

  // ===== EXTENSION MESSAGE HANDLER =====
  function handleExtensionMessage(msg) {
    switch (msg.type) {
      case 'modelsLoaded':
        allModels = msg.models;
        renderModels();
        renderProviderDropdown();
        renderActiveModels();
        renderSelectedModels();
        updateStats(msg.total);
        break;
      case 'selectedModelsUpdated':
        selectedModelsData = msg.models;
        selectedModelIds = new Set(msg.models.map(m => m.id));
        renderSelectedModels();
        renderModels();
        break;
      case 'activeModelsUpdated':
        activeCopilotModels = msg.models;
        dom.activeTabCount.textContent = msg.models.length;
        dom.tabActive.setAttribute('aria-label', `Active in Copilot, ${msg.models.length} models`);
        renderActiveModels();
        renderModels();
        break;
      case 'modelAdded':
        showToast('Added to draft', 'success', { compact: true });
        break;
      case 'modelRemoved':
        if (msg.modelId && pendingLiveRemovals.has(msg.modelId)) {
          pendingLiveRemovals.delete(msg.modelId);
          showToast('Removed from Copilot', 'info', { compact: true });
        } else {
          showToast('Removed from draft', 'info', { compact: true });
        }
        break;
      case 'appliedToCopilot':
        if (msg.success) {
          showToast(msg.message, 'success');
          highlightIds = new Set(pendingApplyIds);
          pendingApplyIds = [];
          // Switch to Active in Copilot tab to show applied models
          switchTab('active');
          setTimeout(() => { highlightIds = new Set(); }, 1700);
        } else {
          showToast(msg.message, 'error');
        }
        break;
      case 'error':
        showToast(msg.message, 'error');
        break;
      case 'loading':
        setLoading(msg.isLoading);
        break;
      case 'apiKeyStatus':
        hasApiKey = msg.hasKey;
        apiKeyKnown = true;
        updateApiKeyUI();
        renderModels();
        break;
      case 'syncComplete':
        if (msg.newModelsCount > 0) {
          showToast(`${msg.newModelsCount} new model(s) found!`, 'success');
        } else {
          showToast('Models synced, all up to date', 'info');
        }
        break;
    }
  }

  // ===== RENDERING: BROWSE =====
  function filtersChanged() {
    renderLimit = RENDER_STEP;
    renderModels();
    dom.tabContentBrowse.scrollTop = 0;
  }

  function renderModels(opts) {
    const filtered = Filters.apply(allModels);
    dom.statsFiltered.textContent = filtered.length;
    dom.statsCount.textContent = allModels.length;
    dom.statsClear.hidden = !hasActiveFilters();
    // No catalog yet: hide search/filter chrome so the empty state's single action leads
    dom.tabContentBrowse.classList.toggle('is-empty-catalog', allModels.length === 0);
    if (allModels.length === 0) dom.filters.classList.remove('is-stuck');
    dom.modelList.classList.toggle('has-rows', filtered.length > 0);
    dom.listHead.classList.toggle('has-rows', filtered.length > 0);
    updateSortHeader();

    let html;
    let sig;
    if (filtered.length === 0 && allModels.length === 0) {
      html = (isLoading || !apiKeyKnown) && hasApiKey ? renderSkeletons() : renderEmptyState();
      sig = 'empty:' + hasApiKey + isLoading;
    } else if (filtered.length === 0) {
      html = renderNoResults();
      sig = 'none';
    } else {
      const toRender = filtered.slice(0, renderLimit);
      sig = toRender.map(m => m.id).join('|');
      const animate = sig !== lastListSig && !(opts && opts.keepFocusOn);
      html = toRender.map((model, i) => renderModelCard(model, i, animate)).join('');
      if (filtered.length > toRender.length) {
        const remaining = filtered.length - toRender.length;
        const step = Math.min(RENDER_STEP, remaining);
        html += `
          <div class="more-row">
            <span>Showing <b class="num">${toRender.length}</b> of <b class="num">${filtered.length}</b> — refine your search or</span>
            <button class="btn" data-action="more">Show ${step} more <span class="num" style="opacity:.7">(${remaining} left)</span></button>
          </div>`;
      }
    }

    const focusKey = currentFocusKey(dom.modelList);
    dom.modelList.innerHTML = html;
    lastListSig = sig;
    if (focusKey) restoreFocus(dom.modelList, focusKey);
    if (opts && opts.keepFocusOn) {
      const cards = dom.modelList.querySelectorAll('.sel-btn');
      const target = cards[renderLimit - RENDER_STEP];
      if (target) target.focus();
    }
  }

  function renderModelCard(model, index, animate) {
    const live = isLive(model.id);
    const draft = !live && selectedModelIds.has(model.id);
    const isOpen = expanded.has(model.id);
    const name = escapeHtml(model.name);
    const id = escapeAttr(model.id);
    const enter = animate && index < 12 ? ` enter" style="--i:${index}` : '';

    const tags = capabilityTags(model.capabilities, model.isFree);
    const desc = model.description || '';
    const capsText = capabilityText(model.capabilities, model.isFree);
    const hasDetails = !!(desc || capsText);

    let toggle;
    if (live) {
      toggle = `<button class="sel-btn is-live" data-action="toggle" data-live="1" data-model-id="${id}" data-fk="sel:${id}"
            aria-label="Remove ${name} from Copilot" title="Live in Copilot. Click to remove">
            <span class="sel-ico">${icon('checkCircle', 14)}${icon('x', 14)}</span><span class="sel-label"><span class="l-on">In Copilot</span><span class="l-hover" aria-hidden="true">Remove</span></span>
          </button>`;
    } else {
      toggle = `<button class="sel-btn" data-action="toggle" data-model-id="${id}" data-fk="sel:${id}"
            aria-pressed="${draft}" aria-label="${draft ? 'Deselect' : 'Select'} ${name}"
            title="${draft ? 'Selected. Click to remove from draft' : 'Select for Copilot'}">
            ${icon(draft ? 'check' : 'plus', 14)}<span class="sel-label">${draft ? 'Selected' : 'Select'}</span>
          </button>`;
    }

    return `
      <article class="card${draft ? ' is-selected' : ''}${live ? ' is-live' : ''}${enter}" data-model-id="${id}" aria-label="${name}${live ? ', live in Copilot' : draft ? ', selected' : ''}">
        <div class="card-head">
          ${monoTile(model.provider, live)}
          <div class="card-title">
            <div class="card-name-row">
              <span class="card-name" title="${name}">${nameMarkup(model.name)}</span>
              ${live ? '<span class="live" title="Active in Copilot Chat">Active</span>' : ''}
            </div>
            <span class="card-id" title="${id}">${idMarkup(model)}</span>
          </div>
          ${toggle}
        </div>

        <div class="card-tags">
          <div class="tags">${tags}</div>
          ${hasDetails ? `<button class="details-btn" data-action="details" data-model-id="${id}" data-fk="det:${id}" aria-expanded="${isOpen}" aria-label="Details for ${name}" title="Details"><span class="details-label">Details</span>${icon('chevronDown', 12)}</button>` : ''}
        </div>

        ${metricStrip(model.isFree, model.pricing.promptPerMillion, model.pricing.completionPerMillion, model.contextLength, model.maxOutputTokens, hasVariablePrice(model))}

        ${hasDetails ? `
          <div class="desc${isOpen ? ' open' : ''}">
            <div class="desc-inner">
              ${desc ? `<p class="desc-text">${escapeHtml(desc)}</p>` : ''}
              ${capsText ? `<p class="desc-caps"><span class="desc-k">Capabilities:</span> ${capsText}</p>` : ''}
            </div>
          </div>` : ''}
      </article>
    `;
  }

  function capabilityText(caps, isFree) {
    const out = [];
    if (caps) {
      if (caps.vision) out.push('Vision');
      if (caps.toolCalling) out.push('Tools');
      if (caps.reasoning) out.push('Reasoning');
      if (caps.imageOutput) out.push('Image out');
      if (caps.text && !out.length) out.push('Text');
    }
    if (isFree) out.push('Free');
    return out.join(' \u00B7 ');
  }

  /** "Provider: Model" -> muted provider prefix + semibold model part. */
  function nameMarkup(name) {
    const n = String(name || '');
    const i = n.indexOf(': ');
    if (i > 0 && i < n.length - 2) {
      return `<span class="n-prefix">${escapeHtml(n.slice(0, i + 1))}</span> <span class="n-main">${escapeHtml(n.slice(i + 2))}</span>`;
    }
    return `<span class="n-main">${escapeHtml(n)}</span>`;
  }

  function isLive(modelId) {
    return activeCopilotModels.some(m => m.id === modelId);
  }

  function capabilityTags(caps, isFree) {
    const out = [];
    const tag = (cls, ic, label, iconOnly) =>
      `<span class="tag ${cls}${iconOnly ? ' icon-able' : ''}" title="${label}" aria-label="${label}">${icon(ic, 12)}<span class="tag-label">${label}</span></span>`;
    if (caps) {
      if (caps.vision) out.push(tag('vision', 'eye', 'Vision', true));
      if (caps.toolCalling) out.push(tag('tools', 'wrench', 'Tools', true));
      if (caps.reasoning) out.push(tag('reason', 'bulb', 'Reasoning', true));
      if (caps.imageOutput) out.push(tag('image', 'image', 'Image out', true));
      if (caps.text && !caps.vision && !caps.toolCalling && !caps.reasoning && !caps.imageOutput) {
        out.push('<span class="tag" title="Text" aria-label="Text">Text</span>');
      }
    }
    if (isFree) out.push(tag('free', 'gift', 'Free', false));
    return out.join('');
  }

  /** Routers (openrouter/auto, …) bill the price of the model they pick; older caches hold them as negative prices. */
  function hasVariablePrice(model) {
    return !!model && (!!model.variablePricing || model.pricing.promptPerMillion < 0 || model.pricing.completionPerMillion < 0);
  }

  function metricStrip(isFree, inP, outP, ctx, maxOut, variable) {
    const price = variable
      ? `<div class="metric span-2 m-free" title="Routes each request to a model and bills that model's price"><span class="m-cap">Price $/M</span><span class="m-val varies" aria-label="Price varies by the model it routes to">${icon('zap', 13)}Varies</span></div>`
      : isFree
      ? `<div class="metric span-2 m-free"><span class="m-cap">Price $/M</span><span class="m-val free" aria-label="Free">${icon('gift', 13)}Free</span></div>`
      : `<div class="metric m-in" aria-label="Input ${fmtPrice(inP)} per million tokens"><span class="m-cap">In $/M</span><span class="m-val">${fmtPrice(inP)}</span>${costDots(inP, 'in')}</div>
         <div class="metric m-out" aria-label="Output ${fmtPrice(outP)} per million tokens"><span class="m-cap">Out $/M</span><span class="m-val">${fmtPrice(outP)}</span>${costDots(outP, 'out')}</div>`;
    return `
      <div class="metrics">
        ${price}
        <div class="metric m-ctx" aria-label="Context window ${fmtTokens(ctx)} tokens">
          <span class="m-cap">Context</span>
          <span class="m-val with-ring">${ring(ctx)}${fmtTokens(ctx)}</span>
        </div>
        <div class="metric m-max" aria-label="Max output ${fmtTokens(maxOut)} tokens">
          <span class="m-cap">Max out</span><span class="m-val">${fmtTokens(maxOut)}</span>
          <span class="bar"><i style="width:${Math.round(logPct(maxOut, 4096, 131072) * 100)}%"></i></span>
        </div>
      </div>`;
  }

  /** 5-step cost rating (per-direction price buckets). */
  function costDots(p, dir) {
    const steps = dir === 'in' ? [0.2, 0.8, 2.5, 8] : [0.6, 2.5, 8, 20];
    let n = 1;
    for (const s of steps) if (p > s) n++;
    let dots = '';
    for (let i = 0; i < 5; i++) dots += `<i class="${i < n ? 'on' : ''}"></i>`;
    return `<span class="dots" title="Cost ${n} of 5" aria-hidden="true">${dots}</span>`;
  }

  function ring(ctx) {
    const pct = logPct(ctx, 4096, 2097152);
    const r = 5.5, c = 2 * Math.PI * r;
    const dash = Math.max(0.04, pct) * c;
    return `<svg class="ring" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <circle class="track" cx="7" cy="7" r="${r}" fill="none" stroke-width="2"/>
      <circle class="fill" cx="7" cy="7" r="${r}" fill="none" stroke-width="2" stroke-dasharray="${dash.toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 7 7)"/>
    </svg>`;
  }

  function logPct(v, min, max) {
    if (!v || v <= 0) return 0;
    const p = (Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min));
    return Math.max(0, Math.min(1, p));
  }

  function idMarkup(model) {
    const id = model.id || '';
    const slash = id.indexOf('/');
    if (slash < 0) return escapeHtml(id);
    return `<span class="prov">${escapeHtml(id.slice(0, slash))}</span>/${escapeHtml(id.slice(slash + 1))}`;
  }

  function monoTile(provider, live) {
    const p = String(provider || '?');
    let h = 0;
    for (let i = 0; i < p.length; i++) h = (h * 31 + p.charCodeAt(i)) >>> 0;
    const HUES = [205, 225, 250, 275, 300, 328, 355, 18, 162, 185];
    const hue = HUES[h % HUES.length];
    const parts = p.split(/[-_\s.]+/).filter(Boolean);
    const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : p.slice(0, 2);
    return `<span class="mono-tile" style="--h:${hue}" title="${escapeAttr(p)}" aria-hidden="true">${escapeHtml(initials)}${live ? '<span class="tile-dot"></span>' : ''}</span>`;
  }

  function renderSkeletons() {
    let s = '';
    for (let i = 0; i < 4; i++) {
      s += `
        <div class="card skeleton" aria-hidden="true">
          <div class="card-head">
            <span class="sk" style="width:30px;height:30px;border-radius:8px"></span>
            <div class="card-title" style="gap:6px"><span class="sk" style="width:60%;height:11px"></span><span class="sk" style="width:40%;height:9px"></span></div>
            <span class="sk" style="width:28px;height:28px;border-radius:999px"></span>
          </div>
          <div class="card-tags"><span class="sk" style="width:44px;height:18px"></span><span class="sk" style="width:44px;height:18px"></span></div>
          <span class="sk" style="display:block;margin-top:10px;height:44px;border-radius:9px"></span>
        </div>`;
    }
    return s;
  }

  function emptyBlock(iconName, title, desc, action, label, primary) {
    return `
      <div class="empty-state">
        <div class="empty-art"><span class="ico">${icon(iconName, 22)}</span></div>
        <div class="empty-title">${title}</div>
        <div class="empty-desc">${desc}</div>
        ${action ? `<button class="btn ${primary ? 'btn-primary' : ''}" data-action="${action}">${label}</button>` : ''}
      </div>`;
  }

  function renderEmptyState() {
    if (!hasApiKey) {
      return emptyBlock('key', 'Connect OpenRouter', 'Add your OpenRouter API key to browse the catalog and enable models in Copilot.', 'set-key', `${icon('key', 13)}Set API key`, true);
    }
    return emptyBlock('cloud', 'No models loaded', 'Sync the OpenRouter catalog to start browsing models.', 'sync', `${icon('refresh', 13)}Sync models`, true);
  }

  function renderNoResults() {
    return emptyBlock('searchX', 'No matching models', 'Try a different search or loosen the filters.', 'clear-filters', 'Clear filters', false);
  }

  // ===== RENDERING: ACTIVE =====
  function renderActiveModels() {
    if (!dom.activeModelsList) return;
    const n = activeCopilotModels.length;

    if (n === 0) {
      dom.activeSummary.innerHTML = '';
      dom.activeModelsList.innerHTML = emptyBlock('pin', 'Nothing active in Copilot yet', 'Select models in Browse, then press “Apply to Copilot” to add them to the Copilot Chat model picker.', 'go-browse', `${icon('layers', 13)}Browse models`, false);
      lastActiveSig = '';
      return;
    }

    const reasoningCount = activeCopilotModels.filter(a => (a.supportedEfforts || []).length).length;
    const fulls = activeCopilotModels.map(a => allModels.find(m => m.id === a.id)).filter(Boolean);
    const maxCtx = Math.max(0, ...activeCopilotModels.map(a => a.maxInputTokens || 0));
    const freeCount = fulls.filter(m => m.isFree).length;
    dom.activeSummary.innerHTML = `
      <span class="sum-count">${n}</span>
      <span class="sum-text">
        <span class="sum-title">${n === 1 ? 'model' : 'models'} live in Copilot Chat</span>
        <span class="sum-sub">Listed under <code>OpenRouter</code> in the picker</span>
      </span>
      <span class="sum-stats">
        <span class="sum-stat"><span class="v">${reasoningCount}</span><span class="c">Reasoning</span></span>
        <span class="sum-stat"><span class="v">${fmtTokens(maxCtx)}</span><span class="c">Largest context</span></span>
        <span class="sum-stat"><span class="v">${freeCount}</span><span class="c">Free</span></span>
      </span>`;

    const sig = activeCopilotModels.map(a => a.id).join('|');
    const animate = sig !== lastActiveSig;
    const focusKey = currentFocusKey(dom.activeModelsList);

    dom.activeModelsList.innerHTML = activeCopilotModels.map((am, i) => {
      const fullModel = allModels.find(m => m.id === am.id);
      const id = escapeAttr(am.id);
      const name = escapeHtml(am.name);
      const ctx = am.maxInputTokens || (fullModel ? fullModel.contextLength : 0);
      const maxOut = am.maxOutputTokens || (fullModel ? fullModel.maxOutputTokens : 0);
      const caps = fullModel ? fullModel.capabilities : { vision: am.vision, toolCalling: am.toolCalling };
      const tags = capabilityTags(caps, fullModel ? fullModel.isFree : false);
      const provider = fullModel ? fullModel.provider : (am.id.split('/')[0] || '');
      const enter = animate && i < 12 ? ` enter" style="--i:${i}` : '';
      const flash = highlightIds.has(am.id) ? ' just-added' : '';
      const metrics = fullModel
        ? metricStrip(fullModel.isFree, fullModel.pricing.promptPerMillion, fullModel.pricing.completionPerMillion, ctx, maxOut, hasVariablePrice(fullModel))
        : metricStrip(false, NaN, NaN, ctx, maxOut);

      return `
        <article class="card active-card${flash}${enter}" data-model-id="${id}" aria-label="${name}">
          <div class="card-head">
            ${monoTile(provider, true)}
            <div class="card-title">
              <div class="card-name-row"><span class="card-name" title="${name}">${nameMarkup(am.name)}</span></div>
              <span class="card-id" title="${id}">${idMarkup(am)}</span>
            </div>
            <button class="danger-btn" data-action="remove-active" data-model-id="${id}" data-fk="rm:${id}"
              aria-label="Remove ${name} from Copilot" title="Remove from Copilot">
              ${icon('trash', 14)}<span class="danger-label">Remove</span>
            </button>
          </div>
          ${tags ? `<div class="card-tags"><div class="tags">${tags}</div></div>` : ''}
          ${renderEffortControl(am)}
          ${metrics}
        </article>`;
    }).join('');

    lastActiveSig = sig;
    if (focusKey) restoreFocus(dom.activeModelsList, focusKey);
  }

  // Weakest to strongest; same set as src/utils/reasoningEffort.ts
  const EFFORT_ORDER = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'];
  function effortRank(effort) {
    const i = EFFORT_ORDER.indexOf(effort);
    return i === -1 ? EFFORT_ORDER.length : i;
  }

  function renderEffortControl(am) {
    const efforts = am.supportedEfforts || [];
    if (!efforts.length) {
      // Panel only (CSS): a muted placeholder keeps card heights even in the grid
      return `
      <div class="effort effort-none" aria-hidden="true">
        <span class="effort-label">${icon('bulbOff', 13)}No thinking effort for this model</span>
      </div>`;
    }
    const current = am.reasoningEffort || efforts[0];
    // Rank by effort strength, not list position: the catalog lists efforts in either order
    const levels = efforts.filter(e => e !== 'none')
      .sort((a, b) => effortRank(a) - effortRank(b));
    const idx = Math.max(0, levels.indexOf(current));
    const options = efforts.map((effort) => {
      const selected = effort === current ? ' selected' : '';
      const label = effort.charAt(0).toUpperCase() + effort.slice(1);
      return `<option value="${escapeAttr(effort)}"${selected}>${escapeHtml(label)}</option>`;
    }).join('');
    // Compact 4-bar gauge: the level mapped onto 4 steps ("none" = 0 bars)
    const lit = current === 'none' ? 0 : Math.max(1, Math.ceil(((idx + 1) / levels.length) * 4));
    let bars = '';
    for (let i = 0; i < 4; i++) bars += `<i class="${i < lit ? 'on' : ''}"></i>`;
    const selId = 'eff-' + hashId(am.id);
    const always = am.reasoningMandatory
      ? '<span class="effort-always"><span class="sep" aria-hidden="true">\u00B7</span>always on</span>'
      : '';
    return `
      <div class="effort">
        <label class="effort-label" for="${selId}">${icon('bulb', 13)}<span class="effort-text"><span class="effort-name">Thinking effort</span>${always}</span></label>
        <span class="effort-gauge" role="img" aria-label="${current === 'none' ? 'Effort off' : `Effort level ${idx + 1} of ${levels.length}`}">${bars}</span>
        <span class="effort-select-wrap">
          <select class="effort-select" id="${selId}" data-model-id="${escapeAttr(am.id)}" data-fk="eff:${escapeAttr(am.id)}">
            ${options}
          </select>
          <span class="ico chev">${icon('chevronDown', 12)}</span>
        </span>
      </div>
    `;
  }

  // ===== RENDERING: DRAFT TRAY =====
  function renderSelectedModels() {
    const draftModels = selectedModelsData.filter(m => !m.enabled);
    const count = draftModels.length;
    dom.selectedCount.textContent = count;
    dom.applyBtn.disabled = count === 0;
    dom.bottomPanel.classList.toggle('is-empty', count === 0);
    dom.trayTitle.textContent = count === 0 ? 'Nothing selected' : `${count} model${count === 1 ? '' : 's'} selected`;
    dom.trayNames.textContent = count === 0 ? 'Pick models with Select' : draftModels.map(m => m.name).join(', ');
    dom.trayNames.hidden = false;
    // Nothing to expand at 0: the toggle is disabled and its chevron hidden (CSS)
    dom.bottomToggle.disabled = count === 0;
    applyTrayState();

    if (count === 0) {
      dom.selectedList.innerHTML = '<li class="draft-empty">No draft models. Select models above, then press “Apply to Copilot”.</li>';
      return;
    }

    dom.selectedList.innerHTML = draftModels.map(sm => {
      const model = allModels.find(m => m.id === sm.id);
      const price = model
        ? (hasVariablePrice(model) ? 'Varies' : model.isFree ? 'Free' : `${fmtPrice(model.pricing.promptPerMillion)} / ${fmtPrice(model.pricing.completionPerMillion)}`)
        : '';
      const provider = model ? model.provider : (sm.id.split('/')[0] || '');
      return `
        <li class="draft-item" data-model-id="${escapeAttr(sm.id)}">
          ${monoTile(provider)}
          <span class="draft-name" title="${escapeAttr(sm.id)}">${nameMarkup(sm.name)}</span>
          <span class="draft-price${model && model.isFree ? ' free' : ''}">${price}</span>
          <button class="draft-remove" data-action="remove-draft" data-model-id="${escapeAttr(sm.id)}" aria-label="Remove ${escapeAttr(sm.name)} from selection" title="Remove">${icon('x', 14)}</button>
        </li>`;
    }).join('');
  }

  function applyTrayState() {
    const empty = dom.bottomToggle.disabled;
    const open = trayOpen && !empty;
    dom.bottomPanel.classList.toggle('open', open);
    dom.bottomToggle.setAttribute('aria-expanded', String(open));
    if (dom.trayTitle) {
      dom.bottomToggle.setAttribute('aria-label', empty
        ? 'Nothing selected. Pick models with Select'
        : `${dom.trayTitle.textContent}. ${open ? 'Collapse' : 'Expand'} list`);
    }
  }

  function applyViewMode() {
    const table = viewMode === 'table';
    dom.tabContentBrowse.classList.toggle('view-table', table);
    dom.viewTable.setAttribute('aria-pressed', String(table));
    dom.viewCards.setAttribute('aria-pressed', String(!table));
  }

  function updateSortHeader() {
    const sortBy = Filters.get().sortBy || 'name-asc';
    dom.listHead.querySelectorAll('[data-sort]').forEach((b) => {
      const on = b.dataset.sort === sortBy;
      b.classList.toggle('sorted', on);
      b.setAttribute('aria-sort', on ? (sortBy === 'context-desc' ? 'descending' : 'ascending') : 'none');
    });
  }

  function observeFilters() {
    const set = () => dom.tabContentBrowse.style.setProperty('--filters-h', dom.filters.offsetHeight + 'px');
    set();
    if (window.ResizeObserver) new ResizeObserver(set).observe(dom.filters);
  }

  function persist(patch) {
    safe(() => vscodeApi.setState(Object.assign({}, vscodeApi.getState() || {}, patch)));
  }

  function observeTray() {
    const set = () => dom.app.style.setProperty('--tray-h', dom.bottomPanel.offsetHeight + 'px');
    set();
    if (window.ResizeObserver) new ResizeObserver(set).observe(dom.bottomPanel);
  }

  // ===== PROVIDER MENU =====
  function renderProviderDropdown() {
    const counts = new Map();
    allModels.forEach(m => counts.set(m.provider, (counts.get(m.provider) || 0) + 1));
    const providers = [...counts.keys()].sort();
    const current = Filters.get().provider;
    const option = (value, label, count, tile) => `
      <button class="provider-option ${current === value ? 'selected' : ''}" role="option" aria-selected="${current === value}" tabindex="-1" data-provider="${escapeAttr(value)}">
        <span class="po-check">${icon('check', 14)}</span>
        ${tile}
        <span class="po-name">${escapeHtml(label)}</span>
        <span class="po-count">${count}</span>
      </button>`;
    dom.providerMenu.innerHTML =
      option('', 'All providers', allModels.length, '') +
      providers.map(p => option(p, p, counts.get(p), monoTile(p))).join('');
  }

  function toggleProviderMenu(open) {
    const isOpen = dom.providerMenu.classList.contains('open');
    if (open === isOpen) return;
    dom.providerMenu.classList.toggle('open', open);
    dom.providerBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      const sel = dom.providerMenu.querySelector('.provider-option.selected') || dom.providerMenu.querySelector('.provider-option');
      if (sel) { sel.focus(); sel.scrollIntoView({ block: 'nearest' }); }
    }
  }

  function pickProvider(provider) {
    Filters.set('provider', provider);
    updateProviderButton();
    toggleProviderMenu(false);
    dom.providerBtn.focus();
    renderProviderDropdown();
    filtersChanged();
  }

  function updateProviderButton() {
    const p = Filters.get().provider;
    dom.providerLabel.textContent = p || 'All providers';
    dom.providerBtn.classList.toggle('has-value', !!p);
    dom.providerBtn.setAttribute('aria-label', `Provider: ${p || 'All providers'}`);
  }

  // ===== UI HELPERS =====
  function setLoading(loading) {
    isLoading = loading;
    dom.loadingOverlay.classList.toggle('visible', loading);
    dom.app.classList.toggle('is-loading', loading);
    dom.syncBtn.setAttribute('aria-busy', String(loading));
    if (!allModels.length) renderModels();
  }

  function updateApiKeyUI() {
    if (dom.apiKeyBanner) {
      dom.apiKeyBanner.style.display = hasApiKey ? 'none' : 'flex';
    }
    dom.app.classList.toggle('no-key', !hasApiKey);
  }

  function updateStats(total) {
    dom.statsCount.textContent = total || allModels.length;
  }

  function hasActiveFilters() {
    const f = Filters.get();
    return Filters.activeCount() > 0 || (f.sortBy && f.sortBy !== 'name-asc');
  }

  function syncSearchUi() {
    const has = dom.searchInput.value.length > 0;
    dom.searchClear.classList.toggle('visible', has);
    dom.search.classList.toggle('has-value', has);
  }

  function clearSearch() {
    clearTimeout(searchDebounceTimer);
    dom.searchInput.value = '';
    syncSearchUi();
    Filters.set('search', '');
    filtersChanged();
  }

  function setPressed(btn, on) {
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
  }

  const TOAST_ICON = { success: 'checkCircle', error: 'alert', info: 'info' };
  function showToast(message, type = 'info', opts) {
    const compact = !!(opts && opts.compact);
    // Frequent add/remove feedback: one compact toast at a time, the newest replaces the previous
    if (compact) dom.toastContainer.querySelectorAll('.toast.compact').forEach((t) => t.remove());
    const toast = document.createElement('div');
    toast.className = `toast ${type}${compact ? ' compact' : ''}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.innerHTML = `${icon(TOAST_ICON[type] || 'info', compact ? 14 : 15)}<span class="toast-msg"></span>`;
    toast.querySelector('.toast-msg').textContent = message;
    dom.toastContainer.appendChild(toast);
    while (dom.toastContainer.children.length > 3) dom.toastContainer.firstElementChild.remove();

    setTimeout(() => {
      toast.classList.add('leaving');
      setTimeout(() => toast.remove(), 200);
    }, compact ? 2000 : type === 'error' ? 6000 : 3500);
  }

  function fmtPrice(p) {
    if (typeof p !== 'number' || isNaN(p)) return '—';
    if (p === 0) return '$0';
    if (p < 0.01) return `$${p.toFixed(4).replace(/0+$/, '')}`;
    if (p >= 100) return `$${p.toFixed(0)}`;
    return `$${p.toFixed(2)}`;
  }

  function fmtTokens(count) {
    if (!count || count === 0) return 'N/A';
    if (count >= 1000000) {
      const v = count / 1000000;
      return `${v >= 10 ? Math.round(v) : (Math.round(v * 10) / 10).toString()}M`;
    }
    if (count >= 1000) return `${Math.round(count / 1000)}K`;
    return count.toString();
  }

  function hashId(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  function currentFocusKey(container) {
    const a = document.activeElement;
    return a && container.contains(a) && a.dataset ? a.dataset.fk : null;
  }
  function restoreFocus(container, key) {
    const el = container.querySelector(`[data-fk="${cssEsc(key)}"]`);
    if (el) el.focus({ preventScroll: true });
  }
  function cssEsc(s) {
    return (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&');
  }

  function escapeHtml(text) {
    if (text === undefined || text === null) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function escapeAttr(text) {
    return escapeHtml(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function safe(fn) { try { return fn(); } catch (e) { return undefined; } }

  // ===== GLOBAL FUNCTIONS =====
  window.removeModel = function(modelId) {
    vscodeApi.postMessage({ type: 'removeModel', modelId });
  };

  window.removeActiveModel = function(modelId) {
    vscodeApi.postMessage({ type: 'removeActiveModel', modelId });
  };

  window.setReasoningEffort = function(selectEl) {
    const modelId = selectEl.dataset.modelId;
    const effort = selectEl.value;
    if (!modelId || !effort) return;
    vscodeApi.postMessage({ type: 'setReasoningEffort', modelId, effort });
  };

  window.resetFilters = function() {
    Filters.reset();
    clearTimeout(searchDebounceTimer);
    dom.searchInput.value = '';
    syncSearchUi();
    CHIP_FILTERS.forEach(({ el }) => { const b = el(); if (b) setPressed(b, false); });
    dom.sortSelect.value = 'name-asc';
    updateProviderButton();
    renderProviderDropdown();
    filtersChanged();
  };

  // ===== BOOT =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
