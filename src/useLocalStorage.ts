import { useState, useEffect } from 'react';
import { Project, CatalogItem } from './index';

export function useAppStorage() {
  const [projects,        setProjects]        = useState<Project[]>([]);
  const [catalog,         setCatalog]         = useState<CatalogItem[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [initialized,     setInitialized]     = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    const savedCatalog  = localStorage.getItem('catalog');

    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);

        const migrated: Project[] = (parsed as any[]).map((p: any) => {
          let sections = p.sections;

          if (!sections) {
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

          sections = sections.map((s: any) => ({
            id: s.id,
            title: s.title,
            items: (s.items ?? []).map((item: any) => ({
              id:          item.id,
              description: item.description ?? '',
              qty:         item.qty ?? 0,
              unit:        item.unit ?? '',
              unitCost:    item.unitCost ?? 0,
            })),
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
        // On parse error start blank — do not inject a default
        setProjects([]);
      }
    }
    // No else — if nothing saved, start with empty list

    if (savedCatalog) {
      try {
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
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects, initialized]);

  // Persist catalog
  useEffect(() => {
    if (initialized) {
      localStorage.setItem('catalog', JSON.stringify(catalog));
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
