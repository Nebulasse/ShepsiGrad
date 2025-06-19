import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { appConfig } from '../config/appConfig';

interface YookassaPaymentResponse {
  id: string;
  status: string;
  paid: boolean;
  amount: {
    value: string;
    currency: string;
  };
  created_at: string;
  confirmation: {
    type: string;
    confirmation_url: string;
  };
  metadata?: Record<string, any>;
}

interface YookassaPaymentStatusResponse {
  id: string;
  status: string;
  paid: boolean;
  amount: {
    value: string;
    currency: string;
  };
  created_at: string;
  captured_at?: string;
  metadata?: Record<string, any>;
}

interface YookassaRefundResponse {
  id: string;
  payment_id: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  created_at: string;
}

/**
 * Сервис для работы с платежной системой ЮКасса
 */
class PaymentService {
  private apiUrl: string;
  private shopId: string;
  private secretKey: string;
  private returnUrl: string;

  constructor() {
    this.apiUrl = 'https://api.yookassa.ru/v3';
    this.shopId = appConfig.payment.yookassa.shopId;
    this.secretKey = appConfig.payment.yookassa.secretKey;
    this.returnUrl = appConfig.payment.returnUrl;
  }

  /**
   * Создание нового платежа
   * @param amount Сумма платежа
   * @param currency Валюта платежа (по умолчанию RUB)
   * @param description Описание платежа
   * @param metadata Дополнительные данные для платежа
   * @returns Данные созданного платежа
   */
  async createPayment(
    amount: number,
    description: string,
    metadata: Record<string, any> = {},
    currency: string = 'RUB'
  ): Promise<YookassaPaymentResponse> {
    try {
      const paymentData = {
        amount: {
          value: amount.toFixed(2),
          currency,
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: this.returnUrl,
        },
        description,
        metadata,
        idempotence_key: uuidv4(),
      };

      const response = await axios.post<YookassaPaymentResponse>(
        `${this.apiUrl}/payments`,
        paymentData,
        {
          auth: {
            username: this.shopId,
            password: this.secretKey,
          },
          headers: {
            'Content-Type': 'application/json',
            'Idempotence-Key': uuidv4(),
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  /**
   * Получение информации о платеже по его ID
   * @param paymentId ID платежа
   * @returns Информация о платеже
   */
  async getPaymentInfo(paymentId: string): Promise<YookassaPaymentStatusResponse> {
    try {
      const response = await axios.get<YookassaPaymentStatusResponse>(
        `${this.apiUrl}/payments/${paymentId}`,
        {
          auth: {
            username: this.shopId,
            password: this.secretKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting payment info:', error);
      throw new Error('Failed to get payment information');
    }
  }

  /**
   * Выполнение возврата платежа
   * @param paymentId ID платежа для возврата
   * @param amount Сумма возврата
   * @param currency Валюта возврата (по умолчанию RUB)
   * @param description Описание возврата
   * @returns Информация о возврате
   */
  async refundPayment(
    paymentId: string,
    amount: number,
    description: string = 'Возврат платежа',
    currency: string = 'RUB'
  ): Promise<YookassaRefundResponse> {
    try {
      const refundData = {
        payment_id: paymentId,
        amount: {
          value: amount.toFixed(2),
          currency,
        },
        description,
        idempotence_key: uuidv4(),
      };

      const response = await axios.post<YookassaRefundResponse>(
        `${this.apiUrl}/refunds`,
        refundData,
        {
          auth: {
            username: this.shopId,
            password: this.secretKey,
          },
          headers: {
            'Content-Type': 'application/json',
            'Idempotence-Key': uuidv4(),
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw new Error('Failed to refund payment');
    }
  }

  /**
   * Проверка статуса платежа
   * @param paymentId ID платежа
   * @returns true если платеж успешно оплачен, иначе false
   */
  async isPaymentSuccessful(paymentId: string): Promise<boolean> {
    try {
      const paymentInfo = await this.getPaymentInfo(paymentId);
      return paymentInfo.status === 'succeeded' && paymentInfo.paid;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  }

  /**
   * Создание платежной сессии с использованием Stripe
   * @param amount Сумма платежа
   * @param currency Валюта платежа (по умолчанию RUB)
   * @param description Описание платежа
   * @param metadata Дополнительные данные для платежа
   * @returns URL для оплаты и ID сессии
   */
  async createStripeSession(
    amount: number,
    description: string,
    metadata: Record<string, any> = {},
    currency: string = 'RUB'
  ): Promise<{ session_id: string; url: string }> {
    try {
      // В реальном приложении здесь будет вызов API Stripe
      // Для демонстрации возвращаем заглушку
      console.log(`Creating Stripe session for amount: ${amount} ${currency}, description: ${description}`);
      
      // Имитация успешного создания сессии
      return {
        session_id: `stripe_session_${uuidv4()}`,
        url: `${appConfig.frontendUrl}/payment/stripe?session_id=${uuidv4()}`
      };
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      throw new Error('Failed to create Stripe payment session');
    }
  }
}

// Экспортируем экземпляр сервиса
const paymentService = new PaymentService();
export default paymentService; 