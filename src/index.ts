export interface CostItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitCost: number;
}

export interface Section {
  id: string;
  title: string;
  items: CostItem[];
  laborCost: number;
  equipmentCost: number;
  indirectCost: number;
}

export interface CatalogItem {
  id: string;
  description: string;
  unit: string;
  unitCost: number;
  section?: string;
}

export interface Project {
  id: string;
  name: string;
  location: {
    street: string;
    barangay: string;
    city: string;
    province: string;
    postalCode: string;
  };
  owner: string;
  subject: string;
  date: string;
  sections: Section[];
}

export const INITIAL_ITEM: Omit<CostItem, 'id'> = {
  description: '',
  qty: 0,
  unit: '',
  unitCost: 0,
};
