export interface AttributeValue {
  id_value: number;
  value: string;
}

export interface Attribute {
  id_attribute: number;
  name: string;
  values: AttributeValue[];
}

export interface AttributeFormData {
  name: string;
  values: AttributeValue[];
}

export interface AttributeFilters {
  searchTerm: string;
  filtersApplied: boolean;
}