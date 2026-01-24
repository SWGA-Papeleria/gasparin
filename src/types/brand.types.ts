export interface Brand {
  id_brand: number;
  name: string;
}

export interface BrandFormData {
  name: string;
}

export interface BrandFilters {
  searchTerm: string;
  filtersApplied: boolean;
}