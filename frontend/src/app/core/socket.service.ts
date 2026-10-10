import { Injectable, inject } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { Store } from '@ngrx/store';
import { AppNotification } from './models';
import * as N from '../store/notifications/notifications.actions';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private store = inject(Store);
  private client: Client | null = null;

  connect(token: string) {
    this.disconnect();
    const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
    this.client = new Client({
      // SockJS expose aussi un WebSocket natif sur /ws/websocket
      brokerURL: `${scheme}://${location.host}/ws/websocket`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        this.client?.subscribe('/user/queue/notifications', (msg) => {
          const item = JSON.parse(msg.body) as AppNotification;
          this.store.dispatch(N.received({ item }));
        });
      },
    });
    this.client.activate();
  }

  disconnect() {
    this.client?.deactivate();
    this.client = null;
  }
}
