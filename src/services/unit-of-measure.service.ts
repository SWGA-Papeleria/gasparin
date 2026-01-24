import type { UnitOfMeasure, UnitOfMeasureFormData } from '../types/unit-of-measure.types';

// Mock data para desarrollo - temporal
const mockUnits: UnitOfMeasure[] = [
  { id_unit: 1, name: 'Piece' },
  { id_unit: 2, name: 'Package' },
  { id_unit: 3, name: 'Box' },
  { id_unit: 4, name: 'Meter' },
];

export class UnitOfMeasureService {
  private units: UnitOfMeasure[] = [...mockUnits];

  // CRUD Operations
  async getAll(): Promise<UnitOfMeasure[]> {
    // Simular delay de API
    return new Promise(resolve => {
      setTimeout(() => resolve([...this.units]), 300);
    });
  }

  async create(data: UnitOfMeasureFormData): Promise<UnitOfMeasure> {
    return new Promise(resolve => {
      setTimeout(() => {
        const newUnit: UnitOfMeasure = {
          id_unit: Math.max(...this.units.map(u => u.id_unit), 0) + 1,
          name: data.name.trim(),
        };
        this.units.push(newUnit);
        resolve(newUnit);
      }, 300);
    });
  }

  async update(id: number, data: UnitOfMeasureFormData): Promise<UnitOfMeasure> {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = this.units.findIndex(u => u.id_unit === id);
        const updatedUnit = { ...this.units[index], name: data.name.trim() };
        this.units[index] = updatedUnit;
        resolve(updatedUnit);
      }, 300);
    });
  }

  async delete(id: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.units = this.units.filter(u => u.id_unit !== id);
        resolve();
      }, 300);
    });
  }

  // Validaciones
  validateName(name: string, currentId?: number): string | null {
    if (!name.trim()) {
      return 'Unit name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Name cannot exceed 50 characters';
    }
    
    const normalizedName = name.trim().toLowerCase();
    const existingUnit = this.units.find(
      u => u.name.toLowerCase() === normalizedName && 
      (!currentId || u.id_unit !== currentId)
    );
    
    if (existingUnit) {
      return 'A unit with this name already exists';
    }
    
    return null;
  }

  // Filtrado
  filterUnits(units: UnitOfMeasure[], searchTerm: string, filtersApplied: boolean): UnitOfMeasure[] {
    if (!filtersApplied) return units;
    return units.filter(unit =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}

export const unitOfMeasureService = new UnitOfMeasureService();