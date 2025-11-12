import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  getAllAdvertisements as fetchAds, 
  createAdvertisement as createAd,
  updateAdvertisement as updateAd,
  deleteAdvertisement as deleteAd,
  toggleAdvertisementStatus as toggleAd
} from '@/lib/api';

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  targetRoles: string[];
  isActive: boolean;
  createdAt: string;
}

const Advertisements = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([
    // Initialize with a sample ad
    {
      _id: '1',
      title: 'Support Our Mission',
      description: 'Join us in reducing food waste and helping communities',
      imageUrl: 'https://via.placeholder.com/800x200/0066cc/ffffff?text=ShareGood+Advertisement',
      link: 'https://sharegood.com',
      targetRoles: ['donor', 'ngo', 'logistics'],
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    targetRoles: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const response = await fetchAds();
      if (response.success) {
        setAdvertisements(response.data);
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.targetRoles.length === 0) {
      alert('Please select at least one target role');
      return;
    }
    
    try {
      if (editingAd) {
        const response = await updateAd(editingAd._id, formData);
        if (response.success) {
          alert('Advertisement updated successfully');
        }
      } else {
        const response = await createAd(formData);
        if (response.success) {
          alert('Advertisement created successfully');
        }
      }
      
      resetForm();
      setIsDialogOpen(false);
      fetchAdvertisements();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      alert('Failed to save advertisement. Please try again.');
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl || '',
      link: ad.link || '',
      targetRoles: ad.targetRoles,
      isActive: ad.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this advertisement?')) {
      try {
        const response = await deleteAd(id);
        if (response.success) {
          alert('Advertisement deleted successfully');
          fetchAdvertisements();
        }
      } catch (error) {
        console.error('Error deleting advertisement:', error);
        alert('Failed to delete advertisement. Please try again.');
      }
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await toggleAd(id);
      if (response.success) {
        fetchAdvertisements();
      }
    } catch (error) {
      console.error('Error toggling advertisement status:', error);
      alert('Failed to toggle advertisement status. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      link: '',
      targetRoles: [],
      isActive: true,
    });
    setEditingAd(null);
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advertisements</h1>
          <p className="text-muted-foreground">Manage company advertisements on the platform</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'Edit Advertisement' : 'Create Advertisement'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="link">Link URL</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label className="mb-3 block">Target Roles *</Label>
                <div className="space-y-2">
                  {['donor', 'ngo', 'logistics'].map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={role}
                        checked={formData.targetRoles.includes(role)}
                        onCheckedChange={() => handleRoleToggle(role)}
                      />
                      <Label htmlFor={role} className="capitalize cursor-pointer">
                        {role === 'ngo' ? 'NGO' : role}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAd ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {advertisements.map((ad) => (
          <Card key={ad._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {ad.title}
                    {ad.isActive ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Target: {ad.targetRoles.map(r => r === 'ngo' ? 'NGO' : r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleActive(ad._id, ad.isActive)}
                  >
                    {ad.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleEdit(ad)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(ad._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">{ad.description}</p>
                {ad.imageUrl && (
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                {ad.link && (
                  <a
                    href={ad.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {ad.link}
                  </a>
                )}
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(ad.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Advertisements;
