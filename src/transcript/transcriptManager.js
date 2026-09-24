/**
 * Conversation Transcript & Compliance Exporter
 * Tracks dual-sided conversation history between Deaf visitor and service staff,
 * with export to JSON, Plain Text, and Printable Service Receipt.
 */

export class TranscriptManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.entries = [];
  }

  addEntry({ speaker, text, originalText = null, langName = null, langNative = null, signId = null, emotion = null, emoji = null, confidence = null, time = null }) {
    const entry = {
      id: `TR_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      speaker: speaker || 'Customer', // 'Customer' | 'Staff' | 'System'
      text: text || '',
      originalText: originalText || null,
      langName: langName || null,
      langNative: langNative || null,
      signId: signId || null,
      emotion: emotion || null,
      emoji: emoji || null,
      confidence: confidence || null,
      timestamp: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toLocaleDateString()
    };

    this.entries.push(entry);
    this.render();
    return entry;
  }

  clear() {
    this.entries = [];
    this.render();
  }

  getEntries() {
    return [...this.entries];
  }

  render() {
    if (!this.container) return;

    if (this.entries.length === 0) {
      this.container.innerHTML = `
        <div class="transcript-empty">
          <p class="empty-hint">Live translation transcript will appear here in real-time as interaction takes place.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="transcript-feed">
        ${this.entries.map(entry => `
          <div class="transcript-bubble bubble-${entry.speaker.toLowerCase()} animate-slide-up">
            <div class="bubble-header">
              <span class="bubble-speaker">
                ${entry.speaker === 'Customer' ? '👤 Visitor (Sign)' : (entry.speaker === 'Staff' ? '🏢 Counter Staff' : '⚙️ System')}
              </span>
              <span class="bubble-time">${entry.timestamp}</span>
            </div>
            <div class="bubble-body">
              <p class="bubble-text">${entry.text}</p>
              ${entry.originalText && entry.originalText !== entry.text ? `
                <p class="bubble-subtext" style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px; font-style: italic;">
                  English Source: "${entry.originalText}"
                </p>
              ` : ''}
              ${entry.confidence || entry.langNative || entry.emoji || entry.signId ? `
                <div class="bubble-meta">
                  ${entry.emoji && entry.emotion ? `<span class="sign-tag emotion-tag" style="background: rgba(244,63,94,0.18); color: #fda4af;">${entry.emoji} ${entry.emotion}</span>` : ''}
                  ${entry.confidence ? `<span class="confidence-tag">Confidence: ${entry.confidence}%</span>` : ''}
                  ${entry.langNative ? `<span class="sign-tag" style="background: rgba(236,72,153,0.2); color: #f472b6;">🌐 ${entry.langNative} (${entry.langName})</span>` : ''}
                  ${entry.signId ? `<span class="sign-tag">Sign: ${entry.signId}</span>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Auto scroll to bottom of transcript
    this.container.scrollTop = this.container.scrollHeight;
  }

  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      title: "SignBridge Service Counter Interaction Log",
      generatedAt: new Date().toISOString(),
      totalTurns: this.entries.length,
      transcript: this.entries
    }, null, 2));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `signbridge_transcript_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  exportPlainText() {
    let output = `========================================================\n`;
    output += `SIGNBRIDGE SERVICE COUNTER - INTERACTION TRANSCRIPT\n`;
    output += `Date: ${new Date().toLocaleString()}\n`;
    output += `Total Dialogue Turns: ${this.entries.length}\n`;
    output += `========================================================\n\n`;

    this.entries.forEach(e => {
      output += `[${e.timestamp}] ${e.speaker.toUpperCase()}: ${e.text}\n`;
      if (e.signId) output += `  (Gesture: ${e.signId} | Confidence: ${e.confidence || 'N/A'}%)\n`;
      output += `\n`;
    });

    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `signbridge_transcript_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  printReceipt(scenarioName = 'Service Counter') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Service Counter Interaction Receipt</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #111; }
            .header { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
            .title { font-size: 20px; font-weight: bold; margin: 0; }
            .meta { font-size: 13px; color: #555; margin-top: 4px; }
            .item { margin-bottom: 12px; padding: 8px; border-left: 3px solid #ccc; }
            .speaker { font-weight: bold; font-size: 14px; }
            .text { font-size: 14px; margin: 4px 0; }
            .footer { border-top: 1px solid #ccc; margin-top: 24px; padding-top: 12px; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">SignBridge Accessibility Communication Audit</h1>
            <div class="meta">Counter: ${scenarioName} | Date: ${new Date().toLocaleString()}</div>
          </div>
          <div class="content">
            ${this.entries.map(e => `
              <div class="item">
                <div class="speaker">[${e.timestamp}] ${e.speaker}:</div>
                <div class="text">"${e.text}"</div>
              </div>
            `).join('')}
          </div>
          <div class="footer">
            Generated by SignBridge Counter AI • Equal Access for All Visitors
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
}
