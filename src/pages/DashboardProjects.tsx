import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { projectSchema } from '@/schemas/projectSchema';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  institution: string;
  role: string;
  funding: string;
  collaborators: string;
  outcomes: string;
  photo_url: string | null;
  display_order: number;
  visible: boolean;
}

const DashboardProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title-asc' | 'title-desc' | 'date-desc' | 'date-asc'>('date-desc');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      // Validate input data before database operation
      const validated = projectSchema.parse({
        title: editingProject.title,
        description: editingProject.description,
        status: editingProject.status,
        start_date: editingProject.start_date,
        end_date: editingProject.end_date,
        institution: editingProject.institution,
        role: editingProject.role,
        funding: editingProject.funding,
        collaborators: editingProject.collaborators,
        outcomes: editingProject.outcomes,
        photo_url: editingProject.photo_url,
        display_order: editingProject.display_order,
        visible: editingProject.visible
      });

      const dataToUpsert = editingProject.id !== 'new' 
        ? { id: editingProject.id, ...validated } 
        : { ...validated };

      const { error } = await supabase
        .from('projects')
        .upsert([dataToUpsert as any]);

      if (error) throw error;

      toast({
        title: "Success",
        description: editingProject.id === 'new' ? "Project added" : "Project updated"
      });

      setIsDialogOpen(false);
      setEditingProject(null);
      fetchProjects();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project deleted"
      });

      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${editingProject.id === 'new' ? Date.now() : editingProject.id}.${fileExt}`;
      const filePath = `${fileName}`;

      // Delete old photo if updating
      if (editingProject.photo_url && editingProject.id !== 'new') {
        const oldPath = editingProject.photo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('project-photos').remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('project-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-photos')
        .getPublicUrl(filePath);

      setEditingProject({ ...editingProject, photo_url: publicUrl });
      
      toast({
        title: "Success",
        description: "Photo uploaded successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const openNewDialog = () => {
    setEditingProject({
      id: 'new',
      title: '',
      description: '',
      status: 'Active',
      start_date: new Date().getFullYear().toString(),
      end_date: '',
      institution: '',
      role: '',
      funding: '',
      collaborators: '',
      outcomes: '',
      photo_url: null,
      display_order: projects.length,
      visible: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const searchLower = searchQuery.toLowerCase();
      return (
        project.title.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.institution?.toLowerCase().includes(searchLower) ||
        project.role?.toLowerCase().includes(searchLower) ||
        project.status?.toLowerCase().includes(searchLower)
      );
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'date-asc':
          return a.start_date.localeCompare(b.start_date);
        case 'date-desc':
          return b.start_date.localeCompare(a.start_date);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchQuery, sortBy]);

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
    </div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-serif font-bold text-primary">Projects</h2>
        <Button onClick={openNewDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, institution, role, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[200px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Date (Newest)</SelectItem>
            <SelectItem value="date-asc">Date (Oldest)</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredAndSortedProjects.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No projects found</p>
          </Card>
        ) : (
          filteredAndSortedProjects.map((project) => (
          <Card key={project.id} className="p-6">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-primary">{project.title}</h3>
                    {!project.visible && (
                      <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">Hidden</span>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-academic-gray">
                  {project.institution && <p><strong>Institution:</strong> {project.institution}</p>}
                  {project.role && <p><strong>Role:</strong> {project.role}</p>}
                  {project.start_date && (
                    <p><strong>Period:</strong> {project.start_date} - {project.end_date || 'Present'}</p>
                  )}
                  {project.funding && <p><strong>Funding:</strong> {project.funding}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(project)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(project.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject?.id === 'new' ? 'Add Project' : 'Edit Project'}
            </DialogTitle>
          </DialogHeader>
          {editingProject && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                    placeholder="Active, Completed, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={editingProject.institution}
                    onChange={(e) => setEditingProject({ ...editingProject, institution: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    value={editingProject.start_date}
                    onChange={(e) => setEditingProject({ ...editingProject, start_date: e.target.value })}
                    placeholder="2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    value={editingProject.end_date}
                    onChange={(e) => setEditingProject({ ...editingProject, end_date: e.target.value })}
                    placeholder="Present or 2025"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={editingProject.role}
                  onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })}
                  placeholder="Principal Investigator, Co-Investigator, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="funding">Funding</Label>
                <Input
                  id="funding"
                  value={editingProject.funding}
                  onChange={(e) => setEditingProject({ ...editingProject, funding: e.target.value })}
                  placeholder="NIH, NSF, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collaborators">Collaborators</Label>
                <Textarea
                  id="collaborators"
                  value={editingProject.collaborators}
                  onChange={(e) => setEditingProject({ ...editingProject, collaborators: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outcomes">Outcomes</Label>
                <Textarea
                  id="outcomes"
                  value={editingProject.outcomes}
                  onChange={(e) => setEditingProject({ ...editingProject, outcomes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Project Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
                {editingProject.photo_url && (
                  <div className="mt-2">
                    <img src={editingProject.photo_url} alt="Project" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={editingProject.display_order}
                  onChange={(e) => setEditingProject({ ...editingProject, display_order: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between space-y-2">
                <Label htmlFor="visible">Visible on website</Label>
                <Switch
                  id="visible"
                  checked={editingProject.visible}
                  onCheckedChange={(checked) => setEditingProject({ ...editingProject, visible: checked })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardProjects;
