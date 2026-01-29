import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../../components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Megaphone, RefreshCw, Play, Pause, Loader2, FileWarning
} from 'lucide-react';
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABELS } from '../../lib/constants';
import logger from '../../lib/logger';

export default function RHCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .in('status', [CAMPAIGN_STATUS.APPROVED, CAMPAIGN_STATUS.ACTIVE, CAMPAIGN_STATUS.INACTIVE])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      logger.error('RHCampaigns', 'Error fetching campaigns', err);
      toast.error('Error al cargar las campañas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleActivate = async (campaignId) => {
    setProcessing(campaignId);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: CAMPAIGN_STATUS.ACTIVE })
        .eq('id', campaignId);

      if (error) throw error;
      toast.success('Campaña activada exitosamente');
      fetchCampaigns();
    } catch (err) {
      logger.error('RHCampaigns', 'Error activating campaign', err);
      toast.error('Error al activar la campaña');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeactivate = async (campaignId) => {
    setProcessing(campaignId);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: CAMPAIGN_STATUS.INACTIVE })
        .eq('id', campaignId);

      if (error) throw error;
      toast.success('Campaña desactivada');
      fetchCampaigns();
    } catch (err) {
      logger.error('RHCampaigns', 'Error deactivating campaign', err);
      toast.error('Error al desactivar la campaña');
    } finally {
      setProcessing(null);
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
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  return (
    <div className="space-y-6" data-testid="rh-campaigns-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Activación de Campañas</h1>
            <p className="font-body text-sm text-slate-500">
              Activar y desactivar campañas aprobadas
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
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center" data-testid="no-campaigns">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileWarning className="w-6 h-6 text-slate-400" />
              </div>
              <p className="font-body text-slate-500">No hay campañas disponibles</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Nombre</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Estado</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Última actualización</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">{campaign.name}</TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell className="text-slate-600">{formatDate(campaign.updated_at)}</TableCell>
                    <TableCell>
                      {campaign.status === CAMPAIGN_STATUS.APPROVED && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              disabled={processing === campaign.id}
                            >
                              {processing === campaign.id ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4 mr-1" />
                              )}
                              Activar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Activar campaña</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de activar la campaña "{campaign.name}"? 
                                Una vez activa, la campaña será visible para las coordinaciones estatales.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleActivate(campaign.id)}>
                                Activar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {campaign.status === CAMPAIGN_STATUS.ACTIVE && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-amber-600 hover:text-amber-700"
                              disabled={processing === campaign.id}
                            >
                              {processing === campaign.id ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Pause className="w-4 h-4 mr-1" />
                              )}
                              Desactivar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Desactivar campaña</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de desactivar la campaña "{campaign.name}"? 
                                Las coordinaciones estatales ya no podrán crear propuestas.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeactivate(campaign.id)}>
                                Desactivar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {campaign.status === CAMPAIGN_STATUS.INACTIVE && (
                        <span className="text-sm text-slate-400">Sin acciones disponibles</span>
                      )}
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
