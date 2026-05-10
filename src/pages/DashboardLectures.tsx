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
import { invitedLectureSchema } from '@/schemas/invitedLectureSchema';
import { z } from 'zod';

interface InvitedLecture {
  id: string;
  title: string;
  event: string;
  location: string;
  date: string;
  description: string;
  display_order: number;
  visible: boolean;
}

const DashboardLectures = () => {
  const [lectures, setLectures] = useState<InvitedLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLecture, setEditingLecture] = useState<InvitedLecture | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      const { data, error } = await supabase
        .from('invited_lectures')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLectures(data || []);
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
    if (!editingLecture) return;

    try {
      const validated = invitedLectureSchema.parse({
        title: editingLecture.title,
        event: editingLecture.event,
        location: editingLecture.location,
        date: editingLecture.date,
        description: editingLecture.description,
        display_order: editingLecture.display_order,
        visible: editingLecture.visible
      });

      const dataToUpsert = editingLecture.id !== 'new' 
        ? { id: editingLecture.id, ...validated } 
        : { ...validated };

      const { error } = await supabase
        .from('invited_lectures')
        .upsert([dataToUpsert as any]);

      if (error) throw error;

      toast({
        title: "Success",
        description: editingLecture.id === 'new' ? "Lecture added" : "Lecture updated"
      });

      setIsDialogOpen(false);
      setEditingLecture(null);
      fetchLectures();
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
    if (!confirm('Are you sure you want to delete this lecture?')) return;

    try {
      const { error } = await supabase
        .from('invited_lectures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lecture deleted"
      });

      fetchLectures();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleVisibility = async (lecture: InvitedLecture) => {
    try {
      const { error } = await supabase
        .from('invited_lectures')
        .update({ visible: !lecture.visible })
        .eq('id', lecture.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: lecture.visible ? "Lecture hidden" : "Lecture visible"
      });
      
      fetchLectures();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openNewDialog = () => {
    setEditingLecture({
      id: 'new',
      title: '',
      event: '',
      location: '',
      date: '',
      description: '',
      display_order: lectures.length,
      visible: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (lecture: InvitedLecture) => {
    setEditingLecture(lecture);
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
        <h2 className="text-3xl font-serif font-bold text-primary">Invited Lectures & Presentations</h2>
        <Button onClick={openNewDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Lecture
        </Button>
      </div>

      <div className="space-y-4">
        {lectures.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No lectures found</p>
          </Card>
        ) : (
          lectures.map((lecture) => (
            <Card key={lecture.id} className="p-6">
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-primary">{lecture.title}</h3>
                    {!lecture.visible && (
                      <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">Hidden</span>
                    )}
                  </div>
                  {lecture.event && (
                    <p className="text-sm text-muted-foreground mt-1">{lecture.event}</p>
                  )}
                  {(lecture.location || lecture.date) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {lecture.location}{lecture.location && lecture.date && ' • '}{lecture.date}
                    </p>
                  )}
                  {lecture.description && (
                    <p className="text-sm text-muted-foreground mt-2">{lecture.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Order: {lecture.display_order}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleVisibility(lecture)}>
                    {lecture.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(lecture)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(lecture.id)}>
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
              {editingLecture?.id === 'new' ? 'Add Lecture/Presentation' : 'Edit Lecture/Presentation'}
            </DialogTitle>
          </DialogHeader>
          {editingLecture && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={editingLecture.title}
                  onChange={(e) => setEditingLecture({ ...editingLecture, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event">Event/Conference</Label>
                <Input
                  id="event"
                  value={editingLecture.event}
                  onChange={(e) => setEditingLecture({ ...editingLecture, event: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editingLecture.location}
                    onChange={(e) => setEditingLecture({ ...editingLecture, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date/Year</Label>
                  <Input
                    id="date"
                    value={editingLecture.date}
                    onChange={(e) => setEditingLecture({ ...editingLecture, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingLecture.description}
                  onChange={(e) => setEditingLecture({ ...editingLecture, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="0"
                  value={editingLecture.display_order}
                  onChange={(e) => setEditingLecture({ ...editingLecture, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between space-y-2">
                <Label htmlFor="visible">Visible on website</Label>
                <Switch
                  id="visible"
                  checked={editingLecture.visible}
                  onCheckedChange={(checked) => setEditingLecture({ ...editingLecture, visible: checked })}
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

export default DashboardLectures;
