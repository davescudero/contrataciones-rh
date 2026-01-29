import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'sonner';
import { 
  BarChart3, RefreshCw, Megaphone, FileText, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { CAMPAIGN_STATUS, PROPOSAL_STATUS } from '../../lib/constants';
import logger from '../../lib/logger';

export default function DGDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch campaigns by status
      const { data: campaigns, error: campError } = await supabase
        .from('campaigns')
        .select('id, status');
      if (campError) throw campError;

      // Fetch proposals by status
      const { data: proposals, error: propError } = await supabase
        .from('proposals')
        .select('id, status');
      if (propError) throw propError;

      const campaignsByStatus = {
        draft: campaigns?.filter(c => c.status === CAMPAIGN_STATUS.DRAFT).length || 0,
        underReview: campaigns?.filter(c => c.status === CAMPAIGN_STATUS.UNDER_REVIEW).length || 0,
        approved: campaigns?.filter(c => c.status === CAMPAIGN_STATUS.APPROVED).length || 0,
        active: campaigns?.filter(c => c.status === CAMPAIGN_STATUS.ACTIVE).length || 0,
        inactive: campaigns?.filter(c => c.status === CAMPAIGN_STATUS.INACTIVE).length || 0,
      };

      const proposalsByStatus = {
        submitted: proposals?.filter(p => p.status === PROPOSAL_STATUS.SUBMITTED).length || 0,
        inValidation: proposals?.filter(p => p.status === PROPOSAL_STATUS.IN_VALIDATION).length || 0,
        approved: proposals?.filter(p => p.status === PROPOSAL_STATUS.APPROVED).length || 0,
        rejected: proposals?.filter(p => p.status === PROPOSAL_STATUS.REJECTED).length || 0,
      };

      setStats({
        totalCampaigns: campaigns?.length || 0,
        totalProposals: proposals?.length || 0,
        campaignsByStatus,
        proposalsByStatus,
      });
    } catch (err) {
      logger.error('DGDashboard', 'Error fetching stats', err);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6" data-testid="dg-dashboard-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Dashboard Ejecutivo</h1>
            <p className="font-body text-sm text-slate-500">
              Vista general del proceso de reclutamiento
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Megaphone className="w-7 h-7 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-slate-900">{stats?.totalCampaigns || 0}</p>
                    <p className="text-slate-500">Campañas totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-7 h-7 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-slate-900">{stats?.totalProposals || 0}</p>
                    <p className="text-slate-500">Propuestas totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campaign Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Estado de campañas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Borrador</span>
                  <span className="font-semibold text-slate-900">{stats?.campaignsByStatus?.draft || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm text-amber-700">En revisión</span>
                  <span className="font-semibold text-amber-700">{stats?.campaignsByStatus?.underReview || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700">Aprobadas</span>
                  <span className="font-semibold text-blue-700">{stats?.campaignsByStatus?.approved || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-700">Activas</span>
                  <span className="font-semibold text-green-700">{stats?.campaignsByStatus?.active || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                  <span className="text-sm text-slate-500">Inactivas</span>
                  <span className="font-semibold text-slate-500">{stats?.campaignsByStatus?.inactive || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Proposals by Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Propuestas por estado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600">Enviadas</span>
                  </div>
                  <span className="font-semibold text-slate-900">{stats?.proposalsByStatus?.submitted || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-700">En validación</span>
                  </div>
                  <span className="font-semibold text-amber-700">{stats?.proposalsByStatus?.inValidation || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">Aprobadas</span>
                  </div>
                  <span className="font-semibold text-green-700">{stats?.proposalsByStatus?.approved || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">Rechazadas</span>
                  </div>
                  <span className="font-semibold text-red-700">{stats?.proposalsByStatus?.rejected || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
