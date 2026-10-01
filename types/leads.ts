export const CAMPAIGN_VALUES = [
  "facebook",
  "instagram",
  "tiktok",
  "whatsapp",
  "google",
  "other",
] as const;

export type CampaignValue = (typeof CAMPAIGN_VALUES)[number] | "";

export interface LeadRow {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  campaign: CampaignValue;
  product1: string;
  product2: string;
  product3: string;
  product4: string;
  product5: string;
}

export interface LeadRowWithValidation extends LeadRow {
  rowIndex: number;
  errors: string[];
}

export const TEMPLATE_HEADERS: string[] = [
  "Full Name",
  "Email",
  "Phone",
  "Address 1",
  "Address 2",
  "City",
  "State",
  "Country",
  "Postal Code",
  "Campaign",
  "Product 1",
  "Product 2",
  "Product 3",
  "Product 4",
  "Product 5",
];

export const HEADER_TO_FIELD: Record<string, keyof LeadRow> = {
  "Full Name": "fullName",
  Email: "email",
  Phone: "phone",
  "Address 1": "address1",
  "Address 2": "address2",
  City: "city",
  State: "state",
  Country: "country",
  "Postal Code": "postalCode",
  Campaign: "campaign",
  "Product 1": "product1",
  "Product 2": "product2",
  "Product 3": "product3",
  "Product 4": "product4",
  "Product 5": "product5",
};

export enum LEAD_CAMPAIGN {
  FACEBOOK = "FACEBOOK",
  INSTAGRAM = "INSTAGRAM",
  TIKTOK = "TIKTOK",
  WHATSAPP = "WHATSAPP",
  GOOGLE = "GOOGLE",
  OTHER = "OTHER",
}

export enum LEAD_STATUS {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  NO_ANSWER = "NO_ANSWER",
  INTERESTED = "INTERESTED",
  ORDERED = "ORDERED",
  NOT_INTERESTED = "NOT_INTERESTED",
}

export interface Lead {
  id: string;
  storeId: string;
  fullName: string;
  phone: string;
  email?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  source?: LEAD_CAMPAIGN;
  productSKUs?: string[];
  status: LEAD_STATUS;
  note?: string;
  followUpDate?: string | null;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}
