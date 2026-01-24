import type { Brand, BrandFormData } from '../types/brand.types';

// Mock data para desarrollo - temporal
const mockBrands: Brand[] = [
  { id_brand: 1, name: 'BIC' },
  { id_brand: 2, name: 'Norma' },
  { id_brand: 3, name: 'Faber-Castell' },
  { id_brand: 4, name: 'Pilot' },
  { id_brand: 5, name: 'Staedtler' },
];

export class BrandService {
  private brands: Brand[] = [...mockBrands];

  // CRUD Operations
  async getAll(): Promise<Brand[]> {
    // Simular delay de API
    return new Promise(resolve => {
      setTimeout(() => resolve([...this.brands]), 300);
    });
  }

  async create(data: BrandFormData): Promise<Brand> {
    return new Promise(resolve => {
      setTimeout(() => {
        const newBrand: Brand = {
          id_brand: Math.max(...this.brands.map(b => b.id_brand), 0) + 1,
          name: data.name.trim(),
        };
        this.brands.push(newBrand);
        resolve(newBrand);
      }, 300);
    });
  }

  async update(id: number, data: BrandFormData): Promise<Brand> {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = this.brands.findIndex(b => b.id_brand === id);
        const updatedBrand = { ...this.brands[index], name: data.name.trim() };
        this.brands[index] = updatedBrand;
        resolve(updatedBrand);
      }, 300);
    });
  }

  async delete(id: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.brands = this.brands.filter(b => b.id_brand !== id);
        resolve();
      }, 300);
    });
  }

  // Validaciones
  validateName(name: string, currentId?: number): string | null {
    if (!name.trim()) {
      return 'Brand name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Name cannot exceed 50 characters';
    }
    
    const normalizedName = name.trim().toLowerCase();
    const existingBrand = this.brands.find(
      b => b.name.toLowerCase() === normalizedName && 
      (!currentId || b.id_brand !== currentId)
    );
    
    if (existingBrand) {
      return 'A brand with this name already exists';
    }
    
    return null;
  }

  // Filtrado
  filterBrands(brands: Brand[], searchTerm: string, filtersApplied: boolean): Brand[] {
    if (!filtersApplied) return brands;
    return brands.filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}

export const brandService = new BrandService();