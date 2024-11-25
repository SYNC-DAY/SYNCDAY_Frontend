import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useAuthStore } from '@/stores/auth';

export class ChatService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = new Map();  // 채팅방별 구독 관리
        this.authStore = useAuthStore();
    }

    // WebSocket 연결
    async connect() {
        if (this.stompClient?.connected) return;

        const socket = new SockJS('/api/ws');
        this.stompClient = Stomp.over(socket);

        return new Promise((resolve, reject) => {
            this.stompClient.connect(
                {
                    Authorization: `Bearer ${this.authStore.accessToken}`
                },
                () => {
                    console.log('WebSocket 연결 성공');
                    resolve();
                },
                (error) => {
                    console.error('WebSocket 연결 실패:', error);
                    reject(error);
                }
            );
        });
    }

    // 채팅방 구독
    subscribeToRoom(roomId, messageCallback) {
        if (!this.stompClient?.connected) return;

        // 이미 구독 중인지 확인
        if (this.subscriptions.has(roomId)) return;

        const subscription = this.stompClient.subscribe(
            `/topic/room/${roomId}/message`,
            (message) => {
                const messageData = JSON.parse(message.body);
                messageCallback(messageData);
            }
        );

        this.subscriptions.set(roomId, subscription);
    }

    // 메시지 전송
    sendMessage(roomId, messageData) {
        if (!this.stompClient?.connected) return;

        this.stompClient.send(
            `/app/chat/${roomId}`,
            {},
            JSON.stringify(messageData)
        );
    }

    // 채팅방 구독 해제
    unsubscribeFromRoom(roomId) {
        const subscription = this.subscriptions.get(roomId);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(roomId);
        }
    }

    // 새 채팅방 생성
    createRoom(roomData) {
        if (!this.stompClient?.connected) return;

        this.stompClient.send(
            '/app/chat/room/create',
            {},
            JSON.stringify(roomData)
        );
    }

    // 사용자 초대
    inviteUser(roomId, userId) {
        if (!this.stompClient?.connected) return;

        this.stompClient.send(
            `/app/chat/${roomId}/invite`,
            {},
            JSON.stringify(userId)
        );
    }

    // WebSocket 연결 해제
    disconnect() {
        // 모든 구독 해제
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
        this.subscriptions.clear();

        // 연결 종료
        if (this.stompClient?.connected) {
            this.stompClient.disconnect();
        }
    }
}
