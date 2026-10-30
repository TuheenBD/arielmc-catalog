export type ProductCategory = 'Leather' | 'Jute' | 'Ceramics' | 'Textiles' | 'Pottery';

export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromUsd: number; // e.g. USD: 1.0, GBP: 0.79, EUR: 0.92, AUD: 1.54
  flag: string;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar (Base FOB)', rateFromUsd: 1.0, flag: '🇺🇸' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (UK DCTS)', rateFromUsd: 0.79, flag: '🇬🇧' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EU GSP)', rateFromUsd: 0.92, flag: '🇪🇺' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateFromUsd: 1.54, flag: '🇦🇺' },
};

export interface ProductDimensions {
  heightMm: number;
  widthMm: number;
  depthMm: number;
}

export interface MasterCartonLogistics {
  unitsPerCarton: number;
  heightMm: number;
  widthMm: number;
  depthMm: number;
  grossWeightKg: number;
  cbm: number; // Volume in cubic meters (L × W × H in meters)
  unitsPer20ftContainer?: number;
  unitsPer40ftContainer?: number;
}

export interface TechnicalSpecifications {
  testStandard?: string; // e.g., 'AQL 1.5/2.5 Major/Minor (ISO 2859-1)'
  chemicalCompliance?: string; // e.g., 'REACH SVHC Compliant, Chromium-VI Free, Azo-Free Dyes'
  foodSafety?: string; // e.g., 'LFGB & FDA 21 CFR 175.300 Lead/Cadmium Leaching Certified'
  colorFastness?: string; // e.g., 'ISO 105-C06 Color fastness to domestic washing: Grade 4-5'
  seamStrength?: string; // e.g., 'Tensile load capacity 250N / 15kg drop test'
  finishing?: string;
  barcodePackaging?: string; // e.g., 'Individual polybag with warning label + GS1 barcode, 5-ply export carton'
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  divisionTitle: string;
  description: string;
  price: number; // Base USD FOB
  currency: string;
  moq: number;
  dimensions: ProductDimensions;
  materials: string[];
  imageUrl: string;
  aspectRatio: number;
  weightGrams?: number;
  originHub?: string;
  complianceCertifications?: string[];
  inStock: boolean;
  leadTimeWeeks?: number;

  // --- Western Corporate & Enterprise Sourcing Additions ---
  hsCode: string; // e.g., '4202.11.00', '6305.10.10'
  tariffPreferences?: string[]; // e.g., ['UK DCTS 0% Duty', 'EU GSP 0% Duty', 'US MFN']
  masterCarton: MasterCartonLogistics;
  sampleLeadTimeDays: number; // e.g. 7-10 days via DHL/FedEx Express
  samplePriceUsd?: number; // Cost for courier tech-pack sample
  incoTermsAvailable?: string[]; // e.g., ['FOB Chittagong', 'DAC Dhaka Air Cargo', 'CIF Felixstowe', 'CIF Rotterdam', 'CIF Los Angeles', 'DDP by Request']
  technicalSpecs?: TechnicalSpecifications;
}

export interface FilterState {
  searchQuery: string;
  selectedCategories: ProductCategory[];
  priceRange: [number, number];
  selectedMaterials: string[];
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'sku-asc';
}

export interface ExportConsigneeInfo {
  companyName: string;
  contactName: string;
  contactEmail: string;
  targetMarket: string;
  targetPort?: string;
  incoTerm?: string;
  courierAccount?: string; // e.g. 'DHL #123456789 or ArielMC Prepaid'
  deliveryAddress?: string;
  notes?: string;
  requestType?: 'linesheet' | 'sample_dispatch' | 'rfq_quote';
}

export interface PDFExportPayload {
  consignee: ExportConsigneeInfo;
  products: Product[];
  generatedAt: string;
  documentTitle?: string;
  selectedCurrency?: CurrencyCode;
  currencyRate?: number;
  currencySymbol?: string;
  incoTerm?: string;
  totalEstimatedCbm?: number;
  totalEstimatedWeightKg?: number;
  totalEstimatedCartons?: number;
}
