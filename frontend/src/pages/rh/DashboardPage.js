import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'sonner';
import { 
  BarChart3, RefreshCw, Megaphone, FileText, CheckCircle, Download
} from 'lucide-react';
import { CAMPAIGN_STATUS, PROPOSAL_STATUS } from '../../lib/constants';

export default function RHDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch campaigns count
      const { data: campaigns, error: campError } = await supabase
        .from('campaigns')
        .select('id, status');
      if (campError) throw campError;

      // Fetch proposals count
      const { data: proposals, error: propError } = await supabase
        .from('proposals')
        .select('id, status');
      if (propError) throw propError;

      const totalCampaigns = campaigns?.length || 0;
      const activeCampaigns = campaigns?.filter(c => c.status === CAMPAIGN_STATUS.ACTIVE).length || 0;
      const totalProposals = proposals?.length || 0;
      const approvedProposals = proposals?.filter(p => p.status === PROPOSAL_STATUS.APPROVED).length || 0;
      const inValidationProposals = proposals?.filter(p => p.status === PROPOSAL_STATUS.IN_VALIDATION).length || 0;
      const rejectedProposals = proposals?.filter(p => p.status === PROPOSAL_STATUS.REJECTED).length || 0;

      setStats({
        totalCampaigns,
        activeCampaigns,
        totalProposals,
        approvedProposals,
        inValidationProposals,
        rejectedProposals,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          id,
          curp,
          status,
          created_at,
          campaigns(name),
          campaign_positions(positions_catalog(name)),
          health_facilities(clues, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = ['ID', 'CURP', 'Estado', 'Campaña', 'Posición', 'CLUES', 'Unidad de Salud', 'Fecha'];
      const rows = data?.map(p => [
        p.id,
        p.curp,
        p.status,
        p.campaigns?.name || '',
        p.campaign_positions?.positions_catalog?.name || '',
        p.health_facilities?.clues || '',
        p.health_facilities?.name || '',
        p.created_at ? new Date(p.created_at).toLocaleDateString() : '',
      ]) || [];

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `propuestas_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('Exportación completada');
    } catch (err) {
      console.error('Error exporting:', err);
      toast.error('Error al exportar');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="rh-dashboard-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Dashboard RH</h1>
            <p className="font-body text-sm text-slate-500">
              Indicadores y reportes de reclutamiento
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            <Download className={`w-4 h-4 mr-2 ${exporting ? 'animate-spin' : ''}`} />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Campaigns Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Megaphone className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{stats?.totalCampaigns || 0}</p>
                    <p className="text-sm text-slate-500">Total campañas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Megaphone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">{stats?.activeCampaigns || 0}</p>
                    <p className="text-sm text-slate-500">Campañas activas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Proposals Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{stats?.totalProposals || 0}</p>
                    <p className="text-sm text-slate-500">Total propuestas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-amber-600">{stats?.inValidationProposals || 0}</p>
                    <p className="text-sm text-slate-500">En validación</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">{stats?.approvedProposals || 0}</p>
                    <p className="text-sm text-slate-500">Aprobadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-600">{stats?.rejectedProposals || 0}</p>
                    <p className="text-sm text-slate-500">Rechazadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
