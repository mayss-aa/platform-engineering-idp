import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy, ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

/**
 * SearchBar — debounced text input for filtering lists.
 *
 * Design (Requirement 26.9):
 * - placeholder: input placeholder text
 * - debounceMs: keystroke debounce (default 300ms)
 * - initialValue: pre-filled search term
 * - Emits `search` after debounce with the current value
 */
@Component({
  selector: 'idp-search-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="search-bar" role="search">
      <label [attr.for]="inputId" class="sr-only">{{ placeholder }}</label>
      <svg class="search-bar__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" clip-rule="evenodd"
          d="M8.5 3a5.5 5.5 0 1 0 3.45 9.814l3.118 3.118a.75.75 0 1 0 1.06-1.06l-3.117-3.118A5.5 5.5 0 0 0 8.5 3Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/>
      </svg>
      <input
        [id]="inputId"
        class="search-bar__input"
        type="search"
        [placeholder]="placeholder"
        [ngModel]="value"
        (ngModelChange)="onInput($event)"
        autocomplete="off"
        spellcheck="false"
      />
      @if (value) {
        <button
          class="search-bar__clear"
          type="button"
          (click)="clear()"
          aria-label="Clear search"
        >
          &#10005;
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-bar__icon {
      position: absolute;
      left: var(--space-3);
      width: 16px;
      height: 16px;
      color: var(--color-text-tertiary);
      pointer-events: none;
    }

    .search-bar__input {
      width: 100%;
      height: 36px;
      padding: 0 var(--space-8) 0 var(--space-8);
      background-color: var(--color-surface-2);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-family: var(--font-family-sans);
      color: var(--color-text-primary);
      outline: none;
      transition: border-color var(--duration-fast) var(--ease-default),
                  background-color var(--duration-fast) var(--ease-default);
    }

    .search-bar__input::placeholder { color: var(--color-text-tertiary); }

    .search-bar__input:focus {
      background-color: var(--color-surface-1);
      border-color: var(--color-border-focus);
      box-shadow: var(--shadow-focus);
    }

    .search-bar__clear {
      position: absolute;
      right: var(--space-2);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      color: var(--color-text-tertiary);
      cursor: pointer;
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      transition: var(--transition-color);
    }

    .search-bar__clear:hover {
      background-color: var(--color-surface-3);
      color: var(--color-text-primary);
    }
  `]
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search...';
  @Input() debounceMs = 300;
  @Input() initialValue = '';
  @Output() search = new EventEmitter<string>();

  value = '';
  readonly inputId = `search-${Math.random().toString(36).substring(2, 8)}`;

  private readonly input$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.value = this.initialValue;
    this.input$.pipe(
      debounceTime(this.debounceMs),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe((term) => this.search.emit(term));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(value: string): void {
    this.value = value;
    this.input$.next(value);
  }

  clear(): void {
    this.value = '';
    this.input$.next('');
  }
}
