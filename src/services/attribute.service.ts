import type { Attribute, AttributeValue, AttributeFormData } from '../types/attribute.types';

// Datos simulados para desarrollo - temporal
const mockAttributes: Attribute[] = [
  {
    id_attribute: 1,
    name: 'Color',
    values: [
      { id_value: 1, value: 'Rojo' },
      { id_value: 2, value: 'Azul' },
      { id_value: 3, value: 'Verde' },
    ]
  },
  {
    id_attribute: 2,
    name: 'Tamaño',
    values: [
      { id_value: 4, value: 'G' },
      { id_value: 5, value: 'M' },
      { id_value: 6, value: 'P' },
    ]
  },
  {
    id_attribute: 3,
    name: 'Material',
    values: [
      { id_value: 7, value: 'Algodón' },
      { id_value: 8, value: 'Poliéster' },
      { id_value: 9, value: 'Lana' },
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

  // Operaciones CRUD
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
      return 'El nombre del atributo es requerido';
    }
    if (name.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    if (name.trim().length > 50) {
      return 'El nombre no puede exceder 50 caracteres';
    }
    
    const normalizedName = name.trim().toLowerCase();
    const existingAttribute = this.attributes.find(
      a => a.name.toLowerCase() === normalizedName && 
      (!currentId || a.id_attribute !== currentId)
    );
    
    if (existingAttribute) {
      return 'Ya existe un atributo con este nombre';
    }
    
    return null;
  }

  validateValue(value: string, currentValues: AttributeValue[], currentValueId?: number): string | null {
    if (!value.trim()) {
      return 'El valor no puede estar vacío';
    }
    
    const normalizedValue = value.trim().toLowerCase();
    const existingValue = currentValues.find(
      v => v.value.toLowerCase() === normalizedValue && 
      (!currentValueId || v.id_value !== currentValueId)
    );
    
    if (existingValue) {
      return 'Este valor ya existe';
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