import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { teachingModuleSchema } from '@/schemas/teachingModuleSchema';
import { z } from 'zod';

interface TeachingModule {
  id: string;
  title: string;
  description: string;
  display_order: number;
  visible: boolean;
}

const DashboardTeaching = () => {
  const [modules, setModules] = useState<TeachingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModule, setEditingModule] = useState<TeachingModule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('teaching_modules')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setModules(data || []);
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
    if (!editingModule) return;

    try {
      const validated = teachingModuleSchema.parse({
        title: editingModule.title,
        description: editingModule.description,
        display_order: editingModule.display_order,
        visible: editingModule.visible
      });

      const dataToUpsert = editingModule.id !== 'new' 
        ? { id: editingModule.id, ...validated } 
        : { ...validated };

      const { error } = await supabase
        .from('teaching_modules')
        .upsert([dataToUpsert as any]);

      if (error) throw error;

      toast({
        title: "Success",
        description: editingModule.id === 'new' ? "Module added" : "Module updated"
      });

      setIsDialogOpen(false);
      setEditingModule(null);
      fetchModules();
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
    if (!confirm('Are you sure you want to delete this module?')) return;

    try {
      const { error } = await supabase
        .from('teaching_modules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Module deleted"
      });

      fetchModules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleVisibility = async (module: TeachingModule) => {
    try {
      const { error } = await supabase
        .from('teaching_modules')
        .update({ visible: !module.visible })
        .eq('id', module.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: module.visible ? "Module hidden" : "Module visible"
      });
      
      fetchModules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openNewDialog = () => {
    setEditingModule({
      id: 'new',
      title: '',
      description: '',
      display_order: modules.length,
      visible: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (module: TeachingModule) => {
    setEditingModule(module);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
    </div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-serif font-bold text-primary">Teaching Modules</h2>
        <Button onClick={openNewDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Module
        </Button>
      </div>

      <div className="space-y-4">
        {modules.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No teaching modules found</p>
          </Card>
        ) : (
          modules.map((module) => (
            <Card key={module.id} className="p-6">
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-primary">{module.title}</h3>
                    {!module.visible && (
                      <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">Hidden</span>
                    )}
                  </div>
                  {module.description && (
                    <p className="text-sm text-muted-foreground mt-2">{module.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Order: {module.display_order}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleVisibility(module)}>
                    {module.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(module)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(module.id)}>
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
              {editingModule?.id === 'new' ? 'Add Teaching Module' : 'Edit Teaching Module'}
            </DialogTitle>
          </DialogHeader>
          {editingModule && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingModule.description}
                  onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="0"
                  value={editingModule.display_order}
                  onChange={(e) => setEditingModule({ ...editingModule, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between space-y-2">
                <Label htmlFor="visible">Visible on website</Label>
                <Switch
                  id="visible"
                  checked={editingModule.visible}
                  onCheckedChange={(checked) => setEditingModule({ ...editingModule, visible: checked })}
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

export default DashboardTeaching;
