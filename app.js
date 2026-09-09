/**
 * Main Application Controller & UI Logic
 * Includes Speed Feature Deck, Deck Editor, PDF Tracker, Admin Auth, and Shortened "Done" Alerts
 */

import { StorageService } from './storage.js';
import { SpinWheel } from './wheel.js';
import { soundEngine } from './audio.js';
import { generateProblemStatement } from './data.js';

class EventSpinApp {
  constructor() {
    this.wheelsConfig = StorageService.getWheels();
    this.records = StorageService.getTeamRecords();
    this.marketShifts = StorageService.getMarketShifts();
    this.speedFeatures = StorageService.getSpeedFeatures();

    this.wheelInstances = {};
    this.currentResults = {
      wheel1: null,
      wheel2: null,
      wheel3: null
    };

    this.activeTab = 'spin-room';
    this.activeEditorCategory = 'wheel1'; // 'wheel1', 'wheel2', 'wheel3', 'speed_features', 'market_shifts'
    
    this.currentDrawnMarketShift = null;
    this.currentDrawnSpeedFeature = null;
    this.currentSpeedTwist = null;
    this.currentProblemStatement = '';
    this.problemTemplateIndex = 0;

    this.init();
  }

  init() {
    this.setupTabNavigation();
    this.setupWheels();
    this.setupAudioToggle();
    this.setupSpinRoomControls();
    this.setupProblemStatementGenerator();
    this.setupSpeedTwistControls();
    this.setupSpeedFeatureDeck();
    this.setupMarketShiftDeck();
    this.setupEditor();
    this.setupMasterTracker();
    this.setupAdminAuth();
    this.setupModals();

    window.addEventListener('resize', () => {
      Object.values(this.wheelInstances).forEach(w => w.resizeCanvas());
    });
  }

  // --- SHORT TOAST NOTIFICATION ---
  showToast(message = 'Done!') {
    const toast = document.getElementById('toast-notification');
    const msgEl = document.getElementById('toast-message');
    if (toast && msgEl) {
      msgEl.textContent = message;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2000);
    } else {
      alert(message);
    }
  }

  // --- TAB NAVIGATION ---
  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.dataset.tab;
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('bg-slate-800', 'text-[#00C8FF]', 'border-b-2', 'border-[#00C8FF]');
        btn.classList.remove('text-slate-400', 'hover:text-slate-200');
      } else {
        btn.classList.remove('bg-slate-800', 'text-[#00C8FF]', 'border-b-2', 'border-[#00C8FF]');
        btn.classList.add('text-slate-400', 'hover:text-slate-200');
      }
    });

    document.querySelectorAll('.tab-content').forEach(content => {
      if (content.id === `tab-${tabId}`) {
        content.classList.remove('hidden');
      } else {
        content.classList.add('hidden');
      }
    });

    if (tabId === 'spin-room') {
      setTimeout(() => {
        Object.values(this.wheelInstances).forEach(w => {
          w.resizeCanvas();
          w.draw();
        });
      }, 50);
    } else if (tabId === 'tracker') {
      this.renderMasterTrackerTable();
    } else if (tabId === 'editor') {
      this.renderEditorView();
    }
  }

  // --- SOUND TOGGLE ---
  setupAudioToggle() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
      const isMuted = soundEngine.toggleMute();
      audioBtn.innerHTML = isMuted
        ? '<i data-lucide="volume-x" class="w-5 h-5 text-rose-400"></i>'
        : '<i data-lucide="volume-2" class="w-5 h-5 text-[#00C8FF]"></i>';
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // --- INITIALIZE WHEELS ---
  setupWheels() {
    ['wheel1', 'wheel2', 'wheel3'].forEach(wheelId => {
      const canvasId = `${wheelId}-canvas`;
      this.wheelInstances[wheelId] = new SpinWheel(
        canvasId,
        this.wheelsConfig[wheelId],
        (winningItem, winningIndex) => this.handleWheelFinish(wheelId, winningItem)
      );
    });
  }

  // --- SPIN ROOM CONTROLS ---
  setupSpinRoomControls() {
    ['wheel1', 'wheel2', 'wheel3'].forEach(wheelId => {
      const btn = document.getElementById(`spin-${wheelId}-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.clearResultDisplay(wheelId);
          this.wheelInstances[wheelId].spin();
        });
      }

      const elimBtn = document.getElementById(`eliminate-${wheelId}-btn`);
      if (elimBtn) {
        elimBtn.addEventListener('click', () => {
          const item = this.currentResults[wheelId];
          if (item) {
            this.eliminateOption(wheelId, item);
          }
        });
      }
    });

    const spinAllBtn = document.getElementById('spin-all-btn');
    if (spinAllBtn) {
      spinAllBtn.addEventListener('click', () => {
        this.spinAllWheels();
      });
    }

    const recordBtn = document.getElementById('record-combination-btn');
    if (recordBtn) {
      recordBtn.addEventListener('click', () => {
        this.recordCurrentCombination();
      });
    }

    this.updateTeamDropdown();
    this.updateItemCounts();
  }

  // --- SPEED FEATURE TWIST CONTROLS ---
  setupSpeedTwistControls() {
    const rollBtn = document.getElementById('roll-speed-twist-btn');
    const clearBtn = document.getElementById('clear-speed-twist-btn');

    if (rollBtn) {
      rollBtn.addEventListener('click', () => {
        const features = this.speedFeatures.length > 0 ? this.speedFeatures : StorageService.getSpeedFeatures();
        const randomIndex = Math.floor(Math.random() * features.length);
        const twist = features[randomIndex];
        this.setSpeedTwist(twist);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearSpeedTwist();
      });
    }
  }

  setSpeedTwist(twist) {
    this.currentSpeedTwist = twist;
    const banner = document.getElementById('speed-twist-banner');
    const titleEl = document.getElementById('speed-twist-title');
    const descEl = document.getElementById('speed-twist-desc');

    if (banner && titleEl && descEl && twist) {
      titleEl.textContent = twist.title;
      descEl.textContent = twist.description;
      banner.classList.remove('hidden');
      soundEngine.playFanfare();
      this.triggerConfetti();
    }
  }

  clearSpeedTwist() {
    this.currentSpeedTwist = null;
    const banner = document.getElementById('speed-twist-banner');
    if (banner) banner.classList.add('hidden');
  }

  // --- PROBLEM STATEMENT GENERATOR ---
  setupProblemStatementGenerator() {
    const rephraseBtn = document.getElementById('rephrase-problem-btn');
    const copyBtn = document.getElementById('copy-problem-btn');

    if (rephraseBtn) {
      rephraseBtn.addEventListener('click', () => {
        this.problemTemplateIndex++;
        this.updateProblemStatement();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!this.currentProblemStatement) return;
        navigator.clipboard.writeText(this.currentProblemStatement).then(() => {
          this.showToast('Copied to clipboard!');
        });
      });
    }
  }

  updateProblemStatement() {
    const w1 = this.currentResults.wheel1 || this.wheelInstances.wheel1?.getCurrentWinningItem();
    const w2 = this.currentResults.wheel2 || this.wheelInstances.wheel2?.getCurrentWinningItem();
    const w3 = this.currentResults.wheel3 || this.wheelInstances.wheel3?.getCurrentWinningItem();

    if (w1 && w2 && w3 && w1 !== 'N/A' && w2 !== 'N/A' && w3 !== 'N/A') {
      const rawText = generateProblemStatement(w1, w2, w3, this.problemTemplateIndex);
      this.currentProblemStatement = rawText.replace(/\*\*/g, '');

      const formatted = rawText
        .replace(/\*\*(.*?)\*\*/g, '<span class="text-[#00C8FF] font-black">$1</span>');

      const psEl = document.getElementById('generated-problem-statement');
      if (psEl) {
        psEl.innerHTML = `"${formatted}"`;
      }
    }
  }

  updateItemCounts() {
    ['wheel1', 'wheel2', 'wheel3'].forEach(wId => {
      const countEl = document.getElementById(`${wId}-items-count`);
      if (countEl && this.wheelsConfig[wId]) {
        const len = this.wheelsConfig[wId].items ? this.wheelsConfig[wId].items.length : 0;
        countEl.textContent = `${len} items`;
      }
    });
  }

  eliminateOption(wheelId, item) {
    if (!item || !this.wheelsConfig[wheelId]) return;
    const items = this.wheelsConfig[wheelId].items;
    const idx = items.indexOf(item);
    if (idx >= 0) {
      items.splice(idx, 1);
      StorageService.saveWheels(this.wheelsConfig);
      this.wheelInstances[wheelId].updateConfig(this.wheelsConfig[wheelId]);
      this.updateItemCounts();

      const elimBtn = document.getElementById(`eliminate-${wheelId}-btn`);
      if (elimBtn) elimBtn.classList.add('hidden');

      const badge = document.getElementById(`${wheelId}-result-badge`);
      if (badge) {
        badge.textContent = `❌ Eliminated: ${item}`;
        badge.className = 'flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-rose-950/60 text-rose-300 border border-rose-800/80 transition-all min-h-[40px] flex items-center justify-center text-center';
      }

      this.currentResults[wheelId] = null;
      this.showToast('Done!');
    }
  }

  spinAllWheels() {
    ['wheel1', 'wheel2', 'wheel3'].forEach(wheelId => {
      this.clearResultDisplay(wheelId);
      const vel = 0.38 + Math.random() * 0.25;
      setTimeout(() => {
        this.wheelInstances[wheelId].spin(vel);
      }, Math.random() * 150);
    });
  }

  clearResultDisplay(wheelId) {
    this.currentResults[wheelId] = null;
    const badge = document.getElementById(`${wheelId}-result-badge`);
    if (badge) {
      badge.textContent = 'Spinning...';
      badge.className = 'flex-1 px-3 py-2 rounded-xl text-sm font-bold bg-slate-900 text-slate-400 border border-slate-800 transition-all min-h-[40px] flex items-center justify-center text-center animate-pulse';
    }

    const elimBtn = document.getElementById(`eliminate-${wheelId}-btn`);
    if (elimBtn) elimBtn.classList.add('hidden');
  }

  handleWheelFinish(wheelId, item) {
    this.currentResults[wheelId] = item;
    const badge = document.getElementById(`${wheelId}-result-badge`);
    if (badge) {
      badge.textContent = item;
      badge.className = 'flex-1 px-3 py-2 rounded-xl text-sm font-bold bg-[#00C8FF]/10 text-[#00C8FF] border border-[#00C8FF]/40 transition-all min-h-[40px] flex items-center justify-center text-center';
    }

    const elimBtn = document.getElementById(`eliminate-${wheelId}-btn`);
    if (elimBtn) elimBtn.classList.remove('hidden');

    this.updateProblemStatement();

    if (this.currentResults.wheel1 && this.currentResults.wheel2 && this.currentResults.wheel3) {
      this.triggerConfetti();
    }
  }

  triggerConfetti() {
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  recordCurrentCombination() {
    const teamInput = document.getElementById('team-name-input');
    const teamName = teamInput ? teamInput.value.trim() : '';

    if (!teamName) {
      alert('Please enter or select a Team Name / Number before recording!');
      if (teamInput) teamInput.focus();
      return;
    }

    const wheel1Res = this.currentResults.wheel1 || this.wheelInstances.wheel1.getCurrentWinningItem();
    const wheel2Res = this.currentResults.wheel2 || this.wheelInstances.wheel2.getCurrentWinningItem();
    const wheel3Res = this.currentResults.wheel3 || this.wheelInstances.wheel3.getCurrentWinningItem();

    this.updateProblemStatement();

    const record = {
      teamName: teamName,
      wheel1Result: wheel1Res,
      wheel2Result: wheel2Res,
      wheel3Result: wheel3Res,
      problemStatement: this.currentProblemStatement || generateProblemStatement(wheel1Res, wheel2Res, wheel3Res).replace(/\*\*/g, ''),
      speedFeature: this.currentSpeedTwist ? this.currentSpeedTwist.title : null,
      marketShift: null
    };

    this.records = StorageService.saveTeamRecord(record);
    this.triggerConfetti();
    this.updateTeamDropdown();

    const autoEliminate = document.getElementById('auto-eliminate-checkbox')?.checked;
    if (autoEliminate) {
      if (wheel1Res && wheel1Res !== 'N/A') this.eliminateOption('wheel1', wheel1Res);
      if (wheel2Res && wheel2Res !== 'N/A') this.eliminateOption('wheel2', wheel2Res);
      if (wheel3Res && wheel3Res !== 'N/A') this.eliminateOption('wheel3', wheel3Res);
    }

    this.showToast('Done!');
  }

  updateTeamDropdown() {
    const datalist = document.getElementById('existing-teams-list');
    if (!datalist) return;
    datalist.innerHTML = '';

    const records = StorageService.getTeamRecords();
    records.forEach(r => {
      const option = document.createElement('option');
      option.value = r.teamName;
      datalist.appendChild(option);
    });
  }

  // --- DEDICATED SPEED FEATURE DECK SECTION ---
  setupSpeedFeatureDeck() {
    const drawBtn = document.getElementById('draw-speed-deck-btn');
    const cardContainer = document.getElementById('speed-deck-card-container');

    if (drawBtn && cardContainer) {
      drawBtn.addEventListener('click', () => {
        const features = StorageService.getSpeedFeatures();
        const randomIndex = Math.floor(Math.random() * features.length);
        const card = features[randomIndex];
        this.currentDrawnSpeedFeature = card;

        cardContainer.classList.remove('flipped');

        setTimeout(() => {
          const titleEl = document.getElementById('speed-deck-back-title');
          const descEl = document.getElementById('speed-deck-back-desc');
          const badgeEl = document.getElementById('speed-deck-back-badge');

          if (titleEl) titleEl.textContent = card.title;
          if (descEl) descEl.textContent = card.description;
          if (badgeEl) badgeEl.textContent = card.badge || 'Speed Twist';

          cardContainer.classList.add('flipped');
          soundEngine.playFanfare();
          this.triggerConfetti();
        }, 150);
      });
    }

    const assignBtn = document.getElementById('assign-speed-deck-btn');
    if (assignBtn) {
      assignBtn.addEventListener('click', () => {
        if (!this.currentDrawnSpeedFeature) {
          alert('Please draw a Speed Feature card first!');
          return;
        }

        const teamName = prompt('Enter Team Name / # to assign this Speed Feature to:');
        if (teamName && teamName.trim()) {
          const records = StorageService.getTeamRecords();
          const target = records.find(r => r.teamName.toLowerCase() === teamName.trim().toLowerCase());

          if (target) {
            target.speedFeature = this.currentDrawnSpeedFeature.title;
            StorageService.saveTeamRecord(target);
          } else {
            StorageService.saveTeamRecord({
              teamName: teamName.trim(),
              wheel1Result: 'Pending Spin',
              wheel2Result: 'Pending Spin',
              wheel3Result: 'Pending Spin',
              problemStatement: '',
              speedFeature: this.currentDrawnSpeedFeature.title,
              marketShift: null
            });
          }
          this.showToast('Done!');
        }
      });
    }
  }

  // --- MARKET SHIFT DECK SECTION ---
  setupMarketShiftDeck() {
    const drawBtn = document.getElementById('draw-market-shift-btn');
    const cardContainer = document.getElementById('market-shift-card-container');

    if (drawBtn && cardContainer) {
      drawBtn.addEventListener('click', () => {
        const shifts = StorageService.getMarketShifts();
        const randomIndex = Math.floor(Math.random() * shifts.length);
        const card = shifts[randomIndex];
        this.currentDrawnMarketShift = card;

        cardContainer.classList.remove('flipped');

        setTimeout(() => {
          const titleEl = document.getElementById('card-back-title');
          const descEl = document.getElementById('card-back-desc');
          const impactEl = document.getElementById('card-back-impact');

          if (titleEl) titleEl.textContent = card.title;
          if (descEl) descEl.textContent = card.description;
          if (impactEl) impactEl.textContent = `Impact Level: ${card.impact || 'High'}`;

          cardContainer.classList.add('flipped');
          soundEngine.playFanfare();
          this.triggerConfetti();
        }, 150);
      });
    }

    const assignBtn = document.getElementById('assign-shift-to-team-btn');
    if (assignBtn) {
      assignBtn.addEventListener('click', () => {
        if (!this.currentDrawnMarketShift) {
          alert('Please draw a Market Shift card first!');
          return;
        }

        const teamName = prompt('Enter Team Name / # to assign this Market Shift wildcard to:');
        if (teamName && teamName.trim()) {
          const records = StorageService.getTeamRecords();
          const target = records.find(r => r.teamName.toLowerCase() === teamName.trim().toLowerCase());

          if (target) {
            target.marketShift = this.currentDrawnMarketShift.title;
            StorageService.saveTeamRecord(target);
          } else {
            StorageService.saveTeamRecord({
              teamName: teamName.trim(),
              wheel1Result: 'Pending Spin',
              wheel2Result: 'Pending Spin',
              wheel3Result: 'Pending Spin',
              problemStatement: '',
              speedFeature: null,
              marketShift: this.currentDrawnMarketShift.title
            });
          }
          this.showToast('Done!');
        }
      });
    }
  }

  // --- UNIFIED EDITOR (WHEELS, SPEED FEATURES & MARKET SHIFTS) ---
  setupEditor() {
    const catButtons = document.querySelectorAll('.editor-cat-tab');
    catButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeEditorCategory = e.currentTarget.dataset.cat;
        catButtons.forEach(b => {
          b.classList.remove('bg-[#00C8FF]', 'text-slate-950');
          b.classList.add('bg-slate-800', 'text-slate-300');
        });
        e.currentTarget.classList.add('bg-[#00C8FF]', 'text-slate-950');
        e.currentTarget.classList.remove('bg-slate-800', 'text-slate-300');
        this.renderEditorView();
      });
    });

    const resetBtn = document.getElementById('reset-current-category-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!this.checkAdminPrivilege()) return;
        if (confirm(`Are you sure you want to reset "${this.activeEditorCategory}" to defaults?`)) {
          if (this.activeEditorCategory.startsWith('wheel')) {
            this.wheelsConfig = StorageService.resetWheels();
            Object.keys(this.wheelsConfig).forEach(wId => {
              if (this.wheelInstances[wId]) {
                this.wheelInstances[wId].updateConfig(this.wheelsConfig[wId]);
              }
            });
            this.updateItemCounts();
          } else if (this.activeEditorCategory === 'speed_features') {
            this.speedFeatures = StorageService.resetSpeedFeatures();
          } else if (this.activeEditorCategory === 'market_shifts') {
            this.marketShifts = StorageService.resetMarketShifts();
          }
          this.renderEditorView();
          this.showToast('Done!');
        }
      });
    }

    // Bulk Paste Modal Trigger & Save
    const bulkImportBtn = document.getElementById('bulk-import-btn');
    if (bulkImportBtn) {
      bulkImportBtn.addEventListener('click', () => {
        if (!this.checkAdminPrivilege()) return;
        const textarea = document.getElementById('bulk-paste-textarea');
        const text = textarea ? textarea.value : '';
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        if (lines.length > 0 && this.activeEditorCategory.startsWith('wheel')) {
          this.wheelsConfig[this.activeEditorCategory].items = lines;
          StorageService.saveWheels(this.wheelsConfig);
          this.wheelInstances[this.activeEditorCategory].updateConfig(this.wheelsConfig[this.activeEditorCategory]);
          this.updateItemCounts();
          this.renderEditorView();
          this.closeModal('bulk-import-modal');
          this.showToast('Done!');
        }
      });
    }
  }

  renderEditorView() {
    const titleEl = document.getElementById('editor-category-title');
    const addContainer = document.getElementById('editor-add-container');
    const itemsContainer = document.getElementById('editor-items-container');

    if (!titleEl || !addContainer || !itemsContainer) return;
    itemsContainer.innerHTML = '';
    addContainer.innerHTML = '';

    // CASE 1: WHEEL EDITING
    if (this.activeEditorCategory.startsWith('wheel')) {
      const wheelData = this.wheelsConfig[this.activeEditorCategory];
      titleEl.textContent = `Editing: ${wheelData.title}`;

      addContainer.innerHTML = `
        <div class="flex items-center gap-2">
          <input type="text" id="new-item-input" placeholder="Type new option text..." class="flex-1 bg-slate-900 border border-slate-700 text-slate-100 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#00C8FF]" />
          <button id="add-editor-item-btn" class="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl text-sm transition-colors flex items-center gap-1">
            <i data-lucide="plus" class="w-4 h-4"></i> Add
          </button>
        </div>
      `;

      document.getElementById('add-editor-item-btn')?.addEventListener('click', () => {
        if (!this.checkAdminPrivilege()) return;
        const input = document.getElementById('new-item-input');
        const text = input ? input.value.trim() : '';
        if (text) {
          this.wheelsConfig[this.activeEditorCategory].items.push(text);
          StorageService.saveWheels(this.wheelsConfig);
          this.wheelInstances[this.activeEditorCategory].updateConfig(this.wheelsConfig[this.activeEditorCategory]);
          this.updateItemCounts();
          this.renderEditorView();
          this.showToast('Done!');
        }
      });

      wheelData.items.forEach((item, index) => {
        const itemRow = document.createElement('div');
        itemRow.className = 'flex items-center gap-2 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60';
        itemRow.innerHTML = `
          <span class="text-xs font-mono font-semibold text-slate-400 w-6">${index + 1}.</span>
          <input type="text" value="${item.replace(/"/g, '&quot;')}" data-index="${index}" class="editor-wheel-input flex-1 bg-slate-900 border border-slate-700 text-slate-100 px-3 py-1.5 rounded text-sm focus:outline-none focus:border-[#00C8FF]" />
          <button data-index="${index}" class="delete-wheel-item-btn p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        `;
        itemsContainer.appendChild(itemRow);
      });

      itemsContainer.querySelectorAll('.editor-wheel-input').forEach(input => {
        input.addEventListener('change', (e) => {
          if (!this.checkAdminPrivilege()) return;
          const idx = parseInt(e.target.dataset.index);
          const val = e.target.value.trim();
          if (val) {
            this.wheelsConfig[this.activeEditorCategory].items[idx] = val;
            StorageService.saveWheels(this.wheelsConfig);
            this.wheelInstances[this.activeEditorCategory].updateConfig(this.wheelsConfig[this.activeEditorCategory]);
            this.showToast('Done!');
          }
        });
      });

      itemsContainer.querySelectorAll('.delete-wheel-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (!this.checkAdminPrivilege()) return;
          const idx = parseInt(e.currentTarget.dataset.index);
          this.wheelsConfig[this.activeEditorCategory].items.splice(idx, 1);
          StorageService.saveWheels(this.wheelsConfig);
          this.wheelInstances[this.activeEditorCategory].updateConfig(this.wheelsConfig[this.activeEditorCategory]);
          this.updateItemCounts();
          this.renderEditorView();
          this.showToast('Done!');
        });
      });
    }

    // CASE 2: SPEED FEATURES EDITING
    else if (this.activeEditorCategory === 'speed_features') {
      titleEl.textContent = `Editing: Speed Features Deck (${this.speedFeatures.length} Cards)`;

      addContainer.innerHTML = `
        <div class="space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" id="new-speed-title" placeholder="Card Title (e.g. ⚡ 30-Min Sprint)..." class="bg-slate-900 border border-slate-700 text-slate-100 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
            <input type="text" id="new-speed-badge" placeholder="Badge Tag (e.g. 30-Min Sprint)..." class="bg-slate-900 border border-slate-700 text-slate-100 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
          </div>
          <textarea id="new-speed-desc" rows="2" placeholder="Description of the speed twist..." class="w-full bg-slate-900 border border-slate-700 text-slate-100 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-amber-400"></textarea>
          <button id="add-speed-card-btn" class="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black rounded-xl text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
            <i data-lucide="plus" class="w-4 h-4"></i> Add Speed Feature Card
          </button>
        </div>
      `;

      document.getElementById('add-speed-card-btn')?.addEventListener('click', () => {
        if (!this.checkAdminPrivilege()) return;
        const title = document.getElementById('new-speed-title')?.value.trim();
        const badge = document.getElementById('new-speed-badge')?.value.trim() || 'Speed Twist';
        const desc = document.getElementById('new-speed-desc')?.value.trim();

        if (title && desc) {
          this.speedFeatures.push({
            id: 'sf-' + Date.now(),
            title,
            badge,
            description: desc
          });
          StorageService.saveSpeedFeatures(this.speedFeatures);
          this.renderEditorView();
          this.showToast('Done!');
        }
      });

      this.speedFeatures.forEach((card, index) => {
        const cardBox = document.createElement('div');
        cardBox.className = 'bg-slate-800/80 p-4 rounded-xl border border-amber-500/30 space-y-2 relative';
        cardBox.innerHTML = `
          <div class="flex items-center justify-between gap-2">
            <input type="text" value="${card.title.replace(/"/g, '&quot;')}" data-id="${card.id}" class="edit-speed-title font-bold text-sm text-[#FFC800] bg-slate-900 px-2 py-1 rounded border border-slate-700 w-full" />
            <button data-id="${card.id}" class="delete-speed-card-btn p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors flex-shrink-0">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
          <textarea data-id="${card.id}" rows="2" class="edit-speed-desc text-xs text-slate-200 bg-slate-900/80 px-2 py-1 rounded border border-slate-700 w-full">${card.description}</textarea>
        `;
        itemsContainer.appendChild(cardBox);
      });

      itemsContainer.querySelectorAll('.edit-speed-title, .edit-speed-desc').forEach(input => {
        input.addEventListener('change', (e) => {
          if (!this.checkAdminPrivilege()) return;
          const id = e.target.dataset.id;
          const card = this.speedFeatures.find(c => c.id === id);
          if (card) {
            if (e.target.classList.contains('edit-speed-title')) card.title = e.target.value.trim();
            if (e.target.classList.contains('edit-speed-desc')) card.description = e.target.value.trim();
            StorageService.saveSpeedFeatures(this.speedFeatures);
            this.showToast('Done!');
          }
        });
      });

      itemsContainer.querySelectorAll('.delete-speed-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (!this.checkAdminPrivilege()) return;
          const id = e.currentTarget.dataset.id;
          this.speedFeatures = this.speedFeatures.filter(c => c.id !== id);
          StorageService.saveSpeedFeatures(this.speedFeatures);
          this.renderEditorView();
          this.showToast('Done!');
        });
      });
    }

    // CASE 3: MARKET SHIFTS EDITING
    else if (this.activeEditorCategory === 'market_shifts') {
      titleEl.textContent = `Editing: Market Shifts Deck (${this.marketShifts.length} Cards)`;

      addContainer.innerHTML = `
        <div class="space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" id="new-shift-title" placeholder="Card Title (e.g. 📉 Severe Budget Cut)..." class="bg-slate-900 border border-slate-700 text-slate-100 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-purple-400" />
            <select id="new-shift-impact" class="bg-slate-900 border border-slate-700 text-slate-100 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-purple-400">
              <option value="High">Impact: High</option>
              <option value="Critical">Impact: Critical</option>
              <option value="Medium">Impact: Medium</option>
              <option value="Low">Impact: Low</option>
            </select>
          </div>
          <textarea id="new-shift-desc" rows="2" placeholder="Description of the market shift wildcard..." class="w-full bg-slate-900 border border-slate-700 text-slate-100 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-purple-400"></textarea>
          <button id="add-shift-card-btn" class="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
            <i data-lucide="plus" class="w-4 h-4"></i> Add Market Shift Card
          </button>
        </div>
      `;

      document.getElementById('add-shift-card-btn')?.addEventListener('click', () => {
        if (!this.checkAdminPrivilege()) return;
        const title = document.getElementById('new-shift-title')?.value.trim();
        const impact = document.getElementById('new-shift-impact')?.value || 'High';
        const desc = document.getElementById('new-shift-desc')?.value.trim();

        if (title && desc) {
          this.marketShifts.push({
            id: 'ms-' + Date.now(),
            title,
            impact,
            description: desc
          });
          StorageService.saveMarketShifts(this.marketShifts);
          this.renderEditorView();
          this.showToast('Done!');
        }
      });

      this.marketShifts.forEach((card, index) => {
        const cardBox = document.createElement('div');
        cardBox.className = 'bg-slate-800/80 p-4 rounded-xl border border-purple-500/30 space-y-2 relative';
        cardBox.innerHTML = `
          <div class="flex items-center justify-between gap-2">
            <input type="text" value="${card.title.replace(/"/g, '&quot;')}" data-id="${card.id}" class="edit-shift-title font-bold text-sm text-purple-300 bg-slate-900 px-2 py-1 rounded border border-slate-700 w-full" />
            <button data-id="${card.id}" class="delete-shift-card-btn p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors flex-shrink-0">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
          <textarea data-id="${card.id}" rows="2" class="edit-shift-desc text-xs text-slate-200 bg-slate-900/80 px-2 py-1 rounded border border-slate-700 w-full">${card.description}</textarea>
        `;
        itemsContainer.appendChild(cardBox);
      });

      itemsContainer.querySelectorAll('.edit-shift-title, .edit-shift-desc').forEach(input => {
        input.addEventListener('change', (e) => {
          if (!this.checkAdminPrivilege()) return;
          const id = e.target.dataset.id;
          const card = this.marketShifts.find(c => c.id === id);
          if (card) {
            if (e.target.classList.contains('edit-shift-title')) card.title = e.target.value.trim();
            if (e.target.classList.contains('edit-shift-desc')) card.description = e.target.value.trim();
            StorageService.saveMarketShifts(this.marketShifts);
            this.showToast('Done!');
          }
        });
      });

      itemsContainer.querySelectorAll('.delete-shift-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (!this.checkAdminPrivilege()) return;
          const id = e.currentTarget.dataset.id;
          this.marketShifts = this.marketShifts.filter(c => c.id !== id);
          StorageService.saveMarketShifts(this.marketShifts);
          this.renderEditorView();
          this.showToast('Done!');
        });
      });
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // --- MASTER TRACKER TABLE & PDF EXPORT ---
  setupMasterTracker() {
    const exportCsvBtn = document.getElementById('export-csv-btn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => StorageService.exportToCSV());
    }

    const exportJsonBtn = document.getElementById('export-json-btn');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => StorageService.exportFullBackup());
    }

    const importJsonInput = document.getElementById('import-json-file');
    if (importJsonInput) {
      importJsonInput.addEventListener('change', (e) => {
        if (!this.checkAdminPrivilege()) return;
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (StorageService.importFullBackup(event.target.result)) {
              location.reload();
            }
          };
          reader.readAsText(file);
        }
      });
    }

    const clearAllRecordsBtn = document.getElementById('clear-records-btn');
    if (clearAllRecordsBtn) {
      clearAllRecordsBtn.addEventListener('click', () => {
        if (!this.checkAdminPrivilege()) return;
        if (confirm('Are you sure you want to clear all team recorded combinations? This cannot be undone.')) {
          this.records = StorageService.clearAllRecords();
          this.renderMasterTrackerTable();
          this.showToast('Done!');
        }
      });
    }

    const searchInput = document.getElementById('tracker-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderMasterTrackerTable());
    }

    // PDF TRACKER EXPORT BUTTON
    const downloadPdfBtn = document.getElementById('download-tracker-pdf-btn');
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', () => {
        this.openTrackerPdfModal();
      });
    }

    const printTrackerPdfBtn = document.getElementById('print-tracker-pdf-btn');
    if (printTrackerPdfBtn) {
      printTrackerPdfBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  openTrackerPdfModal() {
    const modal = document.getElementById('printable-tracker-modal');
    const tbody = document.getElementById('printable-tracker-table-body');
    const timeEl = document.getElementById('print-timestamp');

    if (!modal || !tbody) return;
    tbody.innerHTML = '';

    const records = StorageService.getTeamRecords();
    if (timeEl) timeEl.textContent = new Date().toLocaleString();

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-gray-500 font-semibold">No team records recorded yet.</td></tr>`;
    } else {
      records.forEach((r, idx) => {
        const tr = document.createElement('tr');
        tr.className = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        tr.innerHTML = `
          <td class="p-2 border border-gray-300 font-bold text-black">${r.teamName}</td>
          <td class="p-2 border border-gray-300 text-gray-800">${r.wheel1Result || '-'}</td>
          <td class="p-2 border border-gray-300 text-gray-800 font-medium">${r.wheel2Result || '-'}</td>
          <td class="p-2 border border-gray-300 text-gray-800 font-medium">${r.wheel3Result || '-'}</td>
          <td class="p-2 border border-gray-300 text-gray-700 italic">${r.problemStatement || '-'}</td>
          <td class="p-2 border border-gray-300 font-semibold text-amber-800">${r.speedFeature || '-'}</td>
          <td class="p-2 border border-gray-300 font-semibold text-purple-800">${r.marketShift || '-'}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    modal.classList.remove('hidden');
  }

  renderMasterTrackerTable() {
    const tbody = document.getElementById('tracker-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const records = StorageService.getTeamRecords();
    const searchVal = (document.getElementById('tracker-search-input')?.value || '').toLowerCase();

    const filtered = records.filter(r => {
      return (r.teamName || '').toLowerCase().includes(searchVal) ||
        (r.wheel1Result || '').toLowerCase().includes(searchVal) ||
        (r.wheel2Result || '').toLowerCase().includes(searchVal) ||
        (r.wheel3Result || '').toLowerCase().includes(searchVal) ||
        (r.problemStatement || '').toLowerCase().includes(searchVal) ||
        (r.speedFeature || '').toLowerCase().includes(searchVal);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="px-6 py-8 text-center text-slate-400">
            <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-slate-500"></i>
            No team combinations recorded yet. Spin the wheels and click <strong>Record Combination</strong>!
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    filtered.forEach(record => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-800 hover:bg-slate-800/40 transition-colors';
      tr.innerHTML = `
        <td class="px-4 py-3 font-black text-[#00C8FF] whitespace-nowrap">${record.teamName}</td>
        <td class="px-4 py-3 text-slate-200 text-xs">${record.wheel1Result || '-'}</td>
        <td class="px-4 py-3 text-[#FFC800] text-xs font-medium">${record.wheel2Result || '-'}</td>
        <td class="px-4 py-3 text-[#FF2A85] text-xs font-medium">${record.wheel3Result || '-'}</td>
        <td class="px-4 py-3 text-slate-300 text-xs max-w-xs truncate" title="${(record.problemStatement || '').replace(/"/g, '&quot;')}">
          ${record.problemStatement ? `<span class="italic">"${record.problemStatement}"</span>` : '<span class="text-slate-500 italic">None</span>'}
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          ${record.speedFeature 
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-[#FFC800] border border-amber-500/40">${record.speedFeature}</span>` 
            : `<span class="text-slate-500 text-xs italic">None</span>`}
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          ${record.marketShift 
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">${record.marketShift}</span>` 
            : `<span class="text-slate-500 text-xs italic">None</span>`}
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <div class="flex items-center gap-1.5">
            <button data-id="${record.id}" class="view-card-btn px-2.5 py-1 bg-[#00C8FF]/10 hover:bg-[#00C8FF]/20 text-[#00C8FF] text-xs font-semibold rounded-lg border border-[#00C8FF]/40 transition-colors flex items-center gap-1">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i> Card
            </button>
            <button data-id="${record.id}" class="delete-record-btn p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded transition-colors">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();

    tbody.querySelectorAll('.view-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const rec = records.find(r => r.id === id);
        if (rec) this.showChallengeCardModal(rec);
      });
    });

    tbody.querySelectorAll('.delete-record-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!this.checkAdminPrivilege()) return;
        const id = e.currentTarget.dataset.id;
        if (confirm('Delete this team record?')) {
          this.records = StorageService.deleteTeamRecord(id);
          this.renderMasterTrackerTable();
          this.showToast('Done!');
        }
      });
    });
  }

  // --- ADMIN AUTHENTICATION CONTROLLER ---
  setupAdminAuth() {
    this.updateAdminStatusUI();

    const authBtn = document.getElementById('admin-auth-btn');
    if (authBtn) {
      authBtn.addEventListener('click', () => {
        const modal = document.getElementById('admin-login-modal');
        const loginForm = document.getElementById('admin-login-form');
        const loggedInPanel = document.getElementById('admin-logged-in-panel');

        if (StorageService.isAdminLoggedIn()) {
          loginForm?.classList.add('hidden');
          loggedInPanel?.classList.remove('hidden');
        } else {
          loginForm?.classList.remove('hidden');
          loggedInPanel?.classList.add('hidden');
        }
        modal?.classList.remove('hidden');
      });
    }

    document.getElementById('submit-admin-login-btn')?.addEventListener('click', () => {
      const u = document.getElementById('admin-username-input')?.value.trim();
      const p = document.getElementById('admin-password-input')?.value;
      const creds = StorageService.getAdminCredentials();

      if (u === creds.username && p === creds.password) {
        StorageService.setAdminLoggedIn(true);
        this.updateAdminStatusUI();
        this.closeModal('admin-login-modal');
        this.showToast('Done!');
      } else {
        alert('Invalid admin credentials!');
      }
    });

    document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
      StorageService.setAdminLoggedIn(false);
      this.updateAdminStatusUI();
      this.closeModal('admin-login-modal');
      this.showToast('Done!');
    });

    document.getElementById('change-admin-password-btn')?.addEventListener('click', () => {
      const newPass = document.getElementById('new-admin-password-input')?.value;
      if (newPass && newPass.length >= 3) {
        const creds = StorageService.getAdminCredentials();
        StorageService.setAdminCredentials(creds.username, newPass);
        this.showToast('Done!');
      } else {
        alert('Password must be at least 3 characters.');
      }
    });
  }

  updateAdminStatusUI() {
    const label = document.getElementById('admin-auth-label');
    const authBtn = document.getElementById('admin-auth-btn');
    const isLoggedIn = StorageService.isAdminLoggedIn();

    if (label && authBtn) {
      if (isLoggedIn) {
        label.textContent = 'Admin: Logged In';
        authBtn.className = 'px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5';
      } else {
        label.textContent = 'Admin Login';
        authBtn.className = 'px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5';
      }
    }
  }

  checkAdminPrivilege() {
    if (!StorageService.isAdminLoggedIn()) {
      alert('🔒 Administrator login required to perform this action.');
      document.getElementById('admin-auth-btn')?.click();
      return false;
    }
    return true;
  }

  // --- MODALS & CHALLENGE CARDS ---
  setupModals() {
    const openBulkBtn = document.getElementById('open-bulk-import-modal-btn');
    if (openBulkBtn) {
      openBulkBtn.addEventListener('click', () => {
        if (!this.checkAdminPrivilege()) return;
        const modal = document.getElementById('bulk-import-modal');
        if (modal && this.activeEditorCategory.startsWith('wheel')) {
          const textarea = document.getElementById('bulk-paste-textarea');
          if (textarea) textarea.value = this.wheelsConfig[this.activeEditorCategory].items.join('\n');
          modal.classList.remove('hidden');
        } else {
          alert('Bulk paste is available when editing spin wheels.');
        }
      });
    }

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.currentTarget.closest('.modal-root');
        if (modal) modal.classList.add('hidden');
      });
    });

    const printCardBtn = document.getElementById('print-challenge-card-btn');
    if (printCardBtn) {
      printCardBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  showChallengeCardModal(record) {
    const modal = document.getElementById('challenge-card-modal');
    if (!modal) return;

    document.getElementById('card-team-name').textContent = record.teamName;
    document.getElementById('card-wheel1-val').textContent = record.wheel1Result || 'Not Assigned';
    document.getElementById('card-wheel2-val').textContent = record.wheel2Result || 'Not Assigned';
    document.getElementById('card-wheel3-val').textContent = record.wheel3Result || 'Not Assigned';
    
    const problemEl = document.getElementById('card-problem-val');
    if (problemEl) {
      problemEl.textContent = record.problemStatement ? `"${record.problemStatement}"` : 'Not Generated';
    }

    const speedTwistEl = document.getElementById('card-speedtwist-val');
    if (speedTwistEl) {
      speedTwistEl.textContent = record.speedFeature || 'None';
    }

    const marketShiftVal = document.getElementById('card-marketshift-val');
    if (marketShiftVal) {
      marketShiftVal.textContent = record.marketShift || 'None';
    }

    modal.classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new EventSpinApp();
});
