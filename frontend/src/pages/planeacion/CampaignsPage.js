import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../../components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Plus, ClipboardList, Loader2, RefreshCw, Eye
} from 'lucide-react';
import { CAMPAIGN_STATUS, ROLES } from '../../lib/constants';
import logger from '../../lib/logger';

// New components
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery';
import { PageHeader } from '../../components/ui/breadcrumbs';
import { EmptyState } from '../../components/ui/empty-state';
import { TableSkeleton } from '../../components/ui/skeletons';
import { CampaignStatusBadge } from '../../components/ui/status-badge';
import { SearchInput, useSearch } from '../../components/ui/search-input';
import { DataTablePagination } from '../../components/ui/data-table-pagination';

const PAGE_SIZE = 10;

export default function PlaneacionCampaignsPage() {
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const canCreate = hasRole(ROLES.PLANEACION);

  // Fetch campaigns with hook
  const { data: campaigns, loading, refetch } = useSupabaseQuery(
    () => supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false }),
    {
      context: 'PlaneacionCampaigns',
      initialData: [],
    }
  );

  // Search functionality
  const { query, setQuery, filteredData } = useSearch({
    data: campaigns || [],
    searchFields: ['name', 'description'],
  });

  // Pagination
  const paginatedData = filteredData.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Reset page on search
  const handleSearchChange = useCallback((value) => {
    setQuery(value);
    setPage(0);
  }, [setQuery]);

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
      logger.error('CampaignsPage', 'Error creating campaign', err);
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

  return (
    <div className="space-y-6" data-testid="planeacion-campaigns-page">
      {/* Header */}
      <PageHeader
        icon={ClipboardList}
        title="Gestión de Campañas"
        description="Crear y configurar campañas de reclutamiento"
        breadcrumbs={[
          { label: 'Planeación' },
          { label: 'Campañas' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
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
          ) : filteredData.length === 0 ? (
            <EmptyState
              iconPreset={query ? 'search' : 'campaigns'}
              title={query ? 'Sin resultados' : 'No hay campañas'}
              description={
                query
                  ? `No se encontraron campañas para "${query}"`
                  : 'Crea tu primera campaña de reclutamiento'
              }
              actionLabel={!query && canCreate ? 'Nueva campaña' : undefined}
              onAction={!query && canCreate ? () => setDialogOpen(true) : undefined}
              secondaryActionLabel={query ? 'Limpiar búsqueda' : undefined}
              onSecondaryAction={query ? () => setQuery('') : undefined}
            />
          ) : (
            <>
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
                  {paginatedData.map((campaign) => (
                    <TableRow key={campaign.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">{campaign.name}</TableCell>
                      <TableCell>
                        <CampaignStatusBadge status={campaign.status} showIcon />
                      </TableCell>
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
    </div>
  );
}
