/**
 * OpenRouter Copilot Model Manager — Main Application
 * Orchestrates UI rendering, user interaction, tabs, and extension communication.
 */
(function() {
  'use strict';

  // ===== STATE =====
  let allModels = [];
  let selectedModelIds = new Set();
  let selectedModelsData = [];
  let activeCopilotModels = [];
  let hasApiKey = false;
  let isLoading = false;
  let activeTab = 'browse'; // 'browse' | 'active'
  let searchDebounceTimer = null;

  // ===== DOM REFS =====
  const $ = (sel) => document.querySelector(sel);

  const dom = {
    tabBrowse:        $('#tab-browse'),
    tabActive:        $('#tab-active'),
    tabContentBrowse: $('#tab-content-browse'),
    tabContentActive: $('#tab-content-active'),
    activeTabCount:   $('#active-tab-count'),
    activeModelsList: $('#active-models-list'),
    searchInput:      $('#search-input'),
    searchClear:      $('#search-clear'),
    filterVision:     $('#filter-vision'),
    filterTools:      $('#filter-tools'),
    filterFree:       $('#filter-free'),
    sortSelect:       $('#sort-select'),
    providerBtn:      $('#provider-filter-btn'),
    providerMenu:     $('#provider-menu'),
    statsCount:       $('#stats-count'),
    statsFiltered:    $('#stats-filtered'),
    modelList:        $('#model-list'),
    bottomPanel:      $('#bottom-panel'),
    bottomToggle:     $('#bottom-panel-toggle'),
    bottomBody:       $('#bottom-panel-body'),
    selectedList:     $('#selected-model-list'),
    selectedCount:    $('#selected-count'),
    applyBtn:         $('#apply-btn'),
    syncBtn:          $('#sync-btn'),
    apiKeyBtn:        $('#apikey-btn'),
    apiKeyBanner:     $('#apikey-banner'),
    apiKeyBannerBtn:  $('#apikey-banner-btn'),
    loadingOverlay:   $('#loading-overlay'),
    toastContainer:   $('#toast-container'),
  };

  // ===== INIT =====
  function init() {
    bindEvents();
    vscodeApi.onMessage(handleExtensionMessage);
    vscodeApi.postMessage({ type: 'ready' });
  }

  // ===== EVENT BINDING =====
  function bindEvents() {
    // Tabs
    dom.tabBrowse.addEventListener('click', () => switchTab('browse'));
    dom.tabActive.addEventListener('click', () => switchTab('active'));

    // Search
    dom.searchInput.addEventListener('input', () => {
      const val = dom.searchInput.value;
      dom.searchClear.classList.toggle('visible', val.length > 0);
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        Filters.set('search', val);
        renderModels();
      }, 200);
    });
    dom.searchClear.addEventListener('click', () => {
      dom.searchInput.value = '';
      dom.searchClear.classList.remove('visible');
      Filters.set('search', '');
      renderModels();
      dom.searchInput.focus();
    });

    // Filter chips
    dom.filterVision.addEventListener('click', () => {
      Filters.toggle('vision');
      dom.filterVision.classList.toggle('active');
      renderModels();
    });
    dom.filterTools.addEventListener('click', () => {
      Filters.toggle('toolCalling');
      dom.filterTools.classList.toggle('active');
      renderModels();
    });
    dom.filterFree.addEventListener('click', () => {
      Filters.toggle('free');
      dom.filterFree.classList.toggle('active');
      renderModels();
    });

    // Sort
    dom.sortSelect.addEventListener('change', () => {
      Filters.set('sortBy', dom.sortSelect.value);
      renderModels();
    });

    // Provider dropdown
    dom.providerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dom.providerMenu.classList.toggle('open');
    });
    document.addEventListener('click', () => {
      dom.providerMenu.classList.remove('open');
    });

    // Bottom panel toggle
    dom.bottomToggle.addEventListener('click', () => {
      const body = dom.bottomBody;
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
    });

    // Apply to Copilot
    dom.applyBtn.addEventListener('click', () => {
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
  }

  function switchTab(tab) {
    activeTab = tab;
    if (tab === 'browse') {
      dom.tabBrowse.classList.add('active');
      dom.tabActive.classList.remove('active');
      dom.tabContentBrowse.classList.add('active');
      dom.tabContentActive.classList.remove('active');
    } else {
      dom.tabActive.classList.add('active');
      dom.tabBrowse.classList.remove('active');
      dom.tabContentActive.classList.add('active');
      dom.tabContentBrowse.classList.remove('active');
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
        renderActiveModels();
        renderModels();
        break;
      case 'modelAdded':
        showToast('✅ Model added to draft selection', 'success');
        break;
      case 'modelRemoved':
        showToast('Model removed from draft', 'info');
        break;
      case 'appliedToCopilot':
        if (msg.success) {
          showToast(msg.message, 'success');
          // Switch to Active in Copilot tab to show applied models
          switchTab('active');
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
        updateApiKeyUI();
        break;
      case 'syncComplete':
        if (msg.newModelsCount > 0) {
          showToast(`🆕 ${msg.newModelsCount} new model(s) found!`, 'success');
        } else {
          showToast('✅ Models synced, all up to date', 'info');
        }
        break;
    }
  }

  // ===== RENDERING =====
  function renderModels() {
    const filtered = Filters.apply(allModels);
    dom.statsFiltered.textContent = filtered.length;
    dom.statsCount.textContent = allModels.length;

    if (filtered.length === 0 && allModels.length === 0) {
      dom.modelList.innerHTML = renderEmptyState();
      return;
    }

    if (filtered.length === 0) {
      dom.modelList.innerHTML = renderNoResults();
      return;
    }

    const toRender = filtered.slice(0, 100);
    dom.modelList.innerHTML = toRender.map((model, i) => renderModelCard(model, i)).join('');

    if (filtered.length > 100) {
      dom.modelList.innerHTML += `
        <div class="stats-bar" style="justify-content:center; border:none; padding: var(--space-4);">
          <span class="stats-text">Showing 100 of ${filtered.length} — refine your search to see more</span>
        </div>
      `;
    }

    // Bind card events
    dom.modelList.querySelectorAll('.btn-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modelId = e.currentTarget.dataset.modelId;
        if (selectedModelIds.has(modelId)) {
          vscodeApi.postMessage({ type: 'removeModel', modelId });
        } else {
          vscodeApi.postMessage({ type: 'addModel', modelId });
        }
      });
    });

    dom.modelList.querySelectorAll('.model-card-desc-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const desc = e.currentTarget.nextElementSibling;
        const arrow = e.currentTarget.querySelector('.desc-arrow');
        desc.classList.toggle('open');
        if (arrow) arrow.textContent = desc.classList.contains('open') ? '▾' : '▸';
      });
    });
  }

  function renderModelCard(model, index) {
    const isSelected = selectedModelIds.has(model.id);
    const isActiveInCopilot = activeCopilotModels.some(m => m.id === model.id);
    const delay = Math.min(index * 25, 250);

    const badges = [];
    if (model.capabilities.text) badges.push('<span class="badge badge-text">📝 Text</span>');
    if (model.capabilities.vision) badges.push('<span class="badge badge-vision">👁️ Vision</span>');
    if (model.capabilities.toolCalling) badges.push('<span class="badge badge-tools">🔧 Tools</span>');
    if (model.capabilities.reasoning) badges.push('<span class="badge badge-reasoning">🧠 Reasoning</span>');
    if (model.capabilities.imageOutput) badges.push('<span class="badge badge-image-out">🎨 Image Out</span>');
    if (model.isFree) badges.push('<span class="badge badge-free">✨ Free</span>');
    if (isActiveInCopilot) badges.push('<span class="badge badge-free" style="background:rgba(63,185,80,0.18); border-color:var(--accent-green);">✅ Active in Copilot</span>');

    const promptPrice = model.isFree ? 'Free' : `$${model.pricing.promptPerMillion.toFixed(2)}`;
    const completionPrice = model.isFree ? 'Free' : `$${model.pricing.completionPerMillion.toFixed(2)}`;
    const priceClass = model.isFree ? 'free' : '';

    const ctx = formatTokenCount(model.contextLength);
    const maxOut = formatTokenCount(model.maxOutputTokens);

    const descSnippet = model.description
      ? model.description.substring(0, 220) + (model.description.length > 220 ? '...' : '')
      : '';

    return `
      <div class="model-card ${isSelected ? 'selected' : ''}" style="animation-delay: ${delay}ms" data-model-id="${model.id}">
        <div class="model-card-header">
          <div class="model-card-info">
            <div class="model-card-provider">${escapeHtml(model.provider)}</div>
            <div class="model-card-name">${escapeHtml(model.name)}</div>
            <div class="model-card-id">${escapeHtml(model.id)}</div>
          </div>
          <div class="model-card-action">
            <button class="btn btn-add ${isSelected ? 'added' : 'btn-primary'}" data-model-id="${model.id}">
              ${isSelected ? '✓ Selected' : '+ Select'}
            </button>
          </div>
        </div>

        <div class="model-card-badges">${badges.join('')}</div>

        <div class="model-card-pricing">
          <div class="price-item">
            <span class="price-label">Input:</span>
            <span class="price-value ${priceClass}">${promptPrice}/M</span>
          </div>
          <div class="price-item">
            <span class="price-label">Output:</span>
            <span class="price-value ${priceClass}">${completionPrice}/M</span>
          </div>
        </div>

        <div class="model-card-stats">
          <div class="stat-item">
            <span>📊</span>
            <span class="stat-value">${ctx}</span>
            <span>context</span>
          </div>
          <div class="stat-item">
            <span>📤</span>
            <span class="stat-value">${maxOut}</span>
            <span>max output</span>
          </div>
        </div>

        ${descSnippet ? `
          <div class="model-card-desc">
            <button class="model-card-desc-toggle"><span class="desc-arrow">▸</span> Description</button>
            <div class="model-card-desc-text">${escapeHtml(descSnippet)}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderActiveModels() {
    if (!dom.activeModelsList) return;

    if (activeCopilotModels.length === 0) {
      dom.activeModelsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📌</div>
          <div class="empty-state-title">No Active Copilot Models</div>
          <div class="empty-state-desc">Select models in the "Browse Models" tab and click "Apply to Copilot" to enable them.</div>
        </div>
      `;
      return;
    }

    dom.activeModelsList.innerHTML = activeCopilotModels.map(am => {
      const fullModel = allModels.find(m => m.id === am.id);

      const promptPrice = fullModel
        ? (fullModel.isFree ? 'Free' : `$${fullModel.pricing.promptPerMillion.toFixed(2)}/M`)
        : '';
      const completionPrice = fullModel
        ? (fullModel.isFree ? 'Free' : `$${fullModel.pricing.completionPerMillion.toFixed(2)}/M`)
        : '';
      const priceClass = fullModel?.isFree ? 'free' : '';

      const ctx = am.maxInputTokens ? formatTokenCount(am.maxInputTokens) : (fullModel ? formatTokenCount(fullModel.contextLength) : 'N/A');
      const maxOut = am.maxOutputTokens ? formatTokenCount(am.maxOutputTokens) : (fullModel ? formatTokenCount(fullModel.maxOutputTokens) : 'N/A');

      const badges = [];
      if (fullModel) {
        if (fullModel.capabilities.text) badges.push('<span class="badge badge-text">📝 Text</span>');
        if (fullModel.capabilities.vision) badges.push('<span class="badge badge-vision">👁️ Vision</span>');
        if (fullModel.capabilities.toolCalling) badges.push('<span class="badge badge-tools">🔧 Tools</span>');
        if (fullModel.capabilities.reasoning) badges.push('<span class="badge badge-reasoning">🧠 Reasoning</span>');
        if (fullModel.capabilities.imageOutput) badges.push('<span class="badge badge-image-out">🎨 Image Out</span>');
        if (fullModel.isFree) badges.push('<span class="badge badge-free">✨ Free</span>');
      } else {
        if (am.vision) badges.push('<span class="badge badge-vision">👁️ Vision</span>');
        if (am.toolCalling) badges.push('<span class="badge badge-tools">🔧 Tools</span>');
      }

      return `
        <div class="active-model-card">
          <div class="active-model-header">
            <div class="active-model-details">
              <span class="active-model-name">${escapeHtml(am.name)}</span>
              <span class="active-model-id">${escapeHtml(am.id)}</span>
            </div>
            <button class="btn btn-danger btn-sm" onclick="removeActiveModel('${am.id}')">
              Remove from Copilot
            </button>
          </div>

          ${badges.length > 0 ? `<div class="model-card-badges" style="margin-top: var(--space-2); margin-bottom: var(--space-2);">${badges.join('')}</div>` : ''}

          <div class="active-model-meta">
            <div class="model-card-pricing" style="margin-bottom:0;">
              <div class="price-item">
                <span class="price-label">Input:</span>
                <span class="price-value ${priceClass}">${promptPrice}</span>
              </div>
              <div class="price-item">
                <span class="price-label">Output:</span>
                <span class="price-value ${priceClass}">${completionPrice}</span>
              </div>
            </div>
            <div class="model-card-stats" style="border-top:none; padding-top:0;">
              <div class="stat-item">
                <span>📊</span>
                <span class="stat-value">${ctx}</span>
                <span>context</span>
              </div>
              <div class="stat-item">
                <span>📤</span>
                <span class="stat-value">${maxOut}</span>
                <span>max output</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderEmptyState() {
    if (!hasApiKey) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">🔑</div>
          <div class="empty-state-title">Set Your API Key</div>
          <div class="empty-state-desc">Enter your OpenRouter API key to start browsing models. Click the key icon above or the button below.</div>
          <button class="btn btn-primary" onclick="vscodeApi.postMessage({type:'setApiKey'})">🔑 Set API Key</button>
        </div>
      `;
    }
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🔄</div>
        <div class="empty-state-title">No Models Loaded</div>
        <div class="empty-state-desc">Click the sync button to fetch available models from OpenRouter.</div>
        <button class="btn btn-primary" onclick="vscodeApi.postMessage({type:'syncModels'})">🔄 Sync Models</button>
      </div>
    `;
  }

  function renderNoResults() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No Matching Models</div>
        <div class="empty-state-desc">Try adjusting your search or filters.</div>
        <button class="btn" onclick="resetFilters()">Clear Filters</button>
      </div>
    `;
  }

  function renderSelectedModels() {
    const draftModels = selectedModelsData.filter(m => !m.enabled);
    const count = draftModels.length;
    dom.selectedCount.textContent = count;
    dom.applyBtn.disabled = count === 0;

    if (count === 0) {
      dom.selectedList.innerHTML = `
        <div style="text-align:center; padding: var(--space-3); color: var(--text-muted); font-size: var(--font-size-base);">
          No draft models. Select models above, then click "Apply to Copilot".
        </div>
      `;
      return;
    }

    dom.selectedList.innerHTML = draftModels.map(sm => {
      const model = allModels.find(m => m.id === sm.id);
      const price = model
        ? (model.isFree ? 'Free' : `$${model.pricing.promptPerMillion.toFixed(1)}/$${model.pricing.completionPerMillion.toFixed(1)}`)
        : '';

      return `
        <div class="selected-model-item">
          <div class="selected-model-info">
            <span class="selected-model-name">${escapeHtml(sm.name)}</span>
            <span class="selected-model-price">${price}</span>
          </div>
          <button class="btn-icon" title="Remove" onclick="removeModel('${sm.id}')">✕</button>
        </div>
      `;
    }).join('');
  }

  function renderProviderDropdown() {
    const providers = [...new Set(allModels.map(m => m.provider))].sort();
    dom.providerMenu.innerHTML = `
      <div class="provider-option ${!Filters.get().provider ? 'selected' : ''}" data-provider="">All Providers</div>
      ${providers.map(p => `
        <div class="provider-option ${Filters.get().provider === p ? 'selected' : ''}" data-provider="${p}">${p}</div>
      `).join('')}
    `;

    dom.providerMenu.querySelectorAll('.provider-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        const provider = e.currentTarget.dataset.provider;
        Filters.set('provider', provider);
        dom.providerBtn.textContent = provider || '🏢 Provider';
        dom.providerMenu.classList.remove('open');
        renderModels();
        dom.providerMenu.querySelectorAll('.provider-option').forEach(o => o.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
      });
    });
  }

  // ===== UI HELPERS =====
  function setLoading(loading) {
    isLoading = loading;
    dom.loadingOverlay.classList.toggle('visible', loading);
  }

  function updateApiKeyUI() {
    if (dom.apiKeyBanner) {
      dom.apiKeyBanner.style.display = hasApiKey ? 'none' : 'flex';
    }
  }

  function updateStats(total) {
    dom.statsCount.textContent = total || allModels.length;
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function formatTokenCount(count) {
    if (!count || count === 0) return 'N/A';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== GLOBAL FUNCTIONS =====
  window.removeModel = function(modelId) {
    vscodeApi.postMessage({ type: 'removeModel', modelId });
  };

  window.removeActiveModel = function(modelId) {
    vscodeApi.postMessage({ type: 'removeActiveModel', modelId });
  };

  window.resetFilters = function() {
    Filters.reset();
    dom.searchInput.value = '';
    dom.searchClear.classList.remove('visible');
    dom.filterVision.classList.remove('active');
    dom.filterTools.classList.remove('active');
    dom.filterFree.classList.remove('active');
    dom.sortSelect.value = 'name-asc';
    dom.providerBtn.textContent = '🏢 Provider';
    renderModels();
  };

  // ===== BOOT =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
