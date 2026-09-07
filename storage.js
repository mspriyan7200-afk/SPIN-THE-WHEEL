/**
 * LocalStorage Manager & Data Export/Import Service
 */

import { DEFAULT_WHEELS, DEFAULT_MARKET_SHIFTS } from './data.js';

const STORAGE_KEYS = {
  WHEELS: 'event_spin_wheels_config',
  RECORDS: 'event_spin_team_records',
  MARKET_SHIFTS: 'event_spin_market_shifts'
};

export class StorageService {
  static getWheels() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WHEELS);
      if (data) {
        const parsed = JSON.parse(data);
        // Fallback check to ensure all 3 wheels exist
        return {
          wheel1: parsed.wheel1 || DEFAULT_WHEELS.wheel1,
          wheel2: parsed.wheel2 || DEFAULT_WHEELS.wheel2,
          wheel3: parsed.wheel3 || DEFAULT_WHEELS.wheel3
        };
      }
    } catch (e) {
      console.error('Failed to parse wheel data from storage', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_WHEELS));
  }

  static saveWheels(wheelsConfig) {
    try {
      localStorage.setItem(STORAGE_KEYS.WHEELS, JSON.stringify(wheelsConfig));
    } catch (e) {
      console.error('Failed to save wheels config', e);
    }
  }

  static resetWheels() {
    localStorage.removeItem(STORAGE_KEYS.WHEELS);
    return JSON.parse(JSON.stringify(DEFAULT_WHEELS));
  }

  static getTeamRecords() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse team records from storage', e);
    }
    return [];
  }

  static saveTeamRecord(record) {
    const records = this.getTeamRecords();
    // Check if team already exists (update if so, or add new)
    const existingIdx = records.findIndex(r => r.teamName.trim().toLowerCase() === record.teamName.trim().toLowerCase());
    
    if (existingIdx >= 0) {
      records[existingIdx] = {
        ...records[existingIdx],
        ...record,
        updatedAt: new Date().toISOString()
      };
    } else {
      records.push({
        id: 'team-' + Date.now(),
        ...record,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save team record', e);
    }
    return records;
  }

  static deleteTeamRecord(recordId) {
    let records = this.getTeamRecords();
    records = records.filter(r => r.id !== recordId);
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to delete team record', e);
    }
    return records;
  }

  static clearAllRecords() {
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    return [];
  }

  static getMarketShifts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MARKET_SHIFTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse market shifts', e);
    }
    return DEFAULT_MARKET_SHIFTS;
  }

  static saveMarketShifts(shifts) {
    try {
      localStorage.setItem(STORAGE_KEYS.MARKET_SHIFTS, JSON.stringify(shifts));
    } catch (e) {
      console.error('Failed to save market shifts', e);
    }
  }

  // Export Master combination tracker to CSV file
  static exportToCSV() {
    const records = this.getTeamRecords();
    if (records.length === 0) {
      alert('No team records available to export.');
      return;
    }

    const headers = ['Team Name', 'Digital Experience (Wheel 1)', 'Product/Object (Wheel 2)', 'Target User/Constraint (Wheel 3)', 'Market Shift', 'Recorded At'];
    
    const rows = records.map(r => [
      `"${r.teamName.replace(/"/g, '""')}"`,
      `"${(r.wheel1Result || '').replace(/"/g, '""')}"`,
      `"${(r.wheel2Result || '').replace(/"/g, '""')}"`,
      `"${(r.wheel3Result || '').replace(/"/g, '""')}"`,
      `"${(r.marketShift || 'None').replace(/"/g, '""')}"`,
      `"${new Date(r.updatedAt || r.createdAt).toLocaleString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Master_Team_Combinations_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export full JSON Backup
  static exportFullBackup() {
    const backup = {
      version: 1.0,
      timestamp: new Date().toISOString(),
      wheels: this.getWheels(),
      records: this.getTeamRecords(),
      marketShifts: this.getMarketShifts()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Event_Spin_Backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Import JSON Backup
  static importFullBackup(jsonContent) {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.wheels) this.saveWheels(parsed.wheels);
      if (parsed.records) localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(parsed.records));
      if (parsed.marketShifts) this.saveMarketShifts(parsed.marketShifts);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      alert('Invalid JSON backup file.');
      return false;
    }
  }
}
