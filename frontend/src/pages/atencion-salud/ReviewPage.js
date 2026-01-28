import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../../components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '../../components/ui/dialog';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Eye, RefreshCw, CheckCircle, XCircle, Loader2, FileWarning
} from 'lucide-react';
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABELS } from '../../lib/constants';

export default function AtencionSaludReviewPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', CAMPAIGN_STATUS.UNDER_REVIEW)
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

  const fetchCampaignDetails = async (campaignId) => {
    setLoadingDetails(true);
    try {
      // Get positions count and total slots
      const { data: positions, error: posError } = await supabase
        .from('campaign_positions')
        .select('slots_authorized')
        .eq('campaign_id', campaignId);

      if (posError) throw posError;

      // Get authorized facilities count
      const { data: facilities, error: facError } = await supabase
        .from('campaign_authorized_facilities')
        .select('id')
        .eq('campaign_id', campaignId);

      if (facError) throw facError;

      setCampaignDetails({
        positionsCount: positions?.length || 0,
        totalSlots: positions?.reduce((sum, p) => sum + (p.slots_authorized || 0), 0) || 0,
        facilitiesCount: facilities?.length || 0,
      });
    } catch (err) {
      console.error('Error fetching campaign details:', err);
      toast.error('Error al cargar detalles');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = async (campaign) => {
    setSelectedCampaign(campaign);
    setDetailDialogOpen(true);
    await fetchCampaignDetails(campaign.id);
  };

  const handleApprove = async () => {
    if (!selectedCampaign) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: CAMPAIGN_STATUS.APPROVED })
        .eq('id', selectedCampaign.id);

      if (error) throw error;
      toast.success('Campaña aprobada exitosamente');
      setDetailDialogOpen(false);
      fetchCampaigns();
    } catch (err) {
      console.error('Error approving campaign:', err);
      toast.error('Error al aprobar la campaña');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCampaign) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: CAMPAIGN_STATUS.DRAFT })
        .eq('id', selectedCampaign.id);

      if (error) throw error;
      toast.success('Campaña regresada a Planeación');
      setDetailDialogOpen(false);
      fetchCampaigns();
    } catch (err) {
      console.error('Error rejecting campaign:', err);
      toast.error('Error al regresar la campaña');
    } finally {
      setProcessing(false);
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

  return (
    <div className="space-y-6" data-testid="atencion-salud-review-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Revisión de Programas</h1>
            <p className="font-body text-sm text-slate-500">
              Revisar y aprobar campañas en revisión
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
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
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center" data-testid="no-campaigns">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileWarning className="w-6 h-6 text-slate-400" />
              </div>
              <p className="font-body text-slate-500">No hay campañas pendientes de revisión</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Nombre</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Estado</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Fecha envío</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">{campaign.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${CAMPAIGN_STATUS_LABELS[campaign.status]?.color}`}>
                        {CAMPAIGN_STATUS_LABELS[campaign.status]?.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">{formatDate(campaign.updated_at)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(campaign)}
                        data-testid={`review-campaign-${campaign.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Revisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Revisar campaña</DialogTitle>
            <DialogDescription>{selectedCampaign?.name}</DialogDescription>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{campaignDetails?.positionsCount || 0}</p>
                    <p className="text-sm text-slate-500">Posiciones</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{campaignDetails?.totalSlots || 0}</p>
                    <p className="text-sm text-slate-500">Plazas autorizadas</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">{campaignDetails?.facilitiesCount || 0}</p>
                  <p className="text-sm text-slate-500">CLUES autorizadas</p>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleReject} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
              Regresar a Planeación
            </Button>
            <Button onClick={handleApprove} disabled={processing} className="bg-green-600 hover:bg-green-700">
              {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Aprobar programa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
