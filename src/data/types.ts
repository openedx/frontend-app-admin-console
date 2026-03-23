export type ProfileImage = {
  has_image: boolean;
  image_url_full: string;
  image_url_large: string;
  image_url_medium: string;
  image_url_small: string;
};

export type UserAccount = {
  account_privacy: string;
  profile_image: ProfileImage;
  username: string;
  bio: string | null;
  course_certificates: unknown | null; // Type unclear from data
  country: string | null;
  date_joined: string; // ISO date string
  language_proficiencies: unknown[]; // Array type unclear from empty data
  level_of_education: string | null;
  social_links: unknown[]; // Array type unclear from empty data
  time_zone: string | null;
  name: string;
  email: string;
  id: number;
  verified_name: string | null;
  extended_profile: unknown[]; // Array type unclear from empty data
  gender: string | null;
  state: string | null;
  goals: string;
  is_active: boolean;
  last_login: string; // ISO date string
  mailing_address: string;
  requires_parental_consent: boolean;
  secondary_email: string | null;
  secondary_email_enabled: boolean | null;
  year_of_birth: number | null;
  phone_number: string | null;
  activation_key: string;
  pending_name_change: string | null;
};
