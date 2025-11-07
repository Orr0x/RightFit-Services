export interface Property {
  id: string;
  address: string;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  square_footage?: number;
  is_active: boolean;
  special_instructions?: string;
  landlord?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}
