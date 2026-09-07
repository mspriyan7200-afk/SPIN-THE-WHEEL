/**
 * Main Application Controller & UI Logic
 */

import { StorageService } from './storage.js';
import { SpinWheel } from './wheel.js';
import { soundEngine } from './audio.js';

class EventSpinApp {
  constructor() {
    this.wheelsConfig = StorageService.getWheels();
    this.records = StorageService.getTeamRecords();
    this.marketShifts = StorageService.getMarketShifts();

    this.wheelInstances = {};
    this.currentResults = {
      wheel1: null,
      wheel2: null,
      wheel3: null
    };

    this.activeTab = 'spin-room';
    this.activeEditorWheel = 'wheel1';
    this.currentDrawnCard = null;

    this.init();
  }

  init() {
    this.setupTabNavigation();
    this.setupWheels();
    this.setupAudioToggle();
    this.setupSpinRoomControls();
    this.setupWheelEditor();
    this.setupMasterTracker();
    this.setupMarketShiftDeck();
    this.setupModals();

    window.addEventListener('resize', () => {
      Object.values(this.wheelInstances).forEach(w => w.resizeCanvas());
    });
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
        btn.classList.add('bg-slate-700', 'text-sky-400', 'border-b-2', 'border-sky-400');
        btn.classList.remove('text-slate-400', 'hover:text-slate-200');
      } else {
        btn.classList.remove('bg-slate-700', 'text-sky-400', 'border-b-2', 'border-sky-400');
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
      this.renderEditorForm();
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
        : '<i data-lucide="volume-2" class="w-5 h-5 text-emerald-400"></i>';
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
    // Individual spin buttons
    ['wheel1', 'wheel2', 'wheel3'].forEach(wheelId => {
      const btn = document.getElementById(`spin-${wheelId}-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.clearResultDisplay(wheelId);
          this.wheelInstances[wheelId].spin();
        });
      }
    });

    // SPIN ALL 3 BUTTON
    const spinAllBtn = document.getElementById('spin-all-btn');
    if (spinAllBtn) {
      spinAllBtn.addEventListener('click', () => {
        this.spinAllWheels();
      });
    }

    // RECORD FOR TEAM BUTTON
    const recordBtn = document.getElementById('record-combination-btn');
    if (recordBtn) {
      recordBtn.addEventListener('click', () => {
        this.recordCurrentCombination();
      });
    }

    // POPULATE TEAM QUICK SELECTOR
    this.updateTeamDropdown();
  }

  spinAllWheels() {
    ['wheel1', 'wheel2', 'wheel3'].forEach(wheelId => {
      this.clearResultDisplay(wheelId);
      // Small staggered impulse for realistic dynamic multi-spin
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
      badge.classList.remove('bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/50');
      badge.classList.add('bg-slate-800', 'text-slate-400', 'animate-pulse');
    }
  }

  handleWheelFinish(wheelId, item) {
    this.currentResults[wheelId] = item;
    const badge = document.getElementById(`${wheelId}-result-badge`);
    if (badge) {
      badge.textContent = item;
      badge.classList.remove('bg-slate-800', 'text-slate-400', 'animate-pulse');
      badge.classList.add('bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/50');
    }

    // Check if all 3 wheels have completed
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

    // Ensure all 3 wheels have landed or get current static pointer positions
    const wheel1Res = this.currentResults.wheel1 || this.wheelInstances.wheel1.getCurrentWinningItem();
    const wheel2Res = this.currentResults.wheel2 || this.wheelInstances.wheel2.getCurrentWinningItem();
    const wheel3Res = this.currentResults.wheel3 || this.wheelInstances.wheel3.getCurrentWinningItem();

    const record = {
      teamName: teamName,
      wheel1Result: wheel1Res,
      wheel2Result: wheel2Res,
      wheel3Result: wheel3Res,
      marketShift: null
    };

    this.records = StorageService.saveTeamRecord(record);
    this.triggerConfetti();
    this.updateTeamDropdown();

    alert(`✅ Recorded Combination for "${teamName}":\n\n- Digital Experience: ${wheel1Res}\n- Product/Object: ${wheel2Res}\n- Constraint: ${wheel3Res}`);
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

  // --- WHEEL EDITOR ---
  setupWheelEditor() {
    const editorWheelButtons = document.querySelectorAll('.editor-wheel-tab');
    editorWheelButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeEditorWheel = e.currentTarget.dataset.wheel;
        editorWheelButtons.forEach(b => {
          b.classList.remove('bg-sky-500', 'text-white');
          b.classList.add('bg-slate-800', 'text-slate-300');
        });
        e.currentTarget.classList.add('bg-sky-500', 'text-white');
        e.currentTarget.classList.remove('bg-slate-800', 'text-slate-300');
        this.renderEditorForm();
      });
    });

    const resetWheelsBtn = document.getElementById('reset-wheels-btn');
    if (resetWheelsBtn) {
      resetWheelsBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all 3 spin wheels to event defaults?')) {
          this.wheelsConfig = StorageService.resetWheels();
          Object.keys(this.wheelsConfig).forEach(wId => {
            if (this.wheelInstances[wId]) {
              this.wheelInstances[wId].updateConfig(this.wheelsConfig[wId]);
            }
          });
          this.renderEditorForm();
          alert('Wheels reset to event defaults.');
        }
      });
    }

    const addItemBtn = document.getElementById('add-editor-item-btn');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', () => {
        const input = document.getElementById('new-item-input');
        const text = input ? input.value.trim() : '';
        if (text) {
          this.wheelsConfig[this.activeEditorWheel].items.push(text);
          StorageService.saveWheels(this.wheelsConfig);
          this.wheelInstances[this.activeEditorWheel].updateConfig(this.wheelsConfig[this.activeEditorWheel]);
          input.value = '';
          this.renderEditorForm();
        }
      });
    }

    // BULK PASTE IMPORT
    const bulkImportBtn = document.getElementById('bulk-import-btn');
    if (bulkImportBtn) {
      bulkImportBtn.addEventListener('click', () => {
        const textarea = document.getElementById('bulk-paste-textarea');
        const text = textarea ? textarea.value : '';
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        if (lines.length > 0) {
          this.wheelsConfig[this.activeEditorWheel].items = lines;
          StorageService.saveWheels(this.wheelsConfig);
          this.wheelInstances[this.activeEditorWheel].updateConfig(this.wheelsConfig[this.activeEditorWheel]);
          this.renderEditorForm();
          this.closeModal('bulk-import-modal');
          alert(`Successfully updated ${this.wheelsConfig[this.activeEditorWheel].title} with ${lines.length} items!`);
        }
      });
    }
  }

  renderEditorForm() {
    const wheelData = this.wheelsConfig[this.activeEditorWheel];
    const titleEl = document.getElementById('editor-wheel-title');
    if (titleEl) titleEl.textContent = `Editing: ${wheelData.title}`;

    const itemsContainer = document.getElementById('editor-items-container');
    if (!itemsContainer) return;
    itemsContainer.innerHTML = '';

    wheelData.items.forEach((item, index) => {
      const itemRow = document.createElement('div');
      itemRow.className = 'flex items-center gap-2 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60';
      itemRow.innerHTML = `
        <span class="text-xs font-mono font-semibold text-slate-400 w-6">${index + 1}.</span>
        <input type="text" value="${item.replace(/"/g, '&quot;')}" data-index="${index}" class="editor-item-input flex-1 bg-slate-900 border border-slate-700 text-slate-100 px-3 py-1.5 rounded text-sm focus:outline-none focus:border-sky-500" />
        <button data-index="${index}" class="delete-item-btn p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      `;
      itemsContainer.appendChild(itemRow);
    });

    if (window.lucide) window.lucide.createIcons();

    // Attach edit listeners
    itemsContainer.querySelectorAll('.editor-item-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const val = e.target.value.trim();
        if (val) {
          this.wheelsConfig[this.activeEditorWheel].items[idx] = val;
          StorageService.saveWheels(this.wheelsConfig);
          this.wheelInstances[this.activeEditorWheel].updateConfig(this.wheelsConfig[this.activeEditorWheel]);
        }
      });
    });

    // Attach delete listeners
    itemsContainer.querySelectorAll('.delete-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        this.wheelsConfig[this.activeEditorWheel].items.splice(idx, 1);
        StorageService.saveWheels(this.wheelsConfig);
        this.wheelInstances[this.activeEditorWheel].updateConfig(this.wheelsConfig[this.activeEditorWheel]);
        this.renderEditorForm();
      });
    });
  }

  // --- MASTER TRACKER TABLE ---
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
        if (confirm('Are you sure you want to clear all team recorded combinations? This cannot be undone.')) {
          this.records = StorageService.clearAllRecords();
          this.renderMasterTrackerTable();
        }
      });
    }

    const searchInput = document.getElementById('tracker-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderMasterTrackerTable());
    }
  }

  renderMasterTrackerTable() {
    const tbody = document.getElementById('tracker-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const records = StorageService.getTeamRecords();
    const searchVal = (document.getElementById('tracker-search-input')?.value || '').toLowerCase();

    const filtered = records.filter(r => {
      return r.teamName.toLowerCase().includes(searchVal) ||
        (r.wheel1Result || '').toLowerCase().includes(searchVal) ||
        (r.wheel2Result || '').toLowerCase().includes(searchVal) ||
        (r.wheel3Result || '').toLowerCase().includes(searchVal);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-8 text-center text-slate-400">
            <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-slate-500"></i>
            No team combinations recorded yet. Spin the wheels and click <strong>Record for Team</strong>!
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
        <td class="px-6 py-4 font-semibold text-sky-300 whitespace-nowrap">${record.teamName}</td>
        <td class="px-6 py-4 text-slate-200">${record.wheel1Result || '-'}</td>
        <td class="px-6 py-4 text-amber-300 font-medium">${record.wheel2Result || '-'}</td>
        <td class="px-6 py-4 text-rose-300 font-medium">${record.wheel3Result || '-'}</td>
        <td class="px-6 py-4">
          ${record.marketShift 
            ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">${record.marketShift}</span>` 
            : `<span class="text-slate-500 text-xs italic">None</span>`}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center gap-2">
            <button data-id="${record.id}" class="view-card-btn px-3 py-1.5 bg-sky-600/30 hover:bg-sky-600 text-sky-200 text-xs font-medium rounded-lg border border-sky-500/40 transition-colors flex items-center gap-1">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i> Challenge Card
            </button>
            <button data-id="${record.id}" class="delete-record-btn p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded transition-colors">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();

    // Attach card view listeners
    tbody.querySelectorAll('.view-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const rec = records.find(r => r.id === id);
        if (rec) this.showChallengeCardModal(rec);
      });
    });

    // Attach delete record listeners
    tbody.querySelectorAll('.delete-record-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Delete this team record?')) {
          this.records = StorageService.deleteTeamRecord(id);
          this.renderMasterTrackerTable();
        }
      });
    });
  }

  // --- MARKET SHIFT DECK ---
  setupMarketShiftDeck() {
    const drawBtn = document.getElementById('draw-market-shift-btn');
    const cardContainer = document.getElementById('market-shift-card-container');

    if (drawBtn && cardContainer) {
      drawBtn.addEventListener('click', () => {
        // Pick random Market Shift card
        const randomIndex = Math.floor(Math.random() * this.marketShifts.length);
        const card = this.marketShifts[randomIndex];
        this.currentDrawnCard = card;

        // Reset flip state first
        cardContainer.classList.remove('flipped');

        setTimeout(() => {
          const titleEl = document.getElementById('card-back-title');
          const descEl = document.getElementById('card-back-desc');
          const impactEl = document.getElementById('card-back-impact');

          if (titleEl) titleEl.textContent = card.title;
          if (descEl) descEl.textContent = card.description;
          if (impactEl) impactEl.textContent = `Impact Level: ${card.impact}`;

          cardContainer.classList.add('flipped');
          soundEngine.playFanfare();
          this.triggerConfetti();
        }, 150);
      });
    }

    // ASSIGN TO TEAM BUTTON
    const assignBtn = document.getElementById('assign-shift-to-team-btn');
    if (assignBtn) {
      assignBtn.addEventListener('click', () => {
        if (!this.currentDrawnCard) {
          alert('Please draw a Market Shift card first!');
          return;
        }

        const teamName = prompt('Enter the Team Name or Team # to assign this Market Shift wildcard to:');
        if (teamName && teamName.trim()) {
          const records = StorageService.getTeamRecords();
          const target = records.find(r => r.teamName.toLowerCase() === teamName.trim().toLowerCase());

          if (target) {
            target.marketShift = this.currentDrawnCard.title;
            StorageService.saveTeamRecord(target);
            alert(`✅ Market Shift "${this.currentDrawnCard.title}" assigned to ${target.teamName}!`);
          } else {
            // Create new record for team with market shift
            StorageService.saveTeamRecord({
              teamName: teamName.trim(),
              wheel1Result: 'Pending Spin',
              wheel2Result: 'Pending Spin',
              wheel3Result: 'Pending Spin',
              marketShift: this.currentDrawnCard.title
            });
            alert(`✅ Created entry for ${teamName.trim()} with Market Shift "${this.currentDrawnCard.title}"!`);
          }
        }
      });
    }
  }

  // --- MODALS & CHALLENGE CARDS ---
  setupModals() {
    // Bulk Import Modal Trigger
    const openBulkBtn = document.getElementById('open-bulk-import-modal-btn');
    if (openBulkBtn) {
      openBulkBtn.addEventListener('click', () => {
        const modal = document.getElementById('bulk-import-modal');
        if (modal) {
          const textarea = document.getElementById('bulk-paste-textarea');
          if (textarea) textarea.value = this.wheelsConfig[this.activeEditorWheel].items.join('\n');
          modal.classList.remove('hidden');
        }
      });
    }

    // Modal Close Buttons
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.currentTarget.closest('.modal-root');
        if (modal) modal.classList.add('hidden');
      });
    });

    // PRINT CHALLENGE CARD BUTTON
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
    
    const marketShiftVal = document.getElementById('card-marketshift-val');
    if (marketShiftVal) {
      marketShiftVal.textContent = record.marketShift || 'None';
    }

    modal.classList.remove('hidden');
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new EventSpinApp();
});
