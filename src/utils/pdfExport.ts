import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { DayData, LogEntry } from '../types';
import { BRISTOL_TYPES, STOOL_COLORS, QUICK_TAGS } from '../constants';
import { calculateStats, getTypeDistribution, getTagCorrelations, getColorDistribution } from './index';

interface ExportOptions {
  history: DayData[];
  filterType: 'all' | 'month';
  selectedDate: Date;
  filteredHistory: DayData[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getHealthColorHex = (health: string): string => {
  switch (health) {
    case 'healthy': return '#4ADE80';
    case 'warning': return '#FBBF24';
    case 'alert': return '#F87171';
    case 'constipated': return '#A78BFA';
    default: return '#94A3B8';
  }
};

const getBristolTypeName = (type: number): string => {
  return BRISTOL_TYPES[type - 1]?.name || 'Unknown';
};

const getColorName = (colorId: string): string => {
  return STOOL_COLORS.find(c => c.id === colorId)?.name || colorId;
};

const getTagLabel = (tagId: string): string => {
  return QUICK_TAGS.find(t => t.id === tagId)?.label || tagId;
};

const formatDateForReport = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTimeForReport = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const generateHTMLReport = (options: ExportOptions): string => {
  const { history, filterType, selectedDate, filteredHistory } = options;
  const stats = calculateStats(filteredHistory);
  const typeDistribution = getTypeDistribution(filteredHistory);
  const colorDistribution = getColorDistribution(filteredHistory);
  const tagCorrelations = getTagCorrelations(filteredHistory, QUICK_TAGS);
  const totalEntries = filteredHistory.flatMap(d => d.entries).length;

  const periodText = filterType === 'all'
    ? 'All Time'
    : `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  const exportDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get recent entries (last 14 days worth of data)
  const recentDays = filteredHistory.slice(0, 14);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flushy Health Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.5;
      padding: 24px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
      padding: 32px;
      color: white;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .header .subtitle {
      opacity: 0.9;
      font-size: 14px;
    }
    .header .period {
      margin-top: 16px;
      background: rgba(255,255,255,0.2);
      display: inline-block;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
    }
    .content {
      padding: 24px;
    }
    .section {
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 12px;
      font-weight: 600;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .stat-card {
      background: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #1e293b;
    }
    .stat-value.healthy { color: #4ADE80; }
    .stat-value.warning { color: #FBBF24; }
    .stat-value.alert { color: #F87171; }
    .stat-label {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .stat-unit {
      font-size: 14px;
      color: #94a3b8;
      font-weight: 400;
    }
    .distribution-table {
      width: 100%;
      border-collapse: collapse;
    }
    .distribution-table th,
    .distribution-table td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .distribution-table th {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 600;
      background: #f8fafc;
    }
    .distribution-table tr:last-child td {
      border-bottom: none;
    }
    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .type-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .bar-container {
      width: 120px;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }
    .bar {
      height: 100%;
      border-radius: 4px;
    }
    .color-swatch {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid rgba(0,0,0,0.1);
    }
    .entries-list {
      background: #f8fafc;
      border-radius: 12px;
      overflow: hidden;
    }
    .entry-day {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
    }
    .entry-day:last-child {
      border-bottom: none;
    }
    .entry-date {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
    }
    .entry-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .entry-item {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .tag-item {
      background: #f8fafc;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
    }
    .tag-item strong {
      color: #1e293b;
    }
    .tag-item span {
      color: #64748b;
    }
    .footer {
      background: #f8fafc;
      padding: 20px 24px;
      border-top: 1px solid #e2e8f0;
    }
    .footer-text {
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.6;
    }
    .disclaimer-box {
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 20px;
    }
    .disclaimer-title {
      font-size: 13px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 6px;
    }
    .disclaimer-text {
      font-size: 12px;
      color: #a16207;
      line-height: 1.5;
    }
    .gut-score-card {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      margin-bottom: 20px;
    }
    .gut-score-value {
      font-size: 56px;
      font-weight: 800;
    }
    .gut-score-label {
      font-size: 14px;
      color: #059669;
      font-weight: 500;
    }
    .gut-score-desc {
      margin-top: 8px;
      font-size: 13px;
      color: #047857;
    }
    .no-data {
      color: #94a3b8;
      font-style: italic;
      padding: 12px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Digestive Health Report</h1>
      <div class="subtitle">Generated by Flushy</div>
      <div class="period">${periodText} • ${totalEntries} entries</div>
    </div>

    <div class="content">
      <div class="disclaimer-box">
        <div class="disclaimer-title">Important Medical Disclaimer</div>
        <div class="disclaimer-text">
          This report is for informational purposes only and does not constitute medical advice.
          The Bristol Stool Scale is a diagnostic tool, but proper interpretation requires a healthcare professional.
          Always consult your doctor for any digestive health concerns.
        </div>
      </div>

      <div class="section">
        <div class="section-title">Summary Statistics</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value ${stats.streak >= 3 ? 'healthy' : stats.streak >= 1 ? 'warning' : 'alert'}">${stats.streak}</div>
            <div class="stat-label">Day Streak</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.weekCount}</div>
            <div class="stat-label">Logs This Week</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.avgType}</div>
            <div class="stat-label">Average Type</div>
          </div>
        </div>
      </div>

      ${stats.healthScore !== null ? `
      <div class="section">
        <div class="gut-score-card" style="background: ${stats.healthScore >= 70 ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : stats.healthScore >= 40 ? 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)'};">
          <div class="gut-score-label">Gut Health Score</div>
          <div class="gut-score-value" style="color: ${stats.healthScore >= 70 ? '#059669' : stats.healthScore >= 40 ? '#ca8a04' : '#dc2626'};">${stats.healthScore}</div>
          <div class="gut-score-desc" style="color: ${stats.healthScore >= 70 ? '#047857' : stats.healthScore >= 40 ? '#a16207' : '#b91c1c'};">
            ${stats.healthScore >= 76
              ? 'Excellent! Your digestive health appears to be in great shape.'
              : stats.healthScore >= 51
                ? 'Good. Your digestive health shows positive patterns.'
                : stats.healthScore >= 26
                  ? 'Fair. Consider reviewing diet and hydration.'
                  : 'Needs attention. Review with a healthcare provider.'}
          </div>
        </div>
      </div>
      ` : `
      <div class="section">
        <div class="section-title">Gut Health Score</div>
        <p class="no-data">Not enough data. At least 3 entries are needed to calculate a score.</p>
      </div>
      `}

      <div class="section">
        <div class="section-title">Stool Type Distribution (Bristol Scale)</div>
        <table class="distribution-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Count</th>
              <th>Frequency</th>
            </tr>
          </thead>
          <tbody>
            ${typeDistribution.map(item => {
              const percentage = totalEntries > 0 ? Math.round((item.count / totalEntries) * 100) : 0;
              return `
              <tr>
                <td>
                  <span class="type-badge">
                    <span class="type-indicator" style="background: ${getHealthColorHex(item.health)};"></span>
                    Type ${item.type}
                  </span>
                </td>
                <td>${item.name} <small style="color: #94a3b8;">(${item.desc})</small></td>
                <td>${item.count}</td>
                <td>
                  <div class="bar-container">
                    <div class="bar" style="width: ${percentage}%; background: ${getHealthColorHex(item.health)};"></div>
                  </div>
                </td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      ${colorDistribution.length > 0 ? `
      <div class="section">
        <div class="section-title">Stool Color Distribution</div>
        <table class="distribution-table">
          <thead>
            <tr>
              <th>Color</th>
              <th>Significance</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${colorDistribution.map(item => `
            <tr>
              <td>
                <span class="type-badge">
                  <span class="color-swatch" style="background: ${item.hex};"></span>
                  ${item.name}
                </span>
              </td>
              <td>${item.description}</td>
              <td>${item.count}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${tagCorrelations.length > 0 ? `
      <div class="section">
        <div class="section-title">Factors & Correlations</div>
        <div class="tag-list">
          ${tagCorrelations.slice(0, 8).map(tag => `
          <div class="tag-item">
            <strong>${tag.label}</strong>
            <span>• ${tag.count}× logged • Avg Type ${tag.avgType}</span>
          </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Recent Activity</div>
        <div class="entries-list">
          ${recentDays.length > 0 ? recentDays.map(day => `
          <div class="entry-day">
            <div class="entry-date">${formatDateForReport(day.date)}</div>
            <div class="entry-items">
              ${day.entries.map(entry => {
                const typeName = getBristolTypeName(entry.type);
                const colorName = entry.color ? getColorName(entry.color) : null;
                const bristol = BRISTOL_TYPES[entry.type - 1];
                return `
                <div class="entry-item">
                  <span class="type-indicator" style="background: ${getHealthColorHex(bristol?.health || 'normal')};"></span>
                  Type ${entry.type} (${typeName})
                  ${colorName ? `<span style="color: #64748b;">• ${colorName}</span>` : ''}
                  ${entry.tags.length > 0 ? `<span style="color: #94a3b8;">• ${entry.tags.map(t => getTagLabel(t)).join(', ')}</span>` : ''}
                </div>
                `;
              }).join('')}
            </div>
          </div>
          `).join('') : '<p class="no-data" style="padding: 16px;">No entries in this period.</p>'}
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-text">
        Report generated on ${exportDate}.<br>
        Classifications based on the Bristol Stool Scale, a medical diagnostic tool developed at Bristol Royal Infirmary.<br>
        Health guidelines follow recommendations from the World Gastroenterology Organisation (WGO) and WHO.<br><br>
        <strong>Flushy</strong> • All data is stored locally on your device. We do not collect or store any personal health information.
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export const exportToPDF = async (options: ExportOptions): Promise<boolean> => {
  try {
    const html = generateHTMLReport(options);

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Rename the file with a proper name
    const fileName = `Flushy-Health-Report-${new Date().toISOString().split('T')[0]}.pdf`;
    const newPath = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.moveAsync({
      from: uri,
      to: newPath,
    });

    await Sharing.shareAsync(newPath, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Health Report',
      UTI: 'com.adobe.pdf',
    });

    return true;
  } catch (error) {
    console.error('Failed to export PDF:', error);
    return false;
  }
};
