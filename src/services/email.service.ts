import nodemailer from 'nodemailer';
import { getModuleLogger } from '../utils/logger';
import { env } from '../config/env';

const logger = getModuleLogger('EmailService');

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: env.email.host,
        port: env.email.port,
        secure: env.email.secure,
        auth: {
          user: env.email.user,
          pass: env.email.password,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      logger.info('Email транспорт инициализирован');
    } catch (error) {
      logger.error(`Ошибка инициализации email транспорта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }

      const mailOptions = {
        from: `"ShepsiGrad" <${env.email.user}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email отправлен: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Ошибка отправки email: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Добро пожаловать в ShepsiGrad!',
      text: `Здравствуйте, ${name}! Мы рады приветствовать вас в системе ShepsiGrad.`,
      html: `
        <h1>Добро пожаловать в ShepsiGrad!</h1>
        <p>Здравствуйте, ${name}!</p>
        <p>Мы рады приветствовать вас в нашей системе аренды недвижимости.</p>
        <p>С уважением, команда ShepsiGrad</p>
      `
    });
  }

  async sendBookingConfirmationEmail(email: string, bookingDetails: any): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Подтверждение бронирования',
      text: `Ваше бронирование #${bookingDetails.id} успешно подтверждено.`,
      html: `
        <h1>Бронирование подтверждено</h1>
        <p>Ваше бронирование #${bookingDetails.id} успешно подтверждено.</p>
        <h2>Детали бронирования:</h2>
        <ul>
          <li>Объект: ${bookingDetails.propertyName}</li>
          <li>Дата заезда: ${new Date(bookingDetails.checkIn).toLocaleDateString()}</li>
          <li>Дата выезда: ${new Date(bookingDetails.checkOut).toLocaleDateString()}</li>
          <li>Количество гостей: ${bookingDetails.guests}</li>
          <li>Общая стоимость: ${bookingDetails.totalPrice} ${bookingDetails.currency || 'RUB'}</li>
        </ul>
        <p>С уважением, команда ShepsiGrad</p>
      `
    });
  }

  async sendPaymentConfirmationEmail(email: string, paymentDetails: any): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Подтверждение оплаты',
      text: `Ваш платеж на сумму ${paymentDetails.amount} ${paymentDetails.currency || 'RUB'} успешно обработан.`,
      html: `
        <h1>Платеж подтвержден</h1>
        <p>Ваш платеж на сумму ${paymentDetails.amount} ${paymentDetails.currency || 'RUB'} успешно обработан.</p>
        <h2>Детали платежа:</h2>
        <ul>
          <li>ID платежа: ${paymentDetails.id}</li>
          <li>Дата: ${new Date(paymentDetails.date).toLocaleString()}</li>
          <li>Метод оплаты: ${paymentDetails.method}</li>
          <li>Статус: Оплачено</li>
        </ul>
        <p>С уважением, команда ShepsiGrad</p>
      `
    });
  }
} 