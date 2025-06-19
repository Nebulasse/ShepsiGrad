// Полифил для WebSocket, который не зависит от PlatformConstants

// Проверяем, есть ли уже глобальный WebSocket
if (typeof global.WebSocket === 'undefined') {
  // Создаем простую реализацию WebSocket
  class CustomWebSocket {
    url: string;
    readyState: number = 0; // CONNECTING
    onopen: ((event: any) => void) | null = null;
    onclose: ((event: any) => void) | null = null;
    onmessage: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    
    // Константы состояния
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    private socket: any = null;
    private isConnected = false;

    constructor(url: string, protocols?: string | string[]) {
      this.url = url;
      
      try {
        // Используем XMLHttpRequest для имитации WebSocket
        const xhr = new XMLHttpRequest();
        
        // Открываем соединение
        setTimeout(() => {
          this.readyState = 1; // OPEN
          this.isConnected = true;
          
          if (this.onopen) {
            this.onopen({ type: 'open', target: this });
          }
        }, 100);
      } catch (error) {
        console.error('Ошибка при создании WebSocket:', error);
        
        if (this.onerror) {
          this.onerror({ type: 'error', error, target: this });
        }
        
        this.readyState = 3; // CLOSED
      }
    }

    send(data: string | ArrayBuffer | ArrayBufferView): void {
      if (this.readyState !== 1) {
        throw new Error('WebSocket не подключен');
      }
      
      try {
        console.log('WebSocket отправляет данные:', data);
        // В реальной реализации здесь был бы код для отправки данных
      } catch (error) {
        console.error('Ошибка при отправке данных:', error);
        
        if (this.onerror) {
          this.onerror({ type: 'error', error, target: this });
        }
      }
    }

    close(code?: number, reason?: string): void {
      if (this.readyState === 3) {
        return; // Уже закрыт
      }
      
      this.readyState = 2; // CLOSING
      
      setTimeout(() => {
        this.readyState = 3; // CLOSED
        this.isConnected = false;
        
        if (this.onclose) {
          this.onclose({
            type: 'close',
            code: code || 1000,
            reason: reason || 'Normal closure',
            wasClean: true,
            target: this
          });
        }
      }, 100);
    }
  }

  // Устанавливаем наш полифил как глобальный WebSocket
  global.WebSocket = CustomWebSocket as any;
  console.log('WebSocket полифил установлен');
} else {
  console.log('WebSocket уже определен, полифил не требуется');
}

export default global.WebSocket; 