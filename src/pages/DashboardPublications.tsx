import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, X, Download, Eye, EyeOff, Search, ArrowUpDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { publicationSchema } from '@/schemas/publicationSchema';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Publication {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi: string;
  abstract: string;
  pmid: string;
  photo_url: string | null;
  visible: boolean;
  display_order: number;
}

const DashboardPublications = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPub, setEditingPub] = useState<Publication | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fetchingFromPubMed, setFetchingFromPubMed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title-asc' | 'title-desc' | 'year-desc' | 'year-asc'>('year-desc');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      setPublications(data || []);
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
    if (!editingPub) return;

    try {
      // Validate input data before database operation
      const validated = publicationSchema.parse({
        title: editingPub.title,
        authors: editingPub.authors,
        journal: editingPub.journal,
        year: editingPub.year,
        pmid: editingPub.pmid,
        doi: editingPub.doi,
        abstract: editingPub.abstract,
        photo_url: editingPub.photo_url,
        display_order: editingPub.display_order
      });

      const dataToUpsert = editingPub.id !== 'new' 
        ? { id: editingPub.id, ...validated } 
        : { ...validated };

      const { error } = await supabase
        .from('publications')
        .upsert([dataToUpsert as any]);

      if (error) throw error;

      toast({
        title: "Success",
        description: editingPub.id === 'new' ? "Publication added" : "Publication updated"
      });

      setIsDialogOpen(false);
      setEditingPub(null);
      fetchPublications();
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
    if (!confirm('Are you sure you want to delete this publication?')) return;

    try {
      const { error } = await supabase
        .from('publications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Publication deleted"
      });

      fetchPublications();
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
    if (!file || !editingPub) return;

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
      const fileName = `${editingPub.id === 'new' ? Date.now() : editingPub.id}.${fileExt}`;
      const filePath = `${fileName}`;

      // Delete old photo if updating
      if (editingPub.photo_url && editingPub.id !== 'new') {
        const oldPath = editingPub.photo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('publication-photos').remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('publication-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('publication-photos')
        .getPublicUrl(filePath);

      setEditingPub({ ...editingPub, photo_url: publicUrl });
      
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
    setEditingPub({
      id: 'new',
      title: '',
      authors: '',
      journal: '',
      year: new Date().getFullYear().toString(),
      doi: '',
      abstract: '',
      pmid: '',
      photo_url: null,
      visible: true,
      display_order: publications.length
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (pub: Publication) => {
    setEditingPub(pub);
    setIsDialogOpen(true);
  };

  const filteredAndSortedPublications = useMemo(() => {
    let filtered = publications.filter(pub => {
      const searchLower = searchQuery.toLowerCase();
      return (
        pub.title.toLowerCase().includes(searchLower) ||
        pub.authors.toLowerCase().includes(searchLower) ||
        pub.journal.toLowerCase().includes(searchLower) ||
        pub.year.includes(searchQuery)
      );
    });

    filtered.sort((a, b) => {
      // First, sort by visibility (visible first)
      if (a.visible !== b.visible) {
        return a.visible ? -1 : 1;
      }
      
      // Then apply the selected sort
      switch (sortBy) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'year-asc':
          return a.year.localeCompare(b.year);
        case 'year-desc':
          return b.year.localeCompare(a.year);
        default:
          return 0;
      }
    });

    return filtered;
  }, [publications, searchQuery, sortBy]);

  const fetchFromPubMed = async () => {
    setFetchingFromPubMed(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to fetch publications');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-publications`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ authorName: 'Negida A' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch publications');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: result.message || `Fetched ${result.publications?.length || 0} publications from PubMed`
      });
      
      fetchPublications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setFetchingFromPubMed(false);
    }
  };

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
    </div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-serif font-bold text-primary">Publications</h2>
        <div className="flex gap-2">
          <Button 
            onClick={fetchFromPubMed} 
            variant="outline" 
            className="gap-2"
            disabled={fetchingFromPubMed}
          >
            <Download className="w-4 h-4" />
            {fetchingFromPubMed ? 'Fetching...' : 'Fetch from PubMed'}
          </Button>
          <Button onClick={openNewDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Manually
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, authors, journal, or year..."
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
            <SelectItem value="year-desc">Year (Newest)</SelectItem>
            <SelectItem value="year-asc">Year (Oldest)</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredAndSortedPublications.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No publications found</p>
          </Card>
        ) : (
          filteredAndSortedPublications.map((pub) => (
          <Card key={pub.id} className="p-6">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary mb-2">{pub.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">{pub.authors}</p>
                <p className="text-sm font-medium text-academic-gray">
                  {pub.journal} ({pub.year})
                </p>
                {pub.doi && (
                  <p className="text-xs text-muted-foreground mt-2">DOI: {pub.doi}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('publications')
                        .update({ visible: !pub.visible })
                        .eq('id', pub.id);
                      
                      if (error) throw error;
                      
                      toast({
                        title: "Success",
                        description: pub.visible ? "Publication hidden" : "Publication visible"
                      });
                      
                      fetchPublications();
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  {pub.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEditDialog(pub)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(pub.id)}>
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
              {editingPub?.id === 'new' ? 'Add Publication' : 'Edit Publication'}
            </DialogTitle>
          </DialogHeader>
          {editingPub && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={editingPub.title}
                  onChange={(e) => setEditingPub({ ...editingPub, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authors">Authors</Label>
                <Input
                  id="authors"
                  value={editingPub.authors}
                  onChange={(e) => setEditingPub({ ...editingPub, authors: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="journal">Journal</Label>
                  <Input
                    id="journal"
                    value={editingPub.journal}
                    onChange={(e) => setEditingPub({ ...editingPub, journal: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    value={editingPub.year}
                    onChange={(e) => setEditingPub({ ...editingPub, year: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doi">DOI</Label>
                  <Input
                    id="doi"
                    value={editingPub.doi}
                    onChange={(e) => setEditingPub({ ...editingPub, doi: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pmid">PMID</Label>
                  <Input
                    id="pmid"
                    value={editingPub.pmid}
                    onChange={(e) => setEditingPub({ ...editingPub, pmid: e.target.value })}
                    placeholder="Leave empty if not yet published"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="abstract">Abstract</Label>
                <Textarea
                  id="abstract"
                  value={editingPub.abstract}
                  onChange={(e) => setEditingPub({ ...editingPub, abstract: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Publication Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
                {editingPub.photo_url && (
                  <div className="mt-2">
                    <img src={editingPub.photo_url} alt="Publication" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="0"
                  value={editingPub.display_order}
                  onChange={(e) => setEditingPub({ ...editingPub, display_order: parseInt(e.target.value) || 0 })}
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

export default DashboardPublications;
