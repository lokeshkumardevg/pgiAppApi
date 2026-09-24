import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ required: true, trim: true })
  size: string; // e.g. "1850 Sq.Ft" or "250 Sq.Yd"

  @Prop({ required: true, trim: true })
  project: string; // e.g. "DLF Camellias" or "Ace Aspire"

  @Prop({ required: true, trim: true })
  address: string; // Location / Address

  @Prop({ required: true, trim: true })
  unitType: string; // "2 BHK" | "3 BHK" | "4 BHK" | "Farm House" | "Plot" | "Villa" | "Commercial"

  @Prop({ required: true, trim: true })
  unitNo: string; // Flat/Villa/Plot No e.g. "A-402", "Villa 12", "Plot 45"

  @Prop({ required: true, trim: true })
  contactNo: string; // Contact phone number

  @Prop({ required: true, trim: true })
  brokerName: string; // Broker / Associate name

  @Prop({ required: true, trim: true })
  date: string; // Listing date e.g. "2026-09-17"

  @Prop({ default: '', trim: true })
  price?: string; // e.g. "₹1.75 Cr"

  @Prop({ default: 'Available', trim: true })
  status: string; // "Available" | "Under Discussion" | "Booked" | "Sold"

  @Prop({ default: '', trim: true })
  notes?: string;

  @Prop({ default: 'Admin' })
  createdBy?: string;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
