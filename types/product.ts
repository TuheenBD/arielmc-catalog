export type ProductCategory = 'Leather' | 'Jute' | 'Ceramics' | 'Textiles' | 'Pottery';

export interface ProductDimensions {
  heightMm: number;
  widthMm: number;
  depthMm: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  divisionTitle: string;
  description: string;
  price: number;
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
  notes?: string;
}

export interface PDFExportPayload {
  consignee: ExportConsigneeInfo;
  products: Product[];
  generatedAt: string;
  documentTitle?: string;
}
