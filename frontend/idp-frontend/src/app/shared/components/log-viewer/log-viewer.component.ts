import {
  Component, Input, ElementRef, ViewChild,
  AfterViewChecked, ChangeDetectionStrategy, signal,
} from '@angular/core';

/**
 * LogViewer — scrollable log output with syntax highlighting.
 *
 * Design (Requirement 26.6):
 * - lines: string[] of log entries
 * - streaming: auto-scrolls to bottom when true
 * - syntaxHighlight: color-codes ERROR/WARN/INFO keywords
 * - When streaming && user scrolls up: pause auto-scroll, show "↓ Scroll to bottom"
 * - Background uses --color-log-bg token
 */
@Component({
  selector: 'idp-log-viewer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="log-viewer" #logContainer (scroll)="onScroll()">
      <div class="log-viewer__content">
        @for (line of lines; track $index; let i = $index) {
          <div class="log-viewer__line" [class]="getLineClass(line)">
            <span class="log-viewer__line-num">{{ i + 1 }}</span>
            <span class="log-viewer__line-text">{{ line }}</span>
          </div>
        }
        @if (lines.length === 0) {
          <div class="log-viewer__empty">No log output available.</div>
        }
      </div>

      @if (showScrollBtn()) {
        <button
          class="log-viewer__scroll-btn"
          type="button"
          (click)="scrollToBottom()"
          aria-label="Scroll to bottom"
        >
          ↓ Scroll to bottom
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .log-viewer {
      position: relative;
      background-color: var(--color-log-bg);
      border-radius: var(--radius-lg);
      padding: var(--space-3);
      max-height: 400px;
      overflow-y: auto;
      overflow-x: auto;
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      line-height: var(--line-height-relaxed);
    }

    .log-viewer__content { min-width: max-content; }

    .log-viewer__line {
      display: flex;
      gap: var(--space-3);
      padding: 1px 0;
      color: var(--color-log-text);
    }

    .log-viewer__line-num {
      color: var(--color-log-line-num);
      min-width: 36px;
      text-align: right;
      user-select: none;
      flex-shrink: 0;
    }

    .log-viewer__line-text {
      white-space: pre;
      word-break: break-all;
    }

    /* Syntax highlighting classes */
    .log-viewer__line--error .log-viewer__line-text { color: var(--color-log-error); }
    .log-viewer__line--warn  .log-viewer__line-text { color: var(--color-log-warn); }
    .log-viewer__line--info  .log-viewer__line-text { color: var(--color-log-info); }

    .log-viewer__empty {
      color: var(--color-log-dim);
      padding: var(--space-4);
      text-align: center;
    }

    .log-viewer__scroll-btn {
      position: sticky;
      bottom: var(--space-2);
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-3);
      background-color: var(--color-primary);
      color: var(--color-primary-contrast);
      border: none;
      border-radius: var(--radius-badge);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      font-family: var(--font-family-sans);
      cursor: pointer;
      box-shadow: var(--shadow-md);
      z-index: var(--z-raised);
      transition: var(--transition-opacity);
    }

    .log-viewer__scroll-btn:hover { opacity: 0.9; }

    /* Scrollbar */
    .log-viewer::-webkit-scrollbar { width: 6px; height: 6px; }
    .log-viewer::-webkit-scrollbar-track { background: transparent; }
    .log-viewer::-webkit-scrollbar-thumb {
      background-color: var(--color-log-line-num);
      border-radius: var(--radius-full);
    }
  `]
})
export class LogViewerComponent implements AfterViewChecked {
  @Input({ required: true }) lines: string[] = [];
  @Input() streaming = false;
  @Input() syntaxHighlight = true;

  @ViewChild('logContainer') private logContainer!: ElementRef<HTMLDivElement>;

  readonly showScrollBtn = signal(false);
  private userScrolledUp = false;

  ngAfterViewChecked(): void {
    if (this.streaming && !this.userScrolledUp && this.logContainer) {
      this.scrollToBottom();
    }
  }

  onScroll(): void {
    if (!this.logContainer) return;
    const el = this.logContainer.nativeElement;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
    this.userScrolledUp = !isAtBottom;
    this.showScrollBtn.set(this.streaming && this.userScrolledUp);
  }

  scrollToBottom(): void {
    if (!this.logContainer) return;
    const el = this.logContainer.nativeElement;
    el.scrollTop = el.scrollHeight;
    this.userScrolledUp = false;
    this.showScrollBtn.set(false);
  }

  getLineClass(line: string): string {
    if (!this.syntaxHighlight) return '';
    const upper = line.toUpperCase();
    if (upper.includes('ERROR') || upper.includes('FATAL')) return 'log-viewer__line--error';
    if (upper.includes('WARN')) return 'log-viewer__line--warn';
    if (upper.includes('INFO')) return 'log-viewer__line--info';
    return '';
  }
}
