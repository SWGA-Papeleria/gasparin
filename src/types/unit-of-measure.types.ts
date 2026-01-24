export interface UnitOfMeasure {
  id_unit: number;
  name: string;
}

export interface UnitOfMeasureFormData {
  name: string;
}

export interface UnitOfMeasureFilters {
  searchTerm: string;
  filtersApplied: boolean;
}