import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Plus, 
  Megaphone, 
  CalendarIcon, 
  Loader2, 
  FileWarning,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';

const campaignSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
});

const STATUS_LABELS = {
  draft: { label: 'Borrador', variant: 'secondary' },
  active: { label: 'Activa', variant: 'default' },
  closed: { label: 'Cerrada', variant: 'outline' },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { hasAnyRole } = useAuth();

  const canCreate = hasAnyRole(['admin', 'hr_manager']);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(campaignSchema),
  });

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

  const onSubmit = async (data) => {
    setCreating(true);
    try {
      const campaignData = {
        name: data.name,
        description: data.description || null,
        status: 'draft',
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
      };

      const { error } = await supabase
        .from('campaigns')
        .insert([campaignData]);

      if (error) throw error;

      toast.success('Campaña creada exitosamente');
      setDialogOpen(false);
      reset();
      setStartDate(null);
      setEndDate(null);
      fetchCampaigns();
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
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6" data-testid="campaigns-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Campañas</h1>
            <p className="font-body text-sm text-slate-500">
              Gestión de campañas de reclutamiento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCampaigns}
            disabled={loading}
            data-testid="refresh-campaigns-btn"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Actualizar
          </Button>

          {canCreate && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-slate-900 hover:bg-slate-800"
                  data-testid="create-campaign-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Campaña
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]" data-testid="create-campaign-dialog">
                <DialogHeader>
                  <DialogTitle className="font-heading text-xl">Nueva Campaña</DialogTitle>
                  <DialogDescription className="font-body">
                    Crear una nueva campaña de reclutamiento (se guardará como borrador)
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la campaña *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Ej: Campaña Enero 2025"
                      data-testid="campaign-name-input"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Descripción de la campaña..."
                      rows={3}
                      data-testid="campaign-description-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha de inicio</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                            data-testid="start-date-btn"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, 'dd/MM/yyyy') : 'Seleccionar'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            locale={es}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Fecha de fin</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                            data-testid="end-date-btn"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, 'dd/MM/yyyy') : 'Seleccionar'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            locale={es}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      data-testid="cancel-campaign-btn"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800"
                      disabled={creating}
                      data-testid="save-campaign-btn"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        'Guardar borrador'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm" data-testid="campaigns-table-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-24" />
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
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primera campaña
                </Button>
              )}
            </div>
          ) : (
            <Table data-testid="campaigns-table">
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">
                    Nombre
                  </TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">
                    Estado
                  </TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">
                    Fecha inicio
                  </TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">
                    Fecha fin
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow 
                    key={campaign.id} 
                    className="hover:bg-slate-50/50"
                    data-testid={`campaign-row-${campaign.id}`}
                  >
                    <TableCell className="font-medium text-slate-900">
                      {campaign.name}
                      {campaign.description && (
                        <p className="text-sm text-slate-500 font-normal truncate max-w-xs">
                          {campaign.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_LABELS[campaign.status]?.variant || 'secondary'}>
                        {STATUS_LABELS[campaign.status]?.label || campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(campaign.start_date)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(campaign.end_date)}
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
