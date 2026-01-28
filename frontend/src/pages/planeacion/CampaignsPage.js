import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../../components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Plus, ClipboardList, Loader2, FileWarning, RefreshCw, Eye, Send
} from 'lucide-react';
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABELS, ROLES } from '../../lib/constants';

export default function PlaneacionCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const canCreate = hasRole(ROLES.PLANEACION);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      toast.error('Error al cargar las campañas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) {
      toast.error('Ingresa un nombre para la campaña');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{ name: newCampaignName.trim(), status: CAMPAIGN_STATUS.DRAFT }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Campaña creada exitosamente');
      setDialogOpen(false);
      setNewCampaignName('');
      navigate(`/planeacion/campaigns/${data.id}`);
    } catch (err) {
      console.error('Error creating campaign:', err);
      toast.error('Error al crear la campaña');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    const config = CAMPAIGN_STATUS_LABELS[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6" data-testid="planeacion-campaigns-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Gestión de Campañas</h1>
            <p className="font-body text-sm text-slate-500">
              Crear y configurar campañas de reclutamiento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          {canCreate && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800" data-testid="create-campaign-btn">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Campaña
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Campaña</DialogTitle>
                  <DialogDescription>
                    Crear una nueva campaña de reclutamiento
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la campaña *</Label>
                    <Input
                      id="name"
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      placeholder="Ej: Campaña Enero 2025"
                      data-testid="campaign-name-input"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateCampaign} 
                      disabled={creating}
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Crear campaña
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center" data-testid="no-campaigns">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileWarning className="w-6 h-6 text-slate-400" />
              </div>
              <p className="font-body text-slate-500 mb-4">No hay campañas registradas</p>
              {canCreate && (
                <Button onClick={() => setDialogOpen(true)} className="bg-slate-900 hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primera campaña
                </Button>
              )}
            </div>
          ) : (
            <Table data-testid="campaigns-table">
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Nombre</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Estado</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Creada</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">{campaign.name}</TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell className="text-slate-600">{formatDate(campaign.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          data-testid={`view-campaign-${campaign.id}`}
                        >
                          <Link to={`/planeacion/campaigns/${campaign.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            {campaign.status === CAMPAIGN_STATUS.DRAFT ? 'Editar' : 'Ver'}
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
