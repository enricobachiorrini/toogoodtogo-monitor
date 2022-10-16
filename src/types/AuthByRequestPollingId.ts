export interface Response {
  access_token: string;
  access_token_ttl_seconds: number;
  refresh_token: string;
  startup_data: StartupData;
}

export interface StartupData {
  user: User;
  app_settings: AppSettings;
  user_settings: UserSettings;
  orders: Orders;
}

export interface User {
  user_id: string;
  name: string;
  country_id: string;
  email: string;
  phone_country_code: string;
  phone_number: string;
  is_partner: boolean;
  newsletter_opt_in: boolean;
  push_notifications_opt_in: boolean;
}

export interface AppSettings {
  countries: Country[];
  purchase_rating_start: string;
  purchase_rating_end: string;
  purchase_rating_delay: number;
}

export interface Country {
  country_iso_code: string;
  terms_url: string;
  terms_version: number;
  manufacturer_terms_url: string;
  manufacturer_terms_version: number;
  privacy_url: string;
  prompt_for_newsletter_opt_in: boolean;
}

export interface UserSettings {
  country_iso_code: string;
  phone_country_code_suggestion: string;
  is_user_email_verified: boolean;
  terms_url: string;
  terms_version: number;
  manufacturer_terms_url: string;
  manufacturer_terms_version: number;
  privacy_url: string;
  contact_form_url: string;
  blog_url: string;
  careers_url: string;
  education_url: string;
  instagram_url: string;
  store_signup_url: string;
  store_contact_url: string;
  bound_sw: BoundSw;
  bound_ne: BoundNe;
  meals_saved: MealsSaved;
  has_any_vouchers: boolean;
  can_show_best_before_explainer: boolean;
  has_expired_payment_methods: boolean;
  show_manufacturer_items: boolean;
  show_payment_card_issue_message: boolean;
  braze_external_id: string;
  has_active_email_change_request: boolean;
  approved_terms_and_conditions: any[];
  feature_experiments: any[];
}

export interface BoundSw {
  longitude: number;
  latitude: number;
}

export interface BoundNe {
  longitude: number;
  latitude: number;
}

export interface MealsSaved {
  country_iso_code: string;
  share_url: string;
  image_url: string;
  meals_saved_last_month: number;
  month: number;
  year: number;
}

export interface Orders {
  current_time: string;
  has_more: boolean;
  orders: any[];
}
