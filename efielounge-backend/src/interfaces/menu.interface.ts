import { ObjectId } from "mongoose";

export interface Imenu {
  slug?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  currency?: string;
  status?: string;
  createdAt?:Date;
  attachments?:string[]
}

export interface ImenuCategory {
  name: string;
  createdAt?: Date;
}

export interface ImenuItem{
  name: string;
  description: string;
  price: number;
  category: string;
  currency?: string;
  status?: string;
  attachments?:string[]
}

export interface ImenuItemCategory{
  name: string;
  createdAt?: Date;
}


