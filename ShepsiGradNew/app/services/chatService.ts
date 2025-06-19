import { apiClient } from './api';
import { 
  Message, 
  Conversation, 
  MessageCreateData, 
  ConversationCreateData,
  MessageQueryParams
} from '../types/Chat';

// Временные тестовые данные для диалогов
const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    participants: [
      { id: 'current-user', name: 'Вы', role: 'guest' },
      { id: 'host1', name: 'Алексей', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', role: 'host' }
    ],
    lastMessage: {
      id: 'msg-5',
      conversationId: '1',
      senderId: 'host1',
      senderName: 'Алексей',
      content: 'Хорошо, буду ждать вас в указанное время. Контактный телефон: +7 (999) 123-45-67',
      timestamp: '2023-06-15T15:45:00',
      isRead: false
    },
    unreadCount: 1,
    propertyId: '1',
    propertyTitle: 'Апартаменты на берегу моря',
    createdAt: '2023-06-14T10:30:00',
    updatedAt: '2023-06-15T15:45:00'
  },
  {
    id: '2',
    participants: [
      { id: 'current-user', name: 'Вы', role: 'guest' },
      { id: 'host2', name: 'Елена', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', role: 'host' }
    ],
    lastMessage: {
      id: 'msg-8',
      conversationId: '2',
      senderId: 'current-user',
      senderName: 'Вы',
      content: 'Подскажите, пожалуйста, как далеко от апартаментов до ближайшего пляжа?',
      timestamp: '2023-06-10T11:20:00',
      isRead: true
    },
    unreadCount: 0,
    propertyId: '2',
    propertyTitle: 'Уютная квартира в центре',
    createdAt: '2023-06-08T09:15:00',
    updatedAt: '2023-06-10T11:20:00'
  },
  {
    id: '3',
    participants: [
      { id: 'current-user', name: 'Вы', role: 'guest' },
      { id: 'host3', name: 'Михаил', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', role: 'host' }
    ],
    lastMessage: {
      id: 'msg-12',
      conversationId: '3',
      senderId: 'host3',
      senderName: 'Михаил',
      content: 'Да, конечно, в коттедже есть все необходимое для барбекю. Уголь и розжиг предоставляем бесплатно.',
      timestamp: '2023-06-05T18:30:00',
      isRead: true
    },
    unreadCount: 0,
    propertyId: '3',
    propertyTitle: 'Коттедж с бассейном',
    createdAt: '2023-06-03T14:00:00',
    updatedAt: '2023-06-05T18:30:00'
  }
];

// Временные тестовые данные для сообщений
const MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: 'msg-1',
      conversationId: '1',
      senderId: 'current-user',
      senderName: 'Вы',
      content: 'Здравствуйте! Интересует ваше жилье на даты 15-22 июля. Подскажите, возможно ли заселение после 20:00?',
      timestamp: '2023-06-14T10:30:00',
      isRead: true
    },
    {
      id: 'msg-2',
      conversationId: '1',
      senderId: 'host1',
      senderName: 'Алексей',
      senderAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      content: 'Добрый день! Да, эти даты свободны. Заселение после 20:00 возможно, но прошу предупредить меня заранее о точном времени прибытия.',
      timestamp: '2023-06-14T10:45:00',
      isRead: true
    },
    {
      id: 'msg-3',
      conversationId: '1',
      senderId: 'current-user',
      senderName: 'Вы',
      content: 'Отлично, спасибо! Планируем приехать около 21:00. Есть ли рядом с жильем продуктовые магазины?',
      timestamp: '2023-06-14T11:00:00',
      isRead: true
    },
    {
      id: 'msg-4',
      conversationId: '1',
      senderId: 'host1',
      senderName: 'Алексей',
      senderAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      content: 'Да, в 100 метрах есть небольшой супермаркет, работает до 22:00. А в 500 метрах крупный гипермаркет, который работает круглосуточно.',
      timestamp: '2023-06-14T11:15:00',
      isRead: true
    },
    {
      id: 'msg-5',
      conversationId: '1',
      senderId: 'host1',
      senderName: 'Алексей',
      senderAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      content: 'Хорошо, буду ждать вас в указанное время. Контактный телефон: +7 (999) 123-45-67',
      timestamp: '2023-06-15T15:45:00',
      isRead: false
    }
  ],
  '2': [
    {
      id: 'msg-6',
      conversationId: '2',
      senderId: 'current-user',
      senderName: 'Вы',
      content: 'Добрый день! Подскажите, есть ли в квартире стиральная машина?',
      timestamp: '2023-06-08T09:15:00',
      isRead: true
    },
    {
      id: 'msg-7',
      conversationId: '2',
      senderId: 'host2',
      senderName: 'Елена',
      senderAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      content: 'Здравствуйте! Да, в квартире есть стиральная машина, утюг, фен и все необходимые бытовые приборы.',
      timestamp: '2023-06-08T09:30:00',
      isRead: true
    },
    {
      id: 'msg-8',
      conversationId: '2',
      senderId: 'current-user',
      senderName: 'Вы',
      content: 'Подскажите, пожалуйста, как далеко от апартаментов до ближайшего пляжа?',
      timestamp: '2023-06-10T11:20:00',
      isRead: true
    }
  ],
  '3': [
    {
      id: 'msg-9',
      conversationId: '3',
      senderId: 'current-user',
      senderName: 'Вы',
      content: 'Здравствуйте! Планируем отдых большой компанией (6 человек). Подскажите, достаточно ли будет места для всех?',
      timestamp: '2023-06-03T14:00:00',
      isRead: true
    },
    {
      id: 'msg-10',
      conversationId: '3',
      senderId: 'host3',
      senderName: 'Михаил',
      senderAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      content: 'Добрый день! Да, коттедж рассчитан на 8 человек. У нас три спальни с двуспальными кроватями и раскладной диван в гостиной.',
      timestamp: '2023-06-03T14:20:00',
      isRead: true
    },
    {
      id: 'msg-11',
      conversationId: '3',
      senderId: 'current-user',
      senderName: 'Вы',
      content: 'Отлично! А можно ли готовить барбекю на территории?',
      timestamp: '2023-06-05T17:45:00',
      isRead: true
    },
    {
      id: 'msg-12',
      conversationId: '3',
      senderId: 'host3',
      senderName: 'Михаил',
      senderAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      content: 'Да, конечно, в коттедже есть все необходимое для барбекю. Уголь и розжиг предоставляем бесплатно.',
      timestamp: '2023-06-05T18:30:00',
      isRead: true
    }
  ]
};

// Сервис для работы с чатом
const chatService = {
  // Получить все диалоги пользователя
  getUserConversations: async (): Promise<Conversation[]> => {
    try {
      // В реальном приложении здесь будет API запрос
      // const response = await apiClient.get('/conversations');
      // return response.data;
      
      // Имитация запроса с задержкой
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([...CONVERSATIONS].sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ));
        }, 600);
      });
    } catch (error) {
      console.error('Ошибка при получении диалогов:', error);
      throw error;
    }
  },
  
  // Получить диалог по ID
  getConversationById: async (conversationId: string): Promise<Conversation | null> => {
    try {
      // В реальном приложении здесь будет API запрос
      // const response = await apiClient.get(`/conversations/${conversationId}`);
      // return response.data;
      
      // Имитация запроса с задержкой
      return new Promise((resolve) => {
        setTimeout(() => {
          const conversation = CONVERSATIONS.find(c => c.id === conversationId);
          resolve(conversation || null);
        }, 300);
      });
    } catch (error) {
      console.error('Ошибка при получении диалога:', error);
      throw error;
    }
  },
  
  // Создать новый диалог
  createConversation: async (data: ConversationCreateData): Promise<Conversation> => {
    try {
      // В реальном приложении здесь будет API запрос
      // const response = await apiClient.post('/conversations', data);
      // return response.data;
      
      // Имитация запроса с задержкой
      return new Promise((resolve) => {
        setTimeout(() => {
          const currentUser = {
            id: 'current-user',
            name: 'Вы',
            role: 'guest' as const
          };
          
          const otherUser = {
            id: data.participantIds.find(id => id !== 'current-user') || 'new-user',
            name: 'Новый пользователь',
            role: 'host' as const
          };
          
          const now = new Date().toISOString();
          
          // Создаем новый диалог
          const newConversation: Conversation = {
            id: `${CONVERSATIONS.length + 1}`,
            participants: [currentUser, otherUser],
            unreadCount: 0,
            propertyId: data.propertyId,
            propertyTitle: data.propertyId ? `Объект ${data.propertyId}` : undefined,
            createdAt: now,
            updatedAt: now
          };
          
          // Если есть начальное сообщение, создаем его
          if (data.initialMessage) {
            const newMessage: Message = {
              id: `msg-new-${Date.now()}`,
              conversationId: newConversation.id,
              senderId: currentUser.id,
              senderName: currentUser.name,
              content: data.initialMessage,
              timestamp: now,
              isRead: false
            };
            
            newConversation.lastMessage = newMessage;
            
            // В реальном приложении здесь будет сохранение сообщения в базу данных
            if (!MESSAGES[newConversation.id]) {
              MESSAGES[newConversation.id] = [];
            }
            MESSAGES[newConversation.id].push(newMessage);
          }
          
          // В реальном приложении здесь будет сохранение диалога в базу данных
          CONVERSATIONS.push(newConversation);
          
          resolve(newConversation);
        }, 800);
      });
    } catch (error) {
      console.error('Ошибка при создании диалога:', error);
      throw error;
    }
  },
  
  // Получить сообщения диалога
  getConversationMessages: async (params: MessageQueryParams): Promise<Message[]> => {
    try {
      // В реальном приложении здесь будет API запрос
      // const response = await apiClient.get(`/conversations/${params.conversationId}/messages`, { params });
      // return response.data;
      
      // Имитация запроса с задержкой
      return new Promise((resolve) => {
        setTimeout(() => {
          const messages = MESSAGES[params.conversationId] || [];
          
          // Обновляем статус прочтения сообщений
          messages.forEach(message => {
            if (message.senderId !== 'current-user') {
              message.isRead = true;
            }
          });
          
          // Обновляем количество непрочитанных сообщений в диалоге
          const conversation = CONVERSATIONS.find(c => c.id === params.conversationId);
          if (conversation) {
            conversation.unreadCount = 0;
          }
          
          resolve([...messages].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ));
        }, 500);
      });
    } catch (error) {
      console.error('Ошибка при получении сообщений:', error);
      throw error;
    }
  },
  
  // Отправить новое сообщение
  sendMessage: async (data: MessageCreateData): Promise<Message> => {
    try {
      // В реальном приложении здесь будет API запрос
      // const response = await apiClient.post(`/conversations/${data.conversationId}/messages`, data);
      // return response.data;
      
      // Имитация запроса с задержкой
      return new Promise((resolve) => {
        setTimeout(() => {
          const now = new Date().toISOString();
          
          // Создаем новое сообщение
          const newMessage: Message = {
            id: `msg-new-${Date.now()}`,
            conversationId: data.conversationId,
            senderId: 'current-user',
            senderName: 'Вы',
            content: data.content,
            timestamp: now,
            isRead: false,
            attachments: data.attachments?.map((attachment, index) => ({
              ...attachment,
              id: `attach-${Date.now()}-${index}`
            }))
          };
          
          // Обновляем диалог
          const conversation = CONVERSATIONS.find(c => c.id === data.conversationId);
          if (conversation) {
            conversation.lastMessage = newMessage;
            conversation.updatedAt = now;
          }
          
          // Добавляем сообщение в список
          if (!MESSAGES[data.conversationId]) {
            MESSAGES[data.conversationId] = [];
          }
          MESSAGES[data.conversationId].push(newMessage);
          
          // Имитация ответа от хозяина через 2 секунды (только для демонстрации)
          if (conversation) {
            const host = conversation.participants.find(p => p.role === 'host');
            if (host) {
              setTimeout(() => {
                const responseMessage: Message = {
                  id: `msg-new-${Date.now() + 1}`,
                  conversationId: data.conversationId,
                  senderId: host.id,
                  senderName: host.name,
                  senderAvatar: host.avatar,
                  content: 'Спасибо за ваше сообщение! Я отвечу вам в ближайшее время.',
                  timestamp: new Date(Date.now() + 2000).toISOString(),
                  isRead: false
                };
                
                MESSAGES[data.conversationId].push(responseMessage);
                conversation.lastMessage = responseMessage;
                conversation.updatedAt = responseMessage.timestamp;
                conversation.unreadCount += 1;
              }, 2000);
            }
          }
          
          resolve(newMessage);
        }, 600);
      });
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      throw error;
    }
  },
  
  // Пометить сообщения как прочитанные
  markMessagesAsRead: async (conversationId: string): Promise<void> => {
    try {
      // В реальном приложении здесь будет API запрос
      // await apiClient.put(`/conversations/${conversationId}/read`);
      
      // Имитация запроса с задержкой
      return new Promise((resolve) => {
        setTimeout(() => {
          // Обновляем статус прочтения сообщений
          const messages = MESSAGES[conversationId] || [];
          messages.forEach(message => {
            if (message.senderId !== 'current-user') {
              message.isRead = true;
            }
          });
          
          // Обновляем количество непрочитанных сообщений в диалоге
          const conversation = CONVERSATIONS.find(c => c.id === conversationId);
          if (conversation) {
            conversation.unreadCount = 0;
          }
          
          resolve();
        }, 300);
      });
    } catch (error) {
      console.error('Ошибка при маркировке сообщений как прочитанных:', error);
      throw error;
    }
  },
  
  // Получить общее количество непрочитанных сообщений
  getTotalUnreadCount: async (): Promise<number> => {
    try {
      // В реальном приложении здесь будет API запрос
      // const response = await apiClient.get('/conversations/unread-count');
      // return response.data.count;
      
      // Имитация запроса с задержкой
      return new Promise((resolve) => {
        setTimeout(() => {
          const totalUnreadCount = CONVERSATIONS.reduce(
            (total, conversation) => total + conversation.unreadCount,
            0
          );
          resolve(totalUnreadCount);
        }, 300);
      });
    } catch (error) {
      console.error('Ошибка при получении количества непрочитанных сообщений:', error);
      throw error;
    }
  }
};

export default chatService; 