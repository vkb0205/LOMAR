import type { Database } from '../../shared/types/database';

export interface SelectedOptionDetail {
  optionGroupId: string;
  optionGroupName: string;
  valueId: string;
  valueName: string;
  price: number;
}

export interface CustomizedService {
  category: string;
  productId: string;
  productName: string;
  basePrice: number;
  totalPrice: number;
  imageUrl: string;
  vendorName: string;
  selectedOptions: SelectedOptionDetail[];
}

export interface CustomizationState {
  customizedServices: Record<string, CustomizedService>;
  saveCustomizedService: (
    category: string,
    service: CustomizedService
  ) => void;
}

export type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];
export type ServiceRow = Database['public']['Tables']['services']['Row'];
export type ServiceImageRow = Database['public']['Tables']['service_images']['Row'];
export type VendorRow = Database['public']['Tables']['vendors']['Row'];
export type MannequinType = 'female' | 'male';

export interface ChatBubbleMessage {
  text: string;
  isUser: boolean;
}

export interface CustomizeCatalog {
  services: ServiceRow[];
  vendorsById: Record<string, VendorRow>;
  imagesByServiceId: Record<string, string[]>;
  tabs: string[];
}
