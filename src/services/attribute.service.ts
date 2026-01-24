import type { Attribute, AttributeValue, AttributeFormData } from '../types/attribute.types';

// Mock data para desarrollo - temporal
const mockAttributes: Attribute[] = [
  {
    id_attribute: 1,
    name: 'Color',
    values: [
      { id_value: 1, value: 'Red' },
      { id_value: 2, value: 'Blue' },
      { id_value: 3, value: 'Green' },
    ]
  },
  {
    id_attribute: 2,
    name: 'Size',
    values: [
      { id_value: 4, value: 'S' },
      { id_value: 5, value: 'M' },
      { id_value: 6, value: 'L' },
    ]
  },
  {
    id_attribute: 3,
    name: 'Material',
    values: [
      { id_value: 7, value: 'Cotton' },
      { id_value: 8, value: 'Polyester' },
    ]
  },
];

export class AttributeService {
  private attributes: Attribute[] = [...mockAttributes];
  private tempIdCounter = -1;

  // Generar ID temporal para valores
  private getNextTempId(): number {
    return this.tempIdCounter--;
  }

  // CRUD Operations
  async getAll(): Promise<Attribute[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve([...this.attributes]), 300);
    });
  }

  async create(data: AttributeFormData): Promise<Attribute> {
    return new Promise(resolve => {
      setTimeout(() => {
        // Convertir IDs temporales a positivos
        const normalizedValues = data.values.map(value => ({
          ...value,
          id_value: value.id_value < 0 
            ? Math.max(...this.attributes.flatMap(a => a.values.map(v => v.id_value)), 0) + 1 
            : value.id_value
        }));

        const newAttribute: Attribute = {
          id_attribute: Math.max(...this.attributes.map(a => a.id_attribute), 0) + 1,
          name: data.name.trim(),
          values: normalizedValues,
        };
        this.attributes.push(newAttribute);
        resolve(newAttribute);
      }, 300);
    });
  }

  async update(id: number, data: AttributeFormData): Promise<Attribute> {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = this.attributes.findIndex(a => a.id_attribute === id);
        
        // Convertir IDs temporales a positivos
        const normalizedValues = data.values.map(value => ({
          ...value,
          id_value: value.id_value < 0 
            ? Math.max(...this.attributes.flatMap(a => a.values.map(v => v.id_value)), 0) + 1 
            : value.id_value
        }));

        const updatedAttribute = { 
          ...this.attributes[index], 
          name: data.name.trim(),
          values: normalizedValues
        };
        this.attributes[index] = updatedAttribute;
        resolve(updatedAttribute);
      }, 300);
    });
  }

  async delete(id: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.attributes = this.attributes.filter(a => a.id_attribute !== id);
        resolve();
      }, 300);
    });
  }

  // Validaciones
  validateName(name: string, currentId?: number): string | null {
    if (!name.trim()) {
      return 'Attribute name is required';
    }
    if (name.trim().length < 3) {
      return 'Name must be at least 3 characters';
    }
    if (name.trim().length > 50) {
      return 'Name cannot exceed 50 characters';
    }
    
    const normalizedName = name.trim().toLowerCase();
    const existingAttribute = this.attributes.find(
      a => a.name.toLowerCase() === normalizedName && 
      (!currentId || a.id_attribute !== currentId)
    );
    
    if (existingAttribute) {
      return 'An attribute with this name already exists';
    }
    
    return null;
  }

  validateValue(value: string, currentValues: AttributeValue[], currentValueId?: number): string | null {
    if (!value.trim()) {
      return 'Value cannot be empty';
    }
    
    const normalizedValue = value.trim().toLowerCase();
    const existingValue = currentValues.find(
      v => v.value.toLowerCase() === normalizedValue && 
      (!currentValueId || v.id_value !== currentValueId)
    );
    
    if (existingValue) {
      return 'This value already exists';
    }
    
    return null;
  }

  // Filtrado
  filterAttributes(attributes: Attribute[], searchTerm: string, filtersApplied: boolean): Attribute[] {
    if (!filtersApplied) return attributes;
    return attributes.filter(attribute =>
      attribute.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Métodos auxiliares para valores
  createTempValue(value: string): AttributeValue {
    return {
      id_value: this.getNextTempId(),
      value: value.trim(),
    };
  }

  updateValueInList(values: AttributeValue[], id: number, newValue: string): AttributeValue[] {
    return values.map(value =>
      value.id_value === id ? { ...value, value: newValue.trim() } : value
    );
  }

  removeValueFromList(values: AttributeValue[], id: number): AttributeValue[] {
    return values.filter(value => value.id_value !== id);
  }
}

export const attributeService = new AttributeService();