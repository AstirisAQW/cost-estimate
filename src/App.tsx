import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CatalogView } from './CatalogView';
import { ProjectInfoEditor } from './ProjectInfoEditor';
import { SectionsManager } from './SectionsManager';
import { SectionFormModal } from './SectionFormModal';
import { ItemFormModal } from './ItemFormModal';
import { AddSectionItemModal } from './AddSectionItemModal';
import { ProjectFormModal, NewProjectState } from './ProjectFormModal';

import { useAppStorage } from './useLocalStorage';
import { Project, CostItem, CatalogItem, Section } from './index';
import { exportCatalog, parseCatalogImport, importFromCSV } from './helpers';

const EMPTY_PROJECT: NewProjectState = {
  name: '',
  subject: '',
  location: { street: '', barangay: '', city: '', province: '', postalCode: '' },
  owner: '',
};

export default function App() {
  const {
    projects, setProjects,
    catalog, setCatalog,
    activeProjectId, setActiveProjectId,
    activeSectionId, setActiveSectionId,
  } = useAppStorage();

  // ── UI state ──────────────────────────────────────────────
  const [showSectionItemForm,    setShowSectionItemForm]    = useState(false);
  const [showCatalogForm,        setShowCatalogForm]        = useState(false);
  const [showProjectForm,        setShowProjectForm]        = useState(false);
  const [showSectionForm,        setShowSectionForm]        = useState(false);
  const [showCatalog,            setShowCatalog]            = useState(false);
  const [catalogSearch,          setCatalogSearch]          = useState('');
  const [newSectionTitle,        setNewSectionTitle]        = useState('');
  const [newProject,             setNewProject]             = useState<NewProjectState>(EMPTY_PROJECT);
  const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState<string | null>(null);
  const [importError,            setImportError]            = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<CostItem | null>(null);
  const _pendingCatalogEdit = React.useRef<CatalogItem | null>(null);

  // ── Derived active project ────────────────────────────────
  const activeProject = projects.find((p) => p.id === activeProjectId);

  // ── Helpers ───────────────────────────────────────────────
  const updateActiveProject = (updates: Partial<Project>) =>
    setProjects(projects.map((p) => (p.id === activeProjectId ? { ...p, ...updates } : p)));

  // ── Project CRUD ──────────────────────────────────────────
  const createProject = () => {
    if (!newProject.name) return;
    const firstSectionId = Math.random().toString(36).substr(2, 9);
    const project: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProject.name,
      subject: newProject.subject,
      location: { ...newProject.location },
      owner: newProject.owner,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      sections: [{
        id: firstSectionId,
        title: '',
        items: [],
        laborCost: 0,
        equipmentCost: 0,
        indirectCost: 0,
      }],
    };
    setProjects([...projects, project]);
    setActiveProjectId(project.id);
    setActiveSectionId(firstSectionId);
    setNewProject(EMPTY_PROJECT);
    setShowProjectForm(false);
  };

  const deleteProject = (id: string) => {
    const remainingProjects = projects.filter((p) => p.id !== id);
    setProjects(remainingProjects);
    if (activeProjectId === id) setActiveProjectId(remainingProjects[0]?.id ?? null);
    setConfirmDeleteProjectId(null);
  };

  // ── Section CRUD ──────────────────────────────────────────
  const addSection = () => {
    if (!newSectionTitle || !activeProjectId) return;
    const newSection: Section = {
      id: Math.random().toString(36).substr(2, 9),
      title: newSectionTitle,
      items: [],
      laborCost: 0,
      equipmentCost: 0,
      indirectCost: 0,
    };
    setProjects(projects.map((p) =>
      p.id === activeProjectId ? { ...p, sections: [...(p.sections ?? []), newSection] } : p,
    ));
    setNewSectionTitle('');
    setShowSectionForm(false);
    setActiveSectionId(newSection.id);
  };

  const moveSection = (direction: 'up' | 'down', sectionId: string) => {
    if (!activeProject?.sections) return;
    const sectionIndex = activeProject.sections.findIndex((s) => s.id === sectionId);
    if (direction === 'up' && sectionIndex === 0) return;
    if (direction === 'down' && sectionIndex === activeProject.sections.length - 1) return;
    const reorderedSections = [...activeProject.sections];
    const swapIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    [reorderedSections[sectionIndex], reorderedSections[swapIndex]] = [reorderedSections[swapIndex], reorderedSections[sectionIndex]];
    updateActiveProject({ sections: reorderedSections });
  };

  const removeSection = (sectionId: string) => {
    if (!activeProject?.sections) return;
    const remainingSections = activeProject.sections.filter((s) => s.id !== sectionId);
    updateActiveProject({ sections: remainingSections });
    if (activeSectionId === sectionId) setActiveSectionId(remainingSections[0]?.id ?? null);
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    if (!activeProject?.sections) return;
    updateActiveProject({
      sections: activeProject.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    });
  };

  const updateSectionCosts = (
    sectionId: string,
    field: 'laborCost' | 'equipmentCost' | 'indirectCost',
    value: number,
  ) => {
    setProjects(projects.map((p) =>
      p.id !== activeProjectId ? p : {
        ...p,
        sections: p.sections.map((s) =>
          s.id !== sectionId ? s : { ...s, [field]: value },
        ),
      },
    ));
  };

  // ── Section items ─────────────────────────────────────────
  const addItemsToSection = (newItems: Omit<CostItem, 'id'>[]) => {
    if (!activeProjectId || !activeSectionId) return;
    const itemsWithIds: CostItem[] = newItems.map((item) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
    }));
    setProjects(projects.map((p) =>
      p.id !== activeProjectId ? p : {
        ...p,
        sections: (p.sections ?? []).map((s) =>
          s.id !== activeSectionId ? s : { ...s, items: [...(s.items ?? []), ...itemsWithIds] },
        ),
      },
    ));
  };

  const updateSectionItem = (itemId: string, updates: Omit<CostItem, 'id'>) => {
    setProjects(projects.map((p) =>
      p.id !== activeProjectId ? p : {
        ...p,
        sections: (p.sections ?? []).map((s) => ({
          ...s,
          items: (s.items ?? []).map((item) =>
            item.id === itemId ? { ...updates, id: itemId } : item,
          ),
        })),
      },
    ));
  };

  const openEditItem = (item: CostItem, sectionId: string) => {
    setActiveSectionId(sectionId);
    setEditingItem(item);
    setShowSectionItemForm(true);
  };

  const openAddItems = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setEditingItem(null);
    setShowSectionItemForm(true);
  };

  const closeSectionItemForm = () => {
    setShowSectionItemForm(false);
    setEditingItem(null);
  };

  const removeItemFromSection = (itemId: string) => {
    setProjects(projects.map((p) =>
      p.id !== activeProjectId ? p : {
        ...p,
        sections: (p.sections ?? []).map((s) => ({
          ...s,
          items: (s.items ?? []).filter((item) => item.id !== itemId),
        })),
      },
    ));
  };

  // ── CSV import ────────────────────────────────────────────
  const handleImportCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedSections = importFromCSV(text);
        if (parsedSections.length === 0) {
          setImportError('No valid item rows found in the CSV file.');
          return;
        }
        // Append parsed sections (with fresh IDs) to the active project
        const sectionsWithIds: Section[] = parsedSections.map((s) => ({
          id: Math.random().toString(36).substr(2, 9),
          title: s.title,
          items: s.items,
          laborCost: 0,
          equipmentCost: 0,
          indirectCost: 0,
        }));
        setProjects(projects.map((p) =>
          p.id !== activeProjectId ? p : {
            ...p,
            sections: [...(p.sections ?? []), ...sectionsWithIds],
          },
        ));
        if (sectionsWithIds[0]) setActiveSectionId(sectionsWithIds[0].id);
      } catch {
        setImportError('Failed to parse the CSV file.');
      }
    };
    reader.readAsText(file);
  };

  // ── Catalog ───────────────────────────────────────────────
  const saveCatalogItems = (
    items: (Pick<CatalogItem, 'description' | 'unit' | 'unitCost'> & { id?: string })[],
  ) => {
    setCatalog((prev) => {
      let updatedCatalog = [...prev];
      for (const item of items) {
        if (item.id) {
          updatedCatalog = updatedCatalog.map((c) =>
            c.id === item.id
              ? { ...c, description: item.description, unit: item.unit, unitCost: item.unitCost }
              : c,
          );
        } else {
          updatedCatalog.push({
            id: Math.random().toString(36).substr(2, 9),
            description: item.description,
            unit: item.unit,
            unitCost: item.unitCost,
            section: activeProject?.sections?.find((s) => s.id === activeSectionId)?.title,
          });
        }
      }
      return updatedCatalog;
    });
  };

  // ── Catalog import ────────────────────────────────────────
  const handleImportCatalog = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedItems = parseCatalogImport(text);
        if (importedItems.length === 0) {
          setImportError('No valid items found in the catalog file.');
          return;
        }
        // Merge: skip duplicates by description+unit match
        setCatalog((prev) => {
          const existingKeys = new Set(prev.map((c) => `${c.description}|${c.unit}`));
          const newItems = importedItems.filter(
            (i) => !existingKeys.has(`${i.description}|${i.unit}`),
          );
          return [...prev, ...newItems];
        });
      } catch {
        setImportError('Failed to parse the catalog file.');
      }
    };
    reader.readAsText(file);
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#212529] font-sans overflow-hidden">
      <Sidebar
        projects={projects}
        catalog={catalog}
        activeProjectId={activeProjectId}
        showCatalog={showCatalog}
        onSelectProject={(id) => { setActiveProjectId(id); setShowCatalog(false); }}
        onShowCatalog={() => { setShowCatalog(true); setActiveProjectId(null); }}
        onNewProject={() => setShowProjectForm(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-8">
          {showCatalog ? (
            <CatalogView
              catalog={catalog}
              catalogSearch={catalogSearch}
              onSearchChange={setCatalogSearch}
              onAddToCatalog={() => {
                _pendingCatalogEdit.current = null;
                setShowCatalogForm(true);
              }}
              onEditCatalogItem={(item) => {
                _pendingCatalogEdit.current = item;
                setShowCatalogForm(true);
              }}
              onRemoveFromCatalog={(id) => setCatalog(catalog.filter((item) => item.id !== id))}
              onExportCatalog={() => exportCatalog(catalog)}
              onImportCatalog={handleImportCatalog}
            />
          ) : activeProject ? (
            <div className="max-w-6xl mx-auto">
              <ProjectInfoEditor
                project={activeProject}
                onUpdate={updateActiveProject}
                onDelete={() => setConfirmDeleteProjectId(activeProject.id)}
              />
              <SectionsManager
                project={activeProject}
                onAddSection={() => setShowSectionForm(true)}
                onEditItem={openEditItem}
                onRemoveItem={removeItemFromSection}
                onAddItemToSection={openAddItems}
                onUpdateSectionTitle={updateSectionTitle}
                onUpdateSectionCosts={updateSectionCosts}
                onMoveSection={moveSection}
                onRemoveSection={removeSection}
                onUpdateSubject={(subject) => updateActiveProject({ subject })}
                onImportCSV={handleImportCSV}
              />
            </div>
          ) : null}
        </main>
      </div>

      {/* ── Modals ── */}
      <SectionFormModal
        show={showSectionForm}
        title={newSectionTitle}
        onTitleChange={setNewSectionTitle}
        onSubmit={addSection}
        onClose={() => setShowSectionForm(false)}
      />

      <AddSectionItemModal
        show={showSectionItemForm}
        catalog={catalog}
        catalogSearch={catalogSearch}
        editingItem={editingItem}
        onCatalogSearchChange={setCatalogSearch}
        onAddItems={addItemsToSection}
        onUpdateItem={updateSectionItem}
        onClose={closeSectionItemForm}
      />

      <ItemFormModal
        show={showCatalogForm}
        catalog={catalog}
        catalogSearch={catalogSearch}
        initialEditItem={_pendingCatalogEdit.current}
        onCatalogSearchChange={setCatalogSearch}
        onSaveItems={saveCatalogItems}
        onDeleteCatalogItem={(id) => setCatalog((prev) => prev.filter((i) => i.id !== id))}
        onClose={() => {
          setShowCatalogForm(false);
          _pendingCatalogEdit.current = null;
        }}
      />

      <ProjectFormModal
        show={showProjectForm}
        newProject={newProject}
        onUpdate={setNewProject}
        onSubmit={createProject}
        onClose={() => setShowProjectForm(false)}
      />

      {/* ── Delete Project Confirmation ── */}
      {confirmDeleteProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-black text-zinc-900">Delete Project?</h3>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    "{projects.find((p) => p.id === confirmDeleteProjectId)?.name}" will be permanently removed.
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mb-6 bg-zinc-50 rounded-xl px-4 py-3">
                This action cannot be undone. All sections and listed items in this project will be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteProjectId(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteProject(confirmDeleteProjectId)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-lg shadow-red-100"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Import Error Toast ── */}
      {importError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-md">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p className="text-sm font-medium">{importError}</p>
          <button
            onClick={() => setImportError(null)}
            className="ml-2 text-red-200 hover:text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
