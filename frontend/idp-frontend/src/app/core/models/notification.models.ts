export type NotificationType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO 8601
  read: boolean;
}
