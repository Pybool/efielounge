import { ObjectId } from "mongoose";

export interface Imenu {
  _id?: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  currency?: string;
  status?: string;
  createdAt?:Date;
  archive?:boolean;
  attachments?:string[]
}

export interface ImenuCategory {
  _id?: string;
  name: string;
  archive?:boolean;
  createdAt?: Date;
}

export interface ImenuItem{
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  currency?: string;
  status?: string;
  attachments?:string[],
  archive?:boolean;
}

export interface ImenuItemCategory{
  _id?: string;
  name: string;
  archive?:boolean;
  createdAt?: Date;
}


