import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../../components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '../../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FileText, Plus, RefreshCw, Loader2, FileWarning, Upload, List
} from 'lucide-react';
import { CAMPAIGN_STATUS, PROPOSAL_STATUS, PROPOSAL_STATUS_LABELS, validateCURP } from '../../lib/constants';

export default function CoordinacionProposalsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('campaigns');
  
  // Campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  
  // Selected campaign for proposal
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignPositions, setCampaignPositions] = useState([]);
  const [campaignFacilities, setCampaignFacilities] = useState([]);
  
  // Proposal form
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [curp, setCurp] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [curpError, setCurpError] = useState('');
  
  // My proposals
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(true);

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      // Get active campaigns
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', CAMPAIGN_STATUS.ACTIVE)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      toast.error('Error al cargar campañas');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const fetchProposals = useCallback(async () => {
    if (!user) return;
    setLoadingProposals(true);
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          campaigns(name),
          positions_catalog(name),
          health_facilities(clues, name)
        `)
        .eq('submitted_by', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      toast.error('Error al cargar propuestas');
    } finally {
      setLoadingProposals(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCampaigns();
    fetchProposals();
  }, [fetchProposals]);

  const handleSelectCampaign = async (campaign) => {
    setSelectedCampaign(campaign);
    
    // Fetch positions for this campaign
    const { data: positions, error: posError } = await supabase
      .from('campaign_positions')
      .select('*, positions_catalog(*)')
      .eq('campaign_id', campaign.id);
    
    if (posError) {
      console.error('Error fetching positions:', posError);
      toast.error('Error al cargar posiciones');
      return;
    }
    setCampaignPositions(positions || []);

    // Fetch authorized facilities for this campaign
    const { data: facilities, error: facError } = await supabase
      .from('campaign_authorized_facilities')
      .select('*, health_facilities(*)')
      .eq('campaign_id', campaign.id);
    
    if (facError) {
      console.error('Error fetching facilities:', facError);
      toast.error('Error al cargar CLUES');
      return;
    }
    setCampaignFacilities(facilities || []);

    setDialogOpen(true);
  };

  const handleCurpChange = (value) => {
    const upperValue = value.toUpperCase();
    setCurp(upperValue);
    if (upperValue && !validateCURP(upperValue)) {
      setCurpError('CURP inválida');
    } else {
      setCurpError('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error('El archivo no debe exceder 10MB');
        return;
      }
      setCvFile(file);
    }
  };

  const handleSubmitProposal = async () => {
    // Validations
    if (!selectedPosition) {
      toast.error('Selecciona una posición');
      return;
    }
    if (!selectedFacility) {
      toast.error('Selecciona una CLUES');
      return;
    }
    if (!curp || !validateCURP(curp)) {
      toast.error('Ingresa un CURP válido');
      return;
    }
    if (!cvFile) {
      toast.error('Adjunta el CV en formato PDF');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload CV to storage
      const fileName = `${curp}_${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, cvFile);

      if (uploadError) throw uploadError;

      // 2. Create file record
      const { data: fileRecord, error: fileError } = await supabase
        .from('files')
        .insert([{
          bucket: 'cvs',
          path: uploadData.path,
          original_name: cvFile.name,
          mime: 'application/pdf',
          size: cvFile.size,
          uploaded_by: user.id,
        }])
        .select()
        .single();

      if (fileError) throw fileError;

      // 3. Get CLUES from selected facility
      const facilityRecord = campaignFacilities.find(f => f.id === selectedFacility);
      
      // 4. Create proposal
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert([{
          campaign_id: selectedCampaign.id,
          position_id: campaignPositions.find(p => p.id === selectedPosition)?.position_id,
          clues: facilityRecord?.clues || facilityRecord?.health_facilities?.clues,
          curp: curp,
          cv_file_id: fileRecord.id,
          status: PROPOSAL_STATUS.SUBMITTED,
          submitted_by: user.id,
        }])
        .select()
        .single();

      if (proposalError) throw proposalError;

      // 5. Get validators for this position
      const positionId = campaignPositions.find(p => p.id === selectedPosition)?.position_id;
      const { data: validators, error: valError } = await supabase
        .from('campaign_validators')
        .select('*')
        .eq('campaign_id', selectedCampaign.id)
        .eq('position_id', positionId);

      if (valError) throw valError;

      // 6. Create validation records for each validator
      if (validators && validators.length > 0) {
        const validationRecords = validators.map(v => ({
          proposal_id: proposal.id,
          validator_unit_id: v.validator_unit_id,
        }));

        const { error: valInsertError } = await supabase
          .from('proposal_validations')
          .insert(validationRecords);

        if (valInsertError) throw valInsertError;

        // 7. Update proposal status to IN_VALIDATION
        await supabase
          .from('proposals')
          .update({ status: PROPOSAL_STATUS.IN_VALIDATION })
          .eq('id', proposal.id);
      }

      toast.success('Propuesta enviada exitosamente');
      setDialogOpen(false);
      resetForm();
      fetchProposals();
      setActiveTab('proposals');
    } catch (err) {
      console.error('Error submitting proposal:', err);
      toast.error('Error al enviar propuesta: ' + (err.message || 'Error desconocido'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCampaign(null);
    setSelectedPosition('');
    setSelectedFacility('');
    setCurp('');
    setCvFile(null);
    setCurpError('');
    setCampaignPositions([]);
    setCampaignFacilities([]);
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
    const config = PROPOSAL_STATUS_LABELS[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  return (
    <div className="space-y-6" data-testid="coordinacion-proposals-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Propuestas</h1>
            <p className="font-body text-sm text-slate-500">
              Crear y dar seguimiento a propuestas
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => { fetchCampaigns(); fetchProposals(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva propuesta
          </TabsTrigger>
          <TabsTrigger value="proposals" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Mis propuestas ({proposals.length})
          </TabsTrigger>
        </TabsList>

        {/* New Proposal Tab */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campañas activas</CardTitle>
              <CardDescription>Selecciona una campaña para crear una propuesta</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCampaigns ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <FileWarning className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay campañas activas disponibles</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <Card 
                      key={campaign.id} 
                      className="cursor-pointer hover:border-slate-400 transition-colors"
                      onClick={() => handleSelectCampaign(campaign)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{campaign.name}</p>
                          <p className="text-sm text-slate-500">Activa desde {formatDate(campaign.updated_at)}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Crear propuesta
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Proposals Tab */}
        <TabsContent value="proposals">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mis propuestas</CardTitle>
              <CardDescription>Seguimiento de propuestas enviadas</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingProposals ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-12">
                  <FileWarning className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No has enviado propuestas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>CURP</TableHead>
                      <TableHead>Campaña</TableHead>
                      <TableHead>Posición</TableHead>
                      <TableHead>CLUES</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proposals.map((proposal) => (
                      <TableRow key={proposal.id}>
                        <TableCell className="font-mono text-sm">{proposal.curp}</TableCell>
                        <TableCell>{proposal.campaigns?.name || '-'}</TableCell>
                        <TableCell>{proposal.positions_catalog?.name || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">{proposal.clues || proposal.health_facilities?.clues || '-'}</TableCell>
                        <TableCell>
                          {getStatusBadge(proposal.status)}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">{formatDate(proposal.submitted_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Proposal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva propuesta</DialogTitle>
            <DialogDescription>
              {selectedCampaign?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Position */}
            <div className="space-y-2">
              <Label>Posición *</Label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar posición" />
                </SelectTrigger>
                <SelectContent>
                  {campaignPositions.map((cp) => (
                    <SelectItem key={cp.id} value={cp.id}>
                      {cp.positions_catalog?.name} ({cp.slots_authorized} plazas)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Facility */}
            <div className="space-y-2">
              <Label>CLUES *</Label>
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar CLUES" />
                </SelectTrigger>
                <SelectContent>
                  {campaignFacilities.map((cf) => (
                    <SelectItem key={cf.id} value={cf.id}>
                      {cf.health_facilities?.clues} - {cf.health_facilities?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CURP */}
            <div className="space-y-2">
              <Label>CURP del candidato *</Label>
              <Input
                value={curp}
                onChange={(e) => handleCurpChange(e.target.value)}
                placeholder="AAAA000000HDFRRR00"
                maxLength={18}
                className="font-mono uppercase"
              />
              {curpError && (
                <p className="text-sm text-red-500">{curpError}</p>
              )}
            </div>

            {/* CV Upload */}
            <div className="space-y-2">
              <Label>CV (PDF) *</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cv-upload"
                />
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  {cvFile ? (
                    <p className="text-sm text-green-600">{cvFile.name}</p>
                  ) : (
                    <p className="text-sm text-slate-500">Clic para seleccionar archivo PDF</p>
                  )}
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitProposal} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Enviar propuesta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
