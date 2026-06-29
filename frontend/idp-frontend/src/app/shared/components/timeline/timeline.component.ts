import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

/** Shape of a timeline event entry. */
export interface TimelineEvent {
  timestamp: string; // ISO 8601
  actor: string;
  action: string;
  description?: string;
}

/**
 * TimelineComponent — renders a chronological sequence of events.
 *
 * Design (Requirement 26.11):
 * - events: array of { timestamp, actor, action, description? }
 * - order: 'asc' (oldest first) or 'desc' (newest first)
 * - Vertical connecting line between entries
 * - Relative timestamps with absolute tooltip on hover
 */
@Component({
  selector: 'idp-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="timeline" role="list" aria-label="Event timeline">
      @for (event of sortedEvents; track event.timestamp + event.actor) {
        <div class="timeline__item" role="listitem">
          <div class="timeline__connector">
            <span class="timeline__dot"></span>
            <span class="timeline__line"></span>
          </div>
          <div class="timeline__content">
            <div class="timeline__header">
              <span class="timeline__actor">{{ event.actor }}</span>
              <span class="timeline__action">{{ event.action }}</span>
            </div>
            @if (event.description) {
              <p class="timeline__desc">{{ event.description }}</p>
            }
            <time
              class="timeline__time"
              [attr.datetime]="event.timestamp"
              [attr.title]="event.timestamp"
            >
              {{ formatRelative(event.timestamp) }}
            </time>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .timeline {
      display: flex;
      flex-direction: column;
    }

    .timeline__item {
      display: flex;
      gap: var(--space-3);
      position: relative;
      padding-bottom: var(--space-4);
    }

    .timeline__item:last-child { padding-bottom: 0; }
    .timeline__item:last-child .timeline__line { display: none; }

    .timeline__connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      width: 12px;
    }

    .timeline__dot {
      width: 8px;
      height: 8px;
      border-radius: var(--radius-full);
      background-color: var(--color-primary);
      flex-shrink: 0;
      margin-top: 4px;
      z-index: 1;
    }

    .timeline__line {
      flex: 1;
      width: 1px;
      background-color: var(--color-border-muted);
      margin-top: var(--space-1);
    }

    .timeline__content {
      flex: 1;
      min-width: 0;
    }

    .timeline__header {
      display: flex;
      align-items: center;
      gap: var(--space-1-5);
      flex-wrap: wrap;
    }

    .timeline__actor {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }

    .timeline__action {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .timeline__desc {
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
      margin-top: var(--space-0-5);
    }

    .timeline__time {
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
      margin-top: var(--space-1);
      display: block;
      cursor: help;
    }
  `]
})
export class TimelineComponent {
  @Input({ required: true }) events: TimelineEvent[] = [];
  @Input() order: 'asc' | 'desc' = 'asc';

  get sortedEvents(): TimelineEvent[] {
    const sorted = [...this.events].sort((a, b) => {
      const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return this.order === 'asc' ? diff : -diff;
    });
    return sorted;
  }

  formatRelative(isoTimestamp: string): string {
    const now = Date.now();
    const then = new Date(isoTimestamp).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  }
}
