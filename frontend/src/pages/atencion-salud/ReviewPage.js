import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../../components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Eye, RefreshCw, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { CAMPAIGN_STATUS } from '../../lib/constants';
import logger from '../../lib/logger';

// New components
import { PageHeader } from '../../components/ui/breadcrumbs';
import { EmptyState } from '../../components/ui/empty-state';
import { TableSkeleton, StatCardSkeleton } from '../../components/ui/skeletons';
import { CampaignStatusBadge } from '../../components/ui/status-badge';
import { SearchInput, useSearch } from '../../components/ui/search-input';
import { DataTablePagination } from '../../components/ui/data-table-pagination';
import { ConfirmDialog, useConfirmDialog } from '../../components/ui/confirm-dialog';

const PAGE_SIZE = 10;

export default function AtencionSaludReviewPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  // Confirm dialog for rejecting
  const rejectConfirm = useConfirmDialog({
    title: 'Regresar campaña a Planeación',
    description: '¿Estás seguro de regresar esta campaña? Volverá al estado de borrador.',
    variant: 'warning',
    confirmLabel: 'Sí, regresar',
    cancelLabel: 'Cancelar',
  });

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
      logger.error('ReviewPage', 'Error fetching campaigns', err);
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
      logger.error('ReviewPage', 'Error fetching campaign details', err);
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
      logger.error('ReviewPage', 'Error approving campaign', err);
      toast.error('Error al aprobar la campaña');
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

  // Search functionality
  const { query, setQuery, filteredData } = useSearch({
    data: campaigns || [],
    searchFields: ['name'],
  });

  // Pagination
  const paginatedData = filteredData.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Reset page on search
  const handleSearchChange = useCallback((value) => {
    setQuery(value);
    setPage(0);
  }, [setQuery]);

  // Handle reject with confirmation
  const handleRejectClick = () => {
    if (!selectedCampaign) return;
    rejectConfirm.confirm(selectedCampaign);
  };

  const handleConfirmReject = async () => {
    if (!rejectConfirm.pendingData) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: CAMPAIGN_STATUS.DRAFT })
        .eq('id', rejectConfirm.pendingData.id);

      if (error) throw error;
      toast.success('Campaña regresada a Planeación');
      setDetailDialogOpen(false);
      fetchCampaigns();
    } catch (err) {
      logger.error('ReviewPage', 'Error rejecting campaign', err);
      toast.error('Error al regresar la campaña');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="atencion-salud-review-page">
      {/* Confirm Dialog */}
      <ConfirmDialog 
        {...rejectConfirm.dialogProps} 
        onConfirm={handleConfirmReject}
      />

      {/* Header */}
      <PageHeader
        icon={Eye}
        title="Revisión de Programas"
        description="Revisar y aprobar campañas en revisión"
        breadcrumbs={[
          { label: 'Atención a la Salud' },
          { label: 'Revisión' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-4">
        <SearchInput
          value={query}
          onChange={handleSearchChange}
          placeholder="Buscar campañas..."
          className="max-w-sm"
        />
        <div className="text-sm text-slate-500">
          {filteredData.length} campaña{filteredData.length !== 1 ? 's' : ''} en revisión
        </div>
      </div>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : filteredData.length === 0 ? (
            <EmptyState
              iconPreset={query ? 'search' : 'campaigns'}
              title={query ? 'Sin resultados' : 'No hay campañas pendientes'}
              description={
                query
                  ? `No se encontraron campañas para "${query}"`
                  : 'No hay campañas pendientes de revisión'
              }
              secondaryActionLabel={query ? 'Limpiar búsqueda' : undefined}
              onSecondaryAction={query ? () => setQuery('') : undefined}
            />
          ) : (
            <>
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
                  {paginatedData.map((campaign) => (
                    <TableRow key={campaign.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">{campaign.name}</TableCell>
                      <TableCell>
                        <CampaignStatusBadge status={campaign.status} showIcon />
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
              {totalPages > 1 && (
                <DataTablePagination
                  page={page}
                  pageSize={pageSize}
                  totalCount={filteredData.length}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              )}
            </>
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
              <div className="grid grid-cols-2 gap-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
              </div>
              <StatCardSkeleton />
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
            <Button variant="outline" onClick={handleRejectClick} disabled={processing}>
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
