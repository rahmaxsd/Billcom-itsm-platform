import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Client } from '@stomp/stompjs';
import { AuthService } from './auth.service';
import { NotificationsActions } from '../store/notifications.store';
import { AppNotification } from './models';

/** Notifications temps réel : WebSocket STOMP sur /ws (proxifié par nginx ou ng serve). */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly auth = inject(AuthService);
  private readonly store = inject(Store);
  private client: Client | null = null;

  connect(): void {
    const token = this.auth.token();
    if (!token || this.client) return;

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.client = new Client({
      brokerURL: `${protocol}//${location.host}/ws/websocket`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });
    this.client.onConnect = () => {
      this.client?.subscribe('/user/queue/notifications', msg => {
        const notification = JSON.parse(msg.body) as AppNotification;
        this.store.dispatch(NotificationsActions.received({ notification }));
      });
    };
    this.client.activate();
  }

  disconnect(): void {
    void this.client?.deactivate();
    this.client = null;
  }
}
