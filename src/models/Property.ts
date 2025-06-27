import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Booking } from './Booking';
import { Review } from './Review';
import { Favorite } from './Favorite';

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  ROOM = 'room',
  VILLA = 'villa',
  COTTAGE = 'cottage',
  OTHER = 'other'
}

export enum PropertyStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked'
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: PropertyType,
    default: PropertyType.APARTMENT
  })
  type: PropertyType;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'RUB' })
  currency: string;

  @Column({ default: 'night' })
  priceUnit: string;

  @Column('int', { default: 1 })
  bedrooms: number;

  @Column('int', { default: 1 })
  bathrooms: number;

  @Column('int', { default: 1 })
  maxGuests: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  area: number | null;

  @Column({ nullable: true })
  areaUnit: string;

  @Column('simple-array', { nullable: true })
  amenities: string[] | null;

  @Column('simple-array', { nullable: true })
  images: string[] | null;

  @Column({ nullable: true })
  mainImage: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Index()
  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.PENDING
  })
  status: PropertyStatus;

  @Column('boolean', { default: false })
  featured: boolean;

  @Column('boolean', { default: false })
  instantBooking: boolean;

  @Column('int', { default: 1 })
  minNights: number;

  @Column('int', { nullable: true })
  maxNights: number | null;

  @Column({ nullable: true })
  checkInTime: string;

  @Column({ nullable: true })
  checkOutTime: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  cleaningFee: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  serviceFee: number;

  @Column('text', { nullable: true })
  houseRules: string | null;

  @Column('text', { nullable: true })
  cancellationPolicy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.properties)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @OneToMany(() => Booking, booking => booking.property)
  bookings: Booking[];

  @OneToMany(() => Review, review => review.property)
  reviews: Review[];

  @OneToMany(() => Favorite, favorite => favorite.property)
  favorites: Favorite[];

  // Вычисляемые поля
  averageRating?: number;
  reviewCount?: number;
  isFavorite?: boolean;
} 