import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../../components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Megaphone, RefreshCw, Play, Pause, Loader2 } from 'lucide-react';
import { CAMPAIGN_STATUS } from '../../lib/constants';

// New components
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery';
import { PageHeader } from '../../components/ui/breadcrumbs';
import { EmptyState } from '../../components/ui/empty-state';
import { TableSkeleton } from '../../components/ui/skeletons';
import { CampaignStatusBadge } from '../../components/ui/status-badge';
import { ConfirmDialog, useConfirmDialog } from '../../components/ui/confirm-dialog';
import { SearchInput, useSearch } from '../../components/ui/search-input';
import { DataTablePagination } from '../../components/ui/data-table-pagination';
import logger from '../../lib/logger';

const PAGE_SIZE = 10;

export default function RHCampaignsPage() {
  const [processing, setProcessing] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  // Fetch campaigns with new hook
  const { data: campaigns, loading, refetch, error } = useSupabaseQuery(
    () => supabase
      .from('campaigns')
      .select('*')
      .in('status', [CAMPAIGN_STATUS.APPROVED, CAMPAIGN_STATUS.ACTIVE, CAMPAIGN_STATUS.INACTIVE])
      .order('created_at', { ascending: false }),
    { 
      context: 'RHCampaigns',
      initialData: [],
    }
  );

  // Search functionality
  const { query, setQuery, filteredData } = useSearch({
    data: campaigns || [],
    searchFields: ['name', 'description'],
  });

  // Paginate filtered data
  const paginatedData = filteredData.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Confirm dialog for activate
  const activateDialog = useConfirmDialog({
    title: 'Activar campaña',
    description: 'Una vez activa, la campaña será visible para las coordinaciones estatales.',
    confirmLabel: 'Activar',
    variant: 'success',
    onConfirm: async (campaign) => {
      setProcessing(campaign.id);
      try {
        const { error } = await supabase
          .from('campaigns')
          .update({ status: CAMPAIGN_STATUS.ACTIVE })
          .eq('id', campaign.id);

        if (error) throw error;
        toast.success('Campaña activada exitosamente');
        refetch();
      } catch (err) {
        logger.error('RHCampaigns', 'Error activating campaign', err);
        toast.error('Error al activar la campaña');
      } finally {
        setProcessing(null);
      }
    },
  });

  // Confirm dialog for deactivate
  const deactivateDialog = useConfirmDialog({
    title: 'Desactivar campaña',
    description: 'Las coordinaciones estatales ya no podrán crear propuestas para esta campaña.',
    confirmLabel: 'Desactivar',
    variant: 'warning',
    onConfirm: async (campaign) => {
      setProcessing(campaign.id);
      try {
        const { error } = await supabase
          .from('campaigns')
          .update({ status: CAMPAIGN_STATUS.INACTIVE })
          .eq('id', campaign.id);

        if (error) throw error;
        toast.success('Campaña desactivada');
        refetch();
      } catch (err) {
        logger.error('RHCampaigns', 'Error deactivating campaign', err);
        toast.error('Error al desactivar la campaña');
      } finally {
        setProcessing(null);
      }
    },
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return dateStr;
    }
  };

  // Reset page when search changes
  const handleSearchChange = useCallback((value) => {
    setQuery(value);
    setPage(0);
  }, [setQuery]);

  return (
    <div className="space-y-6" data-testid="rh-campaigns-page">
      {/* Header with breadcrumbs */}
      <PageHeader
        icon={Megaphone}
        title="Activación de Campañas"
        description="Activar y desactivar campañas aprobadas"
        breadcrumbs={[
          { label: 'RH', href: '/rh/dashboard' },
          { label: 'Campañas' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
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
          {filteredData.length} campaña{filteredData.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : error ? (
            <EmptyState
              iconPreset="error"
              title="Error al cargar"
              description="No se pudieron cargar las campañas"
              secondaryActionLabel="Reintentar"
              onSecondaryAction={refetch}
            />
          ) : filteredData.length === 0 ? (
            <EmptyState
              iconPreset="campaigns"
              title={query ? 'Sin resultados' : 'No hay campañas'}
              description={
                query 
                  ? `No se encontraron campañas para "${query}"`
                  : 'No hay campañas disponibles para activar'
              }
              secondaryActionLabel={query ? 'Limpiar búsqueda' : undefined}
              onSecondaryAction={query ? () => setQuery('') : undefined}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">
                      Nombre
                    </TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">
                      Estado
                    </TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">
                      Última actualización
                    </TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((campaign) => (
                    <TableRow key={campaign.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        {campaign.name}
                      </TableCell>
                      <TableCell>
                        <CampaignStatusBadge status={campaign.status} showIcon />
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDate(campaign.updated_at)}
                      </TableCell>
                      <TableCell>
                        {campaign.status === CAMPAIGN_STATUS.APPROVED && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            disabled={processing === campaign.id}
                            onClick={() => activateDialog.confirm(campaign)}
                          >
                            {processing === campaign.id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4 mr-1" />
                            )}
                            Activar
                          </Button>
                        )}

                        {campaign.status === CAMPAIGN_STATUS.ACTIVE && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            disabled={processing === campaign.id}
                            onClick={() => deactivateDialog.confirm(campaign)}
                          >
                            {processing === campaign.id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Pause className="w-4 h-4 mr-1" />
                            )}
                            Desactivar
                          </Button>
                        )}

                        {campaign.status === CAMPAIGN_STATUS.INACTIVE && (
                          <span className="text-sm text-slate-400">Sin acciones</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
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

      {/* Confirm Dialogs */}
      <ConfirmDialog 
        {...activateDialog.dialogProps}
        description={
          activateDialog.pendingData 
            ? `¿Estás seguro de activar la campaña "${activateDialog.pendingData.name}"? Una vez activa, será visible para las coordinaciones estatales.`
            : activateDialog.dialogProps.description
        }
      />
      <ConfirmDialog 
        {...deactivateDialog.dialogProps}
        description={
          deactivateDialog.pendingData 
            ? `¿Estás seguro de desactivar la campaña "${deactivateDialog.pendingData.name}"? Las coordinaciones estatales ya no podrán crear propuestas.`
            : deactivateDialog.dialogProps.description
        }
      />
    </div>
  );
}
