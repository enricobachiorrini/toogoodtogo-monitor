export interface Response {
  mobile_bucket: MobileBucket;
}

export interface MobileBucket {
  filler_type: string;
  title: string;
  description: string;
  items: Item[];
  bucket_type: string;
  display_type: string;
}

export interface Item {
  item: Item2;
  store: Store;
  display_name: string;
  pickup_interval?: PickupInterval;
  pickup_location: PickupLocation;
  purchase_end?: string;
  items_available: number;
  sold_out_at?: string;
  distance: number;
  favorite: boolean;
  in_sales_window: boolean;
  new_item: boolean;
}

export interface Item2 {
  item_id: string;
  sales_taxes: SalesTax[];
  tax_amount: TaxAmount;
  price_excluding_taxes: PriceExcludingTaxes;
  price_including_taxes: PriceIncludingTaxes;
  value_excluding_taxes: ValueExcludingTaxes;
  value_including_taxes: ValueIncludingTaxes;
  taxation_policy: string;
  show_sales_taxes: boolean;
  cover_picture: CoverPicture;
  logo_picture: LogoPicture;
  name: string;
  description: string;
  can_user_supply_packaging: boolean;
  packaging_option: string;
  collection_info?: string;
  diet_categories: any[];
  item_category: string;
  buffet: boolean;
  badges: Badge[];
  positive_rating_reasons: string[];
  average_overall_rating: AverageOverallRating;
  favorite_count: number;
  food_handling_instructions?: string;
}

export interface SalesTax {
  tax_description: string;
  tax_percentage: number;
}

export interface TaxAmount {
  code: Dinero.Currency;
  minor_units: number;
  decimals: number;
}

export interface PriceExcludingTaxes {
  code: Dinero.Currency;
  minor_units: number;
  decimals: number;
}

export interface PriceIncludingTaxes {
  code: Dinero.Currency;
  minor_units: number;
  decimals: number;
}

export interface ValueExcludingTaxes {
  code: Dinero.Currency;
  minor_units: number;
  decimals: number;
}

export interface ValueIncludingTaxes {
  code: Dinero.Currency;
  minor_units: number;
  decimals: number;
}

export interface CoverPicture {
  picture_id: string;
  current_url: string;
  is_automatically_created: boolean;
}

export interface LogoPicture {
  picture_id: string;
  current_url: string;
  is_automatically_created: boolean;
}

export interface Badge {
  badge_type: string;
  rating_group: string;
  percentage: number;
  user_count: number;
  month_count: number;
}

export interface AverageOverallRating {
  average_overall_rating: number;
  rating_count: number;
  month_count: number;
}

export interface Store {
  store_id: string;
  store_name: string;
  branch?: string;
  description: string;
  tax_identifier: string;
  website: string;
  store_location: StoreLocation;
  logo_picture: LogoPicture;
  store_time_zone: string;
  hidden: boolean;
  favorite_count: number;
  we_care: boolean;
  distance: number;
  cover_picture: CoverPicture;
  is_manufacturer: boolean;
}

export interface StoreLocation {
  address: Address;
  location: Location;
}

export interface Address {
  country: Country;
  address_line: string;
  city: string;
  postal_code: string;
}

export interface Country {
  iso_code: string;
  name: string;
}

export interface Location {
  longitude: number;
  latitude: number;
}

export interface PickupInterval {
  start: string;
  end: string;
}

export interface PickupLocation {
  address: Address;
  location: Location;
}
