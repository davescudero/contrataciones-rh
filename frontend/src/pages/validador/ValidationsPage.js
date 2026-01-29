import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
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
  CheckCircle, RefreshCw, Loader2, FileWarning, Eye, XCircle, FileText
} from 'lucide-react';
import { PROPOSAL_STATUS } from '../../lib/constants';

export default function ValidadorValidationsPage() {
  const { user } = useAuth();
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedValidation, setSelectedValidation] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [cvUrl, setCvUrl] = useState(null);
  const [loadingCv, setLoadingCv] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const fetchValidations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // First get the validator unit for this user
      const { data: userValidatorUnit, error: unitError } = await supabase
        .from('user_validator_units')
        .select('validator_unit_id')
        .eq('user_id', user.id)
        .single();

      if (unitError && unitError.code !== 'PGRST116') {
        console.error('Error fetching user validator unit:', unitError);
      }

      let query = supabase
        .from('proposal_validations')
        .select(`
          *,
          validator_units(name),
          proposals(
            *,
            curp,
            campaigns(name),
            positions_catalog(name),
            health_facilities(clues, name),
            files:cv_file_id(id, original_name, path)
          )
        `)
        .is('decision', null);

      // If user has a validator unit assigned, filter by it
      if (userValidatorUnit?.validator_unit_id) {
        query = query.eq('validator_unit_id', userValidatorUnit.validator_unit_id);
      }

      const { data, error } = await query.order('id', { ascending: true });

      if (error) throw error;

      // Filter only proposals in validation status
      const filtered = data?.filter(v => v.proposals?.status === PROPOSAL_STATUS.IN_VALIDATION || v.proposals?.status === PROPOSAL_STATUS.SUBMITTED) || [];
      setValidations(filtered);
    } catch (err) {
      console.error('Error fetching validations:', err);
      toast.error('Error al cargar validaciones');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchValidations();
  }, [fetchValidations]);

  const handleViewDetails = async (validation) => {
    setSelectedValidation(validation);
    setDetailDialogOpen(true);
    setCvUrl(null);
    setShowRejectForm(false);
    setRejectionReason('');

    // Get signed URL for CV
    const cvPath = validation.proposals?.files?.path;
    if (cvPath) {
      setLoadingCv(true);
      try {
        const { data, error } = await supabase.storage
          .from('cvs')
          .createSignedUrl(cvPath, 300); // 5 minutes

        if (error) throw error;
        setCvUrl(data.signedUrl);
      } catch (err) {
        console.error('Error getting CV URL:', err);
        toast.error('Error al cargar el CV');
      } finally {
        setLoadingCv(false);
      }
    }
  };

  const checkAllValidationsComplete = async (proposalId) => {
    // Get all validations for this proposal
    const { data: allValidations, error } = await supabase
      .from('proposal_validations')
      .select('*')
      .eq('proposal_id', proposalId);

    if (error) {
      console.error('Error checking validations:', error);
      return;
    }

    // Check if any validation is rejected
    const hasRejection = allValidations.some(v => v.decision === 'REJECTED');
    
    // Check if all validations are decided
    const allDecided = allValidations.every(v => v.decision !== null);
    
    // Check if all validations are approved
    const allApproved = allValidations.every(v => v.decision === 'APPROVED');

    if (hasRejection) {
      // Update proposal to REJECTED
      await supabase
        .from('proposals')
        .update({ status: PROPOSAL_STATUS.REJECTED })
        .eq('id', proposalId);
    } else if (allDecided && allApproved) {
      // Update proposal to APPROVED
      await supabase
        .from('proposals')
        .update({ status: PROPOSAL_STATUS.APPROVED })
        .eq('id', proposalId);
    }
  };

  const handleApprove = async () => {
    if (!selectedValidation) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('proposal_validations')
        .update({ 
          decision: 'APPROVED',
          decided_at: new Date().toISOString(),
          decided_by: user.id,
        })
        .eq('id', selectedValidation.id);

      if (error) throw error;

      await checkAllValidationsComplete(selectedValidation.proposal_id);

      toast.success('Propuesta aprobada');
      setDetailDialogOpen(false);
      fetchValidations();
    } catch (err) {
      console.error('Error approving:', err);
      toast.error('Error al aprobar');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedValidation) return;
    if (!rejectionReason.trim()) {
      toast.error('Ingresa el motivo del rechazo');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('proposal_validations')
        .update({ 
          decision: 'REJECTED',
          reason: rejectionReason.trim(),
          decided_at: new Date().toISOString(),
          decided_by: user.id,
        })
        .eq('id', selectedValidation.id);

      if (error) throw error;

      // Also update the proposal with rejection reason
      await supabase
        .from('proposals')
        .update({ 
          status: PROPOSAL_STATUS.REJECTED,
          rejection_reason: rejectionReason.trim(),
        })
        .eq('id', selectedValidation.proposal_id);

      toast.success('Propuesta rechazada');
      setDetailDialogOpen(false);
      fetchValidations();
    } catch (err) {
      console.error('Error rejecting:', err);
      toast.error('Error al rechazar');
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
    <div className="space-y-6" data-testid="validador-validations-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Validaciones</h1>
            <p className="font-body text-sm text-slate-500">
              Propuestas pendientes de validación
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={fetchValidations} disabled={loading}>
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
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : validations.length === 0 ? (
            <div className="p-12 text-center" data-testid="no-validations">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileWarning className="w-6 h-6 text-slate-400" />
              </div>
              <p className="font-body text-slate-500">No hay propuestas pendientes de validación</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">CURP</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Campaña</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Posición</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">CLUES</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Fecha</TableHead>
                  <TableHead className="font-medium text-xs uppercase tracking-wider text-slate-700">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validations.map((validation) => (
                  <TableRow key={validation.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-sm">{validation.proposals?.curp || '-'}</TableCell>
                    <TableCell>{validation.proposals?.campaigns?.name || '-'}</TableCell>
                    <TableCell>{validation.proposals?.campaign_positions?.positions_catalog?.name || '-'}</TableCell>
                    <TableCell className="font-mono text-sm">{validation.proposals?.health_facilities?.clues || '-'}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{formatDate(validation.created_at)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(validation)}
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Validar propuesta</DialogTitle>
            <DialogDescription>
              CURP: {selectedValidation?.proposals?.curp}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Proposal Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Campaña</p>
                <p className="font-medium">{selectedValidation?.proposals?.campaigns?.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Posición</p>
                <p className="font-medium">{selectedValidation?.proposals?.campaign_positions?.positions_catalog?.name}</p>
              </div>
              <div>
                <p className="text-slate-500">CLUES</p>
                <p className="font-mono">{selectedValidation?.proposals?.health_facilities?.clues}</p>
              </div>
              <div>
                <p className="text-slate-500">Unidad de Salud</p>
                <p className="font-medium">{selectedValidation?.proposals?.health_facilities?.name}</p>
              </div>
            </div>

            {/* CV Viewer */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Curriculum Vitae</Label>
                {cvUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={cvUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-1" />
                      Abrir en nueva pestaña
                    </a>
                  </Button>
                )}
              </div>
              {loadingCv ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : cvUrl ? (
                <iframe 
                  src={cvUrl} 
                  className="w-full h-64 border rounded"
                  title="CV Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-64 bg-slate-50 rounded">
                  <p className="text-slate-500">No se pudo cargar el CV</p>
                </div>
              )}
            </div>

            {/* Rejection Form */}
            {showRejectForm && (
              <div className="space-y-2">
                <Label>Motivo del rechazo *</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Describe el motivo del rechazo..."
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            {!showRejectForm ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRejectForm(true)} 
                  disabled={processing}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
                <Button 
                  onClick={handleApprove} 
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Aprobar
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRejectForm(false)} 
                  disabled={processing}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleReject} 
                  disabled={processing}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Confirmar rechazo
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
