import React, { useState } from 'react';
import { Plus, Folder, AlertTriangle } from 'lucide-react';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CatalogView } from './CatalogView';
import { ProjectInfoEditor } from './ProjectInfoEditor';
import { SectionsManager } from './SectionsManager';
import { SectionFormModal } from './SectionFormModal';
import { ItemFormModal } from './ItemFormModal';
import { ProjectFormModal, NewProjectState } from './ProjectFormModal';

import { useAppStorage } from './useLocalStorage';
import { Project, CostItem, CatalogItem, INITIAL_ITEM } from './index';

const EMPTY_PROJECT: NewProjectState = {
  name: '',
  subject: 'Estimate Items',
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
  const [showManualForm,         setShowManualForm]         = useState(false);
  const [showProjectForm,        setShowProjectForm]        = useState(false);
  const [showSectionForm,        setShowSectionForm]        = useState(false);
  const [showCatalog,            setShowCatalog]            = useState(false);
  const [catalogSearch,          setCatalogSearch]          = useState('');
  const [newSectionTitle,        setNewSectionTitle]        = useState('');
  const [newProject,             setNewProject]             = useState<NewProjectState>(EMPTY_PROJECT);
  const [newItem,                setNewItem]                = useState<Omit<CostItem, 'id'>>(INITIAL_ITEM);
  const [editingItemId,          setEditingItemId]          = useState<string | null>(null);
  const [editingCatalogId,       setEditingCatalogId]       = useState<string | null>(null);
  const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState<string | null>(null);

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
      subject: newProject.subject || 'Estimate Items',
      location: { ...newProject.location },
      owner: newProject.owner,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      sections: [{
        id: firstSectionId,
        title: 'General Requirements',
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
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    if (activeProjectId === id) {
      setActiveProjectId(updated[0]?.id ?? null);
    }
    setConfirmDeleteProjectId(null);
  };

  // ── Section CRUD ──────────────────────────────────────────
  const addSection = () => {
    if (!newSectionTitle || !activeProjectId) return;
    const section = {
      id: Math.random().toString(36).substr(2, 9),
      title: newSectionTitle,
      items: [],
      laborCost: 0,
      equipmentCost: 0,
      indirectCost: 0,
    };
    setProjects(projects.map((p) =>
      p.id === activeProjectId ? { ...p, sections: [...(p.sections ?? []), section] } : p,
    ));
    setNewSectionTitle('');
    setShowSectionForm(false);
    setActiveSectionId(section.id);
  };

  const moveSection = (direction: 'up' | 'down', sectionId: string) => {
    if (!activeProject?.sections) return;
    const idx = activeProject.sections.findIndex((s) => s.id === sectionId);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === activeProject.sections.length - 1) return;
    const newSections = [...activeProject.sections];
    const target = direction === 'up' ? idx - 1 : idx + 1;
    [newSections[idx], newSections[target]] = [newSections[target], newSections[idx]];
    updateActiveProject({ sections: newSections });
  };

  const removeSection = (sectionId: string) => {
    if (!activeProject?.sections) return;
    const updated = activeProject.sections.filter((s) => s.id !== sectionId);
    updateActiveProject({ sections: updated });
    if (activeSectionId === sectionId) setActiveSectionId(updated[0]?.id ?? null);
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

  // ── Item CRUD ─────────────────────────────────────────────
  const addItemToProject = () => {
    if (!activeProjectId || !activeSectionId) return;

    if (editingItemId) {
      setProjects(projects.map((p) =>
        p.id !== activeProjectId ? p : {
          ...p,
          sections: (p.sections ?? []).map((s) => ({
            ...s,
            items: (s.items ?? []).map((item) =>
              item.id === editingItemId ? { ...newItem, id: editingItemId } : item,
            ),
          })),
        },
      ));
    } else {
      const itemWithId: CostItem = { ...newItem, id: Math.random().toString(36).substr(2, 9) };
      setProjects(projects.map((p) =>
        p.id !== activeProjectId ? p : {
          ...p,
          sections: (p.sections ?? []).map((s) =>
            s.id === activeSectionId ? { ...s, items: [...(s.items ?? []), itemWithId] } : s,
          ),
        },
      ));
    }

    setNewItem(INITIAL_ITEM);
    setEditingItemId(null);
    setShowManualForm(false);
  };

  const editItem = (item: CostItem, sectionId: string) => {
    const { id, ...rest } = item;
    setNewItem(rest);
    setEditingItemId(id);
    setActiveSectionId(sectionId);
    setShowManualForm(true);
  };

  const removeItemFromProject = (itemId: string) => {
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

  // ── Catalog ───────────────────────────────────────────────
  const saveToCatalog = () => {
    if (editingCatalogId) {
      setCatalog((prev) =>
        prev.map((c) =>
          c.id !== editingCatalogId ? c : {
            ...c,
            description: newItem.description,
            unit: newItem.unit,
            unitCost: newItem.unitCost,
          },
        ),
      );
      setEditingCatalogId(null);
    } else {
      const catalogItem: CatalogItem = {
        id: Math.random().toString(36).substr(2, 9),
        section: activeProject?.sections?.find((s) => s.id === activeSectionId)?.title,
        description: newItem.description,
        unit: newItem.unit,
        unitCost: newItem.unitCost,
      };
      setCatalog([...catalog, catalogItem]);
    }
  };

  const loadFromCatalog = (item: CatalogItem) => {
    setNewItem({
      ...INITIAL_ITEM,
      description: item.description,
      unit: item.unit,
      unitCost: item.unitCost,
      qty: 0,
    });
    setShowManualForm(true);
    setEditingCatalogId(null);
  };

  const handleEditCatalogItem = (item: CatalogItem) => {
    loadFromCatalog(item);
    setEditingCatalogId(item.id);
  };

  const closeItemForm = () => {
    setShowManualForm(false);
    setEditingItemId(null);
    setEditingCatalogId(null);
    setNewItem(INITIAL_ITEM);
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
                setEditingItemId(null);
                setEditingCatalogId(null);
                setNewItem(INITIAL_ITEM);
                setShowManualForm(true);
              }}
              onRemoveFromCatalog={(id) => setCatalog(catalog.filter((item) => item.id !== id))}
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
                onEditItem={editItem}
                onRemoveItem={removeItemFromProject}
                onAddItemToSection={(sectionId) => {
                  setActiveSectionId(sectionId);
                  setShowManualForm(true);
                }}
                onUpdateSectionTitle={updateSectionTitle}
                onUpdateSectionCosts={updateSectionCosts}
                onMoveSection={moveSection}
                onRemoveSection={removeSection}
                onUpdateSubject={(subject) => updateActiveProject({ subject })}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                <Folder className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Select or Create a Project</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                Use the sidebar to manage your engineering projects and estimates.
              </p>
              <button
                onClick={() => setShowProjectForm(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create New Project
              </button>
            </div>
          )}
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

      <ItemFormModal
        show={showManualForm}
        newItem={newItem}
        catalog={catalog}
        catalogSearch={catalogSearch}
        editingItemId={editingItemId}
        editingCatalogId={editingCatalogId}
        showCatalog={showCatalog}
        onItemChange={setNewItem}
        onCatalogSearchChange={setCatalogSearch}
        onLoadFromCatalog={loadFromCatalog}
        onEditCatalogItem={handleEditCatalogItem}
        onDeleteCatalogItem={(id) => {
          setCatalog((prev) => prev.filter((i) => i.id !== id));
          if (editingCatalogId === id) setEditingCatalogId(null);
        }}
        onSaveToCatalog={saveToCatalog}
        onAddItem={addItemToProject}
        onClose={closeItemForm}
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
                    "{projects.find(p => p.id === confirmDeleteProjectId)?.name}" will be permanently removed.
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mb-6 bg-zinc-50 rounded-xl px-4 py-3">
                This action cannot be undone. All sections and estimate items in this project will be lost.
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
    </div>
  );
}
