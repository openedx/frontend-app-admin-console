export type ProfileImage = {
  hasImage: boolean;
  imageUrlFull: string;
  imageUrlLarge: string;
  imageUrlMedium: string;
  imageUrlSmall: string;
};

export type UserAccount = {
  accountPrivacy: string;
  profileImage: ProfileImage;
  username: string;
  bio: string | null;
  courseCertificates: unknown | null; // Type unclear from data
  country: string | null;
  dateJoined: string; // ISO date string
  languageProficiencies: unknown[]; // Array type unclear from empty data
  levelOfEducation: string | null;
  socialLinks: unknown[]; // Array type unclear from empty data
  timeZone: string | null;
  name: string;
  email: string;
  id: number;
  verifiedName: string | null;
  extendedProfile: unknown[]; // Array type unclear from empty data
  gender: string | null;
  state: string | null;
  goals: string;
  isActive: boolean;
  lastLogin: string; // ISO date string
  mailingAddress: string;
  requiresParentalConsent: boolean;
  secondaryEmail: string | null;
  secondaryEmailEnabled: boolean | null;
  yearOfBirth: number | null;
  phoneNumber: string | null;
  activationKey: string;
  pendingNameChange: string | null;
};
