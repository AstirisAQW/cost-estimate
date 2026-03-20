import { useState, useEffect } from 'react';
import { Project, CatalogItem } from './index';

const DEFAULT_PROJECT: Project = {
  id: 'default-1',
  name: 'Sample Project',
  subject: 'Cost Estimate',
  location: {
    street: '',
    barangay: '',
    city: '',
    province: '',
    postalCode: '',
  },
  owner: 'John Doe',
  date: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  sections: [{
    id: 'sec-1',
    title: 'General Requirements',
    items: [],
    laborCost: 0,
    equipmentCost: 0,
    indirectCost: 0,
  }],
};

export function useAppStorage() {
  const [projects,        setProjects]        = useState<Project[]>([]);
  const [catalog,         setCatalog]         = useState<CatalogItem[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [initialized,     setInitialized]     = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('engitrack_projects');
    const savedCatalog  = localStorage.getItem('engitrack_catalog');

    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);

        // Migrate legacy data:
        // - sections may not exist (old format stored items at project level)
        // - sections may not have laborCost/equipmentCost/indirectCost
        // - items may have old derived cost fields (strip them)
        const migrated: Project[] = (parsed as any[]).map((p: any) => {
          let sections = p.sections;

          if (!sections) {
            // Very old format: items were at project level
            sections = p.items
              ? [{
                  id: 'migrated-' + Math.random().toString(36).substr(2, 9),
                  title: 'General',
                  items: p.items,
                  laborCost: 0,
                  equipmentCost: 0,
                  indirectCost: 0,
                }]
              : [];
          }

          // Ensure each section has the new cost fields + clean items
          sections = sections.map((s: any) => ({
            id: s.id,
            title: s.title,
            items: (s.items ?? []).map((item: any) => ({
              id: item.id,
              description: item.description ?? '',
              qty: item.qty ?? 0,
              unit: item.unit ?? '',
              unitCost: item.unitCost ?? 0,
            })),
            // Prefer saved section-level costs; fall back to 0
            // (old items had laborCost/equipmentCost — we ignore per-item ones)
            laborCost:     s.laborCost     ?? 0,
            equipmentCost: s.equipmentCost ?? 0,
            indirectCost:  s.indirectCost  ?? 0,
          }));

          return {
            id:       p.id,
            name:     p.name,
            subject:  p.subject  ?? '',
            location: p.location ?? { street: '', barangay: '', city: '', province: '', postalCode: '' },
            owner:    p.owner    ?? '',
            date:     p.date     ?? '',
            sections,
          };
        });

        setProjects(migrated);
        if (migrated.length > 0) {
          setActiveProjectId(migrated[0].id);
          if (migrated[0].sections.length > 0) {
            setActiveSectionId(migrated[0].sections[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to parse saved projects', e);
        setProjects([DEFAULT_PROJECT]);
        setActiveProjectId(DEFAULT_PROJECT.id);
        setActiveSectionId('sec-1');
      }
    } else {
      setProjects([DEFAULT_PROJECT]);
      setActiveProjectId(DEFAULT_PROJECT.id);
      setActiveSectionId('sec-1');
    }

    if (savedCatalog) {
      try {
        // Migrate catalog items — strip old cost fields
        const parsed = JSON.parse(savedCatalog);
        const migrated: CatalogItem[] = (parsed as any[]).map((c: any) => ({
          id:          c.id,
          description: c.description ?? '',
          unit:        c.unit ?? '',
          unitCost:    c.unitCost ?? 0,
          section:     c.section,
        }));
        setCatalog(migrated);
      } catch (e) {
        console.error('Failed to parse saved catalog', e);
      }
    }

    setInitialized(true);
  }, []);

  // Persist projects
  useEffect(() => {
    if (initialized) {
      localStorage.setItem('engitrack_projects', JSON.stringify(projects));
    }
  }, [projects, initialized]);

  // Persist catalog
  useEffect(() => {
    if (initialized) {
      localStorage.setItem('engitrack_catalog', JSON.stringify(catalog));
    }
  }, [catalog, initialized]);

  return {
    projects,
    setProjects,
    catalog,
    setCatalog,
    activeProjectId,
    setActiveProjectId,
    activeSectionId,
    setActiveSectionId,
  };
}
