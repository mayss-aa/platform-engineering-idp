import { TestBed } from '@angular/core/testing';
import { NotificationCountStore } from './notification-count.store';

describe('NotificationCountStore', () => {
  let store: NotificationCountStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(NotificationCountStore);
  });

  it('should start with zero counts', () => {
    expect(store.unreadCount()).toBe(0);
    expect(store.totalCount()).toBe(0);
    expect(store.hasUnread()).toBe(false);
    expect(store.badgeLabel()).toBe('');
  });

  it('should set counts correctly', () => {
    store.setCounts(10, 5);
    expect(store.totalCount()).toBe(10);
    expect(store.unreadCount()).toBe(5);
    expect(store.hasUnread()).toBe(true);
    expect(store.badgeLabel()).toBe('5');
  });

  it('should clamp unread to not exceed total', () => {
    store.setCounts(5, 10); // unread > total
    expect(store.unreadCount()).toBe(5); // clamped to total
  });

  it('should decrement on markOneRead', () => {
    store.setCounts(10, 5);
    store.markOneRead();
    expect(store.unreadCount()).toBe(4);
  });

  it('should not go below zero on markOneRead', () => {
    store.setCounts(10, 0);
    store.markOneRead();
    expect(store.unreadCount()).toBe(0);
  });

  it('should set unread to zero on markAllRead', () => {
    store.setCounts(10, 7);
    store.markAllRead();
    expect(store.unreadCount()).toBe(0);
    expect(store.totalCount()).toBe(10); // total unchanged
  });

  it('should increment both counts on addNotification', () => {
    store.setCounts(10, 3);
    store.addNotification();
    expect(store.totalCount()).toBe(11);
    expect(store.unreadCount()).toBe(4);
  });

  it('should show 99+ when over 99', () => {
    store.setCounts(150, 120);
    expect(store.badgeLabel()).toBe('99+');
  });

  it('should reset to zero', () => {
    store.setCounts(10, 5);
    store.reset();
    expect(store.unreadCount()).toBe(0);
    expect(store.totalCount()).toBe(0);
  });
});
