import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Property } from './Property';
import { Booking } from './Booking';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => User, user => user.reviews)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Index()
  @ManyToOne(() => Property, property => property.reviews)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column()
  propertyId: string;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking | null;

  @Column({ nullable: true })
  bookingId: string | null;

  @Column('int')
  rating: number;

  @Column('text')
  comment: string;

  @Column('simple-array', { nullable: true })
  images: string[] | null;

  @Column('boolean', { default: false })
  isApproved: boolean;

  @Column('boolean', { default: false })
  isHidden: boolean;

  @Column({ nullable: true })
  adminComment: string | null;

  @Column({ nullable: true })
  ownerReply: string | null;

  @Column({ nullable: true })
  ownerReplyDate: Date | null;

  @Column('int', { nullable: true })
  cleanliness: number | null;

  @Column('int', { nullable: true })
  communication: number | null;

  @Column('int', { nullable: true })
  checkIn: number | null;

  @Column('int', { nullable: true })
  accuracy: number | null;

  @Column('int', { nullable: true })
  location: number | null;

  @Column('int', { nullable: true })
  value: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 