import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { toast } from 'sonner';
import { 
  BarChart3, RefreshCw, Megaphone, FileText, CheckCircle, Download, XCircle, Clock
} from 'lucide-react';
import { CAMPAIGN_STATUS, PROPOSAL_STATUS } from '../../lib/constants';
import logger from '../../lib/logger';

// New components
import { PageHeader } from '../../components/ui/breadcrumbs';
import { StatCardSkeleton } from '../../components/ui/skeletons';

/**
 * Stat Card component for dashboard
 */
function StatCard({ icon: Icon, value, label, color = 'slate' }) {
  const colorClasses = {
    slate: { bg: 'bg-slate-100', text: 'text-slate-600', value: 'text-slate-900' },
    green: { bg: 'bg-green-100', text: 'text-green-600', value: 'text-green-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', value: 'text-amber-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600', value: 'text-red-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', value: 'text-blue-600' },
  };
  
  const colors = colorClasses[color] || colorClasses.slate;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div>
            <p className={`text-3xl font-bold ${colors.value}`}>{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
      logger.error('RHDashboard', 'Error fetching stats', err);
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
      logger.error('RHDashboard', 'Error exporting', err);
      toast.error('Error al exportar');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="rh-dashboard-page">
      {/* Header */}
      <PageHeader
        icon={BarChart3}
        title="Dashboard RH"
        description="Indicadores y reportes de reclutamiento"
        breadcrumbs={[
          { label: 'RH' },
          { label: 'Dashboard' },
        ]}
        actions={
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
        }
      />

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Campaigns Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              icon={Megaphone}
              value={stats?.totalCampaigns || 0}
              label="Total campañas"
              color="slate"
            />
            <StatCard
              icon={Megaphone}
              value={stats?.activeCampaigns || 0}
              label="Campañas activas"
              color="green"
            />
          </div>

          {/* Proposals Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FileText}
              value={stats?.totalProposals || 0}
              label="Total propuestas"
              color="slate"
            />
            <StatCard
              icon={Clock}
              value={stats?.inValidationProposals || 0}
              label="En validación"
              color="amber"
            />
            <StatCard
              icon={CheckCircle}
              value={stats?.approvedProposals || 0}
              label="Aprobadas"
              color="green"
            />
            <StatCard
              icon={XCircle}
              value={stats?.rejectedProposals || 0}
              label="Rechazadas"
              color="red"
            />
          </div>

          {/* Stats summary */}
          {stats && stats.totalProposals > 0 && (
            <Card className="bg-slate-50">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-slate-700 mb-4">Resumen de propuestas</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round((stats.approvedProposals / stats.totalProposals) * 100)}%
                    </p>
                    <p className="text-xs text-slate-500">Tasa de aprobación</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">
                      {Math.round((stats.inValidationProposals / stats.totalProposals) * 100)}%
                    </p>
                    <p className="text-xs text-slate-500">En proceso</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {Math.round((stats.rejectedProposals / stats.totalProposals) * 100)}%
                    </p>
                    <p className="text-xs text-slate-500">Tasa de rechazo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
