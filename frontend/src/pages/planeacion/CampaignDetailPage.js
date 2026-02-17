import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../../components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '../../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner';
import { 
  ArrowLeft, Save, Send, Plus, Trash2, Loader2, 
  Briefcase, Building2, UserCheck, Lock, Upload
} from 'lucide-react';
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABELS, ROLES } from '../../lib/constants';
import logger from '../../lib/logger';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Positions
  const [positions, setPositions] = useState([]);
  const [campaignPositions, setCampaignPositions] = useState([]);
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [slotsAuthorized, setSlotsAuthorized] = useState('');
  const [addingPosition, setAddingPosition] = useState(false);
  
  // CLUES
  const [cluesInput, setCluesInput] = useState('');
  const [authorizedFacilities, setAuthorizedFacilities] = useState([]);
  const [validatingClues, setValidatingClues] = useState(false);
  
  // Validators
  const [validatorUnits, setValidatorUnits] = useState([]);
  const [campaignValidators, setCampaignValidators] = useState([]);
  const [validatorDialogOpen, setValidatorDialogOpen] = useState(false);
  const [selectedPositionForValidator, setSelectedPositionForValidator] = useState('');
  const [selectedValidatorUnits, setSelectedValidatorUnits] = useState([]);
  const [addingValidators, setAddingValidators] = useState(false);

  const isEditable = campaign?.status === CAMPAIGN_STATUS.DRAFT;
  const canEdit = hasRole(ROLES.PLANEACION) && isEditable;

  // Load all data on mount
  useEffect(() => {
    let isMounted = true;

    const loadAllData = async () => {
      setLoading(true);
      
      try {
        // Fetch campaign
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .single();

        if (campaignError) {
          logger.error('CampaignDetailPage', 'Error fetching campaign', campaignError);
          toast.error('Error al cargar la campaña');
          navigate('/planeacion/campaigns');
          return;
        }

        if (isMounted) setCampaign(campaignData);

        // Fetch positions catalog
        const { data: positionsData } = await supabase
          .from('positions_catalog')
          .select('*')
          .order('name');
        if (isMounted) setPositions(positionsData || []);

        // Fetch campaign positions
        const { data: cpData } = await supabase
          .from('campaign_positions')
          .select('*, positions_catalog(*)')
          .eq('campaign_id', id);
        if (isMounted) setCampaignPositions(cpData || []);

        // Fetch authorized facilities
        const { data: afData } = await supabase
          .from('campaign_authorized_facilities')
          .select('*, health_facilities(*)')
          .eq('campaign_id', id);
        if (isMounted) setAuthorizedFacilities(afData || []);

        // Fetch validator units
        const { data: vuData } = await supabase
          .from('validator_units')
          .select('*')
          .order('name');
        if (isMounted) setValidatorUnits(vuData || []);

        // Fetch campaign validators
        const { data: cvData } = await supabase
          .from('campaign_validators')
          .select('*, validator_units(*), positions_catalog(*)')
          .eq('campaign_id', id);
        if (isMounted) setCampaignValidators(cvData || []);

      } catch (err) {
        logger.error('CampaignDetailPage', 'Error loading data', err);
        toast.error('Error al cargar datos');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllData();

    return () => { isMounted = false; };
  }, [id, navigate]);

  // Refresh functions (called after mutations)
  const refreshCampaignPositions = async () => {
    const { data } = await supabase
      .from('campaign_positions')
      .select('*, positions_catalog(*)')
      .eq('campaign_id', id);
    setCampaignPositions(data || []);
  };

  const refreshAuthorizedFacilities = async () => {
    const { data } = await supabase
      .from('campaign_authorized_facilities')
      .select('*, health_facilities(*)')
      .eq('campaign_id', id);
    setAuthorizedFacilities(data || []);
  };

  const refreshCampaignValidators = async () => {
    const { data } = await supabase
      .from('campaign_validators')
      .select('*, validator_units(*), positions_catalog(*)')
      .eq('campaign_id', id);
    setCampaignValidators(data || []);
  };

  const handleSaveName = async () => {
    if (!campaign?.name?.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ name: campaign.name })
        .eq('id', id);
      if (error) throw error;
      toast.success('Campaña actualizada');
    } catch (err) {
      logger.error('CampaignDetailPage', 'Error saving campaign', err);
      toast.error('Error al guardar: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (campaignPositions.length === 0) {
      toast.error('Agrega al menos una posición antes de enviar a revisión');
      return;
    }
    if (authorizedFacilities.length === 0) {
      toast.error('Agrega al menos una CLUES autorizada antes de enviar a revisión');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: CAMPAIGN_STATUS.UNDER_REVIEW })
        .eq('id', id);
      if (error) throw error;
      toast.success('Campaña enviada a revisión');
      setCampaign(prev => ({ ...prev, status: CAMPAIGN_STATUS.UNDER_REVIEW }));
    } catch (err) {
      logger.error('CampaignDetailPage', 'Error submitting campaign', err);
      toast.error('Error al enviar a revisión: ' + (err.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  // Position handlers
  const handleAddPosition = async () => {
    if (!selectedPosition || !slotsAuthorized) {
      toast.error('Selecciona una posición y define las plazas autorizadas');
      return;
    }
    setAddingPosition(true);
    try {
      const { error } = await supabase
        .from('campaign_positions')
        .insert([{
          campaign_id: id,
          position_id: selectedPosition,
          slots_authorized: parseInt(slotsAuthorized),
        }]);
      if (error) throw error;
      toast.success('Posición agregada');
      setPositionDialogOpen(false);
      setSelectedPosition('');
      setSlotsAuthorized('');
      await refreshCampaignPositions();
    } catch (err) {
      logger.error('CampaignDetailPage', 'Error adding position', err);
      toast.error('Error al agregar posición: ' + (err.message || ''));
    } finally {
      setAddingPosition(false);
    }
  };

  const handleRemovePosition = async (positionId) => {
    try {
      const { error } = await supabase
        .from('campaign_positions')
        .delete()
        .eq('id', positionId);
      if (error) throw error;
      toast.success('Posición eliminada');
      await refreshCampaignPositions();
      await refreshCampaignValidators();
    } catch (err) {
      logger.error('CampaignDetailPage', 'Error removing position', err);
      toast.error('Error al eliminar: ' + (err.message || ''));
    }
  };

  // CLUES handlers
  const processClues = async (cluesText) => {
    const rawList = cluesText.split(/[\n,;]+/).map(c => c.trim().toUpperCase()).filter(Boolean);
    const uniqueList = Array.from(new Set(rawList));
    const existingClues = new Set(
      authorizedFacilities
        .map(af => af.health_facilities?.clues || af.clues)
        .filter(Boolean)
        .map(c => c.toUpperCase())
    );
    const cluesList = uniqueList.filter(c => !existingClues.has(c));
    
    if (cluesList.length === 0) {
      toast.error('No se encontraron CLUES válidas o ya están agregadas');
      return;
    }

    setValidatingClues(true);
    
    try {
      const { data: facilitiesData, error: facilitiesError } = await supabase
        .from('health_facilities')
        .select('*')
        .in('clues', cluesList);

      if (facilitiesError) {
        logger.error('CampaignDetailPage', 'Error querying facilities', facilitiesError);
        throw facilitiesError;
      }

      const validFacilities = facilitiesData || [];
      const validCluesSet = new Set(validFacilities.map(f => f.clues));
      const invalidClues = cluesList.filter(c => !validCluesSet.has(c));

      if (invalidClues.length > 0) {
        toast.error(`CLUES no encontradas (${invalidClues.length}): ${invalidClues.slice(0, 3).join(', ')}${invalidClues.length > 3 ? '...' : ''}`);
      }

      if (validFacilities.length > 0) {
        const campaignId = Number(id);
        const normalizedCampaignId = Number.isNaN(campaignId) ? id : campaignId;
        const rows = validFacilities.map(facility => ({
          campaign_id: normalizedCampaignId,
          clues: facility.clues,
        }));

        let successCount = 0;

        const { error: upsertError } = await supabase
          .from('campaign_authorized_facilities')
          .upsert(rows, { onConflict: 'campaign_id,clues', ignoreDuplicates: true });

        if (upsertError) {
          logger.error('CampaignDetailPage', 'Bulk upsert facilities error', upsertError);
          // Fallback to per-row insert
          for (const row of rows) {
            try {
              const { error: insertError } = await supabase
                .from('campaign_authorized_facilities')
                .insert(row);
              if (insertError) {
                if (insertError.code !== '23505') {
                  logger.error('CampaignDetailPage', 'Insert facility error', insertError);
                }
              } else {
                successCount++;
              }
            } catch (e) {
              logger.error('CampaignDetailPage', 'Insert facility exception', e);
            }
          }
        } else {
          successCount = rows.length;
        }

        if (successCount > 0) {
          toast.success(`${successCount} CLUES agregadas`);
          setCluesInput('');
          await refreshAuthorizedFacilities();
        }
      }
    } catch (err) {
      logger.error('CampaignDetailPage', 'Error processing CLUES', err);
      toast.error('Error al procesar CLUES');
    } finally {
      setValidatingClues(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        processClues(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRemoveFacility = async (facilityId) => {
    try {
      const { error } = await supabase
        .from('campaign_authorized_facilities')
        .delete()
        .eq('id', facilityId);
      if (error) throw error;
      toast.success('CLUES eliminada');
      await refreshAuthorizedFacilities();
    } catch (err) {
      logger.error('CampaignDetailPage', 'Error removing facility', err);
      toast.error('Error al eliminar: ' + (err.message || ''));
    }
  };

  // Validator handlers
  const handleAddValidators = async () => {
    if (!selectedPositionForValidator || selectedValidatorUnits.length === 0) {
      toast.error('Selecciona una posición y al menos una unidad validadora');
      return;
    }
    setAddingValidators(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Get the position_id from campaign_positions
      const campaignPosition = campaignPositions.find(cp => String(cp.id) === selectedPositionForValidator);
      const positionId = campaignPosition?.position_id;
      
      for (const unitId of selectedValidatorUnits) {
        try {
          // Check if validator already exists
          const { data: existing } = await supabase
            .from('campaign_validators')
            .select('id')
            .eq('campaign_id', id)
            .eq('position_id', positionId)
            .eq('validator_unit_id', unitId)
            .maybeSingle();
          
          if (existing) {
            // Already exists, skip
            continue;
          }
          
          const { error } = await supabase
            .from('campaign_validators')
            .insert({
              campaign_id: id,
              position_id: positionId,
              validator_unit_id: unitId,
              required: true,
            });
          
          if (error) {
            logger.error('CampaignDetailPage', 'Insert validator error', error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (e) {
          logger.error('CampaignDetailPage', 'Exception inserting validator', e);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} validador(es) asignado(s)`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} no pudieron ser asignados`);
      }
      
      setValidatorDialogOpen(false);
      setSelectedPositionForValidator('');
      setSelectedValidatorUnits([]);
      await refreshCampaignValidators();
    } catch (err) {
      logger.error('CampaignDetailPage', 'Error adding validators', err);
      toast.error('Error al asignar validadores: ' + (err.message || ''));
    } finally {
      setAddingValidators(false);
    }
  };

  const handleRemoveValidator = async (validatorId) => {
    try {
      const { error } = await supabase
        .from('campaign_validators')
        .delete()
        .eq('id', validatorId);
      if (error) throw error;
      toast.success('Validador eliminado');
      await refreshCampaignValidators();
    } catch (err) {
      logger.error('CampaignDetailPage', 'Error removing validator', err);
      toast.error('Error al eliminar');
    }
  };

  const getStatusBadge = (status) => {
    const config = CAMPAIGN_STATUS_LABELS[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="campaign-detail-page">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/planeacion/campaigns')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-slate-900">{campaign?.name}</h1>
            {getStatusBadge(campaign?.status)}
            {!isEditable && <Lock className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
        
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveName} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar
            </Button>
            <Button onClick={handleSubmitForReview} disabled={submitting} className="bg-slate-900 hover:bg-slate-800">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Enviar a revisión
            </Button>
          </div>
        )}
      </div>

      {!isEditable && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Esta campaña no puede ser editada porque su estado es {CAMPAIGN_STATUS_LABELS[campaign?.status]?.label}.
          </AlertDescription>
        </Alert>
      )}

      {/* Campaign Name Edit */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información básica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="campaignName">Nombre de la campaña</Label>
              <Input
                id="campaignName"
                value={campaign?.name || ''}
                onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="positions" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Posiciones ({campaignPositions.length})
          </TabsTrigger>
          <TabsTrigger value="clues" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            CLUES ({authorizedFacilities.length})
          </TabsTrigger>
          <TabsTrigger value="validators" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Validadores ({campaignValidators.length})
          </TabsTrigger>
        </TabsList>

        {/* Positions Tab */}
        <TabsContent value="positions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Posiciones</CardTitle>
                <CardDescription>Define las posiciones y plazas autorizadas</CardDescription>
              </div>
              {canEdit && (
                <Dialog open={positionDialogOpen} onOpenChange={setPositionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="w-4 h-4 mr-2" />Agregar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar posición</DialogTitle>
                      <DialogDescription>Selecciona una posición y define las plazas autorizadas</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Posición</Label>
                        <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                          <SelectContent>
                            {positions.filter(p => !campaignPositions.some(cp => cp.position_id === p.id)).map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Plazas autorizadas</Label>
                        <Input type="number" min="1" value={slotsAuthorized} onChange={(e) => setSlotsAuthorized(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPositionDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleAddPosition} disabled={addingPosition}>
                        {addingPosition && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Agregar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {campaignPositions.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No hay posiciones configuradas</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posición</TableHead>
                      <TableHead>Plazas</TableHead>
                      {canEdit && <TableHead className="w-16"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignPositions.map((cp) => (
                      <TableRow key={cp.id}>
                        <TableCell>{cp.positions_catalog?.name || 'N/A'}</TableCell>
                        <TableCell>{cp.slots_authorized}</TableCell>
                        {canEdit && (
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleRemovePosition(cp.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLUES Tab */}
        <TabsContent value="clues">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CLUES Autorizadas</CardTitle>
              <CardDescription>Unidades de salud habilitadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canEdit && (
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ingresar CLUES (separadas por coma o línea)</Label>
                      <Textarea
                        value={cluesInput}
                        onChange={(e) => setCluesInput(e.target.value)}
                        placeholder="BSSSA000001, BSSSA000002..."
                        rows={3}
                      />
                      <Button onClick={() => processClues(cluesInput)} disabled={validatingClues || !cluesInput.trim()}>
                        {validatingClues && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Validar y agregar
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>O cargar archivo (.txt, .csv)</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept=".txt,.csv"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="clues-file"
                        />
                        <label htmlFor="clues-file" className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                          <p className="text-sm text-slate-500">Clic para seleccionar archivo</p>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {authorizedFacilities.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No hay CLUES autorizadas</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CLUES</TableHead>
                      <TableHead>Nombre</TableHead>
                      {canEdit && <TableHead className="w-16"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authorizedFacilities.map((af) => (
                      <TableRow key={af.id}>
                        <TableCell className="font-mono text-sm">{af.health_facilities?.clues || 'N/A'}</TableCell>
                        <TableCell>{af.health_facilities?.name || 'N/A'}</TableCell>
                        {canEdit && (
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveFacility(af.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validators Tab */}
        <TabsContent value="validators">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Validadores</CardTitle>
                <CardDescription>Unidades que validarán cada posición</CardDescription>
              </div>
              {canEdit && campaignPositions.length > 0 && (
                <Dialog open={validatorDialogOpen} onOpenChange={setValidatorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />Asignar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Asignar validadores</DialogTitle>
                      <DialogDescription>Selecciona las unidades que validarán esta posición</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Posición</Label>
                        <Select 
                          value={selectedPositionForValidator} 
                          onValueChange={setSelectedPositionForValidator}
                        >
                          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                          <SelectContent>
                            {campaignPositions.map(cp => (
                              <SelectItem key={cp.id} value={String(cp.id)}>{cp.positions_catalog?.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Unidades validadoras</Label>
                        {validatorUnits.length === 0 ? (
                          <p className="text-sm text-slate-500 p-3 border rounded">No hay unidades disponibles</p>
                        ) : (
                          <div className="border rounded p-3 max-h-48 overflow-y-auto space-y-2">
                            {validatorUnits.map(unit => (
                              <div key={unit.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`unit-${unit.id}`}
                                  checked={selectedValidatorUnits.includes(String(unit.id))}
                                  onCheckedChange={(checked) => {
                                    const unitIdStr = String(unit.id);
                                    setSelectedValidatorUnits(prev => 
                                      checked ? [...prev, unitIdStr] : prev.filter(id => id !== unitIdStr)
                                    );
                                  }}
                                />
                                <label htmlFor={`unit-${unit.id}`} className="text-sm cursor-pointer">{unit.name}</label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setValidatorDialogOpen(false)}>Cancelar</Button>
                      <Button 
                        onClick={handleAddValidators} 
                        disabled={addingValidators || !selectedPositionForValidator || selectedValidatorUnits.length === 0}
                      >
                        {addingValidators && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Asignar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {campaignPositions.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Agrega posiciones primero</p>
              ) : campaignValidators.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No hay validadores asignados</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posición</TableHead>
                      <TableHead>Unidad validadora</TableHead>
                      {canEdit && <TableHead className="w-16"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignValidators.map((cv) => (
                      <TableRow key={cv.id}>
                        <TableCell>{cv.positions_catalog?.name || 'N/A'}</TableCell>
                        <TableCell>{cv.validator_units?.name || 'N/A'}</TableCell>
                        {canEdit && (
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveValidator(cv.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
