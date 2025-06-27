import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Property } from './Property';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => User, user => user.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Index()
  @ManyToOne(() => Property, property => property.bookings)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column()
  propertyId: string;

  @Column('date')
  checkIn: Date;

  @Column('date')
  checkOut: Date;

  @Column('int')
  guests: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  cleaningFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  serviceFee: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING
  })
  status: BookingStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true })
  paymentId: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({ nullable: true })
  specialRequests: string;

  @Column('boolean', { default: false })
  isRefundRequested: boolean;

  @Column({ nullable: true })
  refundRequestReason: string;

  @Column({ nullable: true })
  refundRequestDate: Date;

  @Column('boolean', { default: false })
  isRefunded: boolean;

  @Column({ nullable: true })
  refundDate: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  refundAmount: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Геттер для получения количества ночей
  get nightsCount(): number {
    const checkIn = new Date(this.checkIn);
    const checkOut = new Date(this.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
} 