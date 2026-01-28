import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
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
  ArrowLeft, Save, Send, Plus, Trash2, Loader2, AlertCircle, 
  Briefcase, Building2, UserCheck, Lock
} from 'lucide-react';
import { CAMPAIGN_STATUS, CAMPAIGN_STATUS_LABELS, ROLES } from '../../lib/constants';

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

  const isEditable = campaign?.status === CAMPAIGN_STATUS.DRAFT;
  const canEdit = hasRole(ROLES.PLANEACION) && isEditable;

  const fetchCampaign = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCampaign(data);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      toast.error('Error al cargar la campaña');
      navigate('/planeacion/campaigns');
    }
  }, [id, navigate]);

  const fetchPositionsCatalog = async () => {
    try {
      const { data, error } = await supabase
        .from('positions_catalog')
        .select('*')
        .order('name');
      if (error) throw error;
      setPositions(data || []);
    } catch (err) {
      console.error('Error fetching positions:', err);
    }
  };

  const fetchCampaignPositions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_positions')
        .select('*, positions_catalog(*)')
        .eq('campaign_id', id);
      if (error) throw error;
      setCampaignPositions(data || []);
    } catch (err) {
      console.error('Error fetching campaign positions:', err);
    }
  }, [id]);

  const fetchAuthorizedFacilities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_authorized_facilities')
        .select('*, health_facilities(*)')
        .eq('campaign_id', id);
      if (error) throw error;
      setAuthorizedFacilities(data || []);
    } catch (err) {
      console.error('Error fetching facilities:', err);
    }
  }, [id]);

  const fetchValidatorUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('validator_units')
        .select('*')
        .order('name');
      if (error) throw error;
      setValidatorUnits(data || []);
    } catch (err) {
      console.error('Error fetching validator units:', err);
    }
  };

  const fetchCampaignValidators = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_validators')
        .select('*, validator_units(*), campaign_positions(*, positions_catalog(*))')
        .eq('campaign_id', id);
      if (error) throw error;
      setCampaignValidators(data || []);
    } catch (err) {
      console.error('Error fetching campaign validators:', err);
    }
  }, [id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCampaign(),
        fetchPositionsCatalog(),
        fetchCampaignPositions(),
        fetchAuthorizedFacilities(),
        fetchValidatorUnits(),
        fetchCampaignValidators(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchCampaign, fetchCampaignPositions, fetchAuthorizedFacilities, fetchCampaignValidators]);

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
      console.error('Error saving campaign:', err);
      toast.error('Error al guardar');
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
      fetchCampaign();
    } catch (err) {
      console.error('Error submitting campaign:', err);
      toast.error('Error al enviar a revisión');
    } finally {
      setSubmitting(false);
    }
  };

  // Positions handlers
  const handleAddPosition = async () => {
    if (!selectedPosition || !slotsAuthorized) {
      toast.error('Selecciona una posición y define las plazas autorizadas');
      return;
    }
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
      fetchCampaignPositions();
    } catch (err) {
      console.error('Error adding position:', err);
      toast.error('Error al agregar posición');
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
      fetchCampaignPositions();
      fetchCampaignValidators();
    } catch (err) {
      console.error('Error removing position:', err);
      toast.error('Error al eliminar posición');
    }
  };

  // CLUES handlers
  const handleValidateClues = async () => {
    const cluesList = cluesInput.split(/[\n,;]+/).map(c => c.trim()).filter(Boolean);
    if (cluesList.length === 0) {
      toast.error('Ingresa al menos una CLUES');
      return;
    }

    setValidatingClues(true);
    try {
      // Validate CLUES exist in health_facilities
      const { data: validFacilities, error } = await supabase
        .from('health_facilities')
        .select('id, clues, name')
        .in('clues', cluesList);

      if (error) throw error;

      const validClues = validFacilities?.map(f => f.clues) || [];
      const invalidClues = cluesList.filter(c => !validClues.includes(c));

      if (invalidClues.length > 0) {
        toast.error(`CLUES no encontradas: ${invalidClues.slice(0, 5).join(', ')}${invalidClues.length > 5 ? '...' : ''}`);
      }

      if (validFacilities && validFacilities.length > 0) {
        // Insert valid facilities
        const toInsert = validFacilities.map(f => ({
          campaign_id: id,
          facility_id: f.id,
        }));

        const { error: insertError } = await supabase
          .from('campaign_authorized_facilities')
          .upsert(toInsert, { onConflict: 'campaign_id,facility_id' });

        if (insertError) throw insertError;
        
        toast.success(`${validFacilities.length} CLUES agregadas`);
        setCluesInput('');
        fetchAuthorizedFacilities();
      }
    } catch (err) {
      console.error('Error validating CLUES:', err);
      toast.error('Error al validar CLUES');
    } finally {
      setValidatingClues(false);
    }
  };

  const handleRemoveFacility = async (facilityId) => {
    try {
      const { error } = await supabase
        .from('campaign_authorized_facilities')
        .delete()
        .eq('id', facilityId);
      if (error) throw error;
      toast.success('CLUES eliminada');
      fetchAuthorizedFacilities();
    } catch (err) {
      console.error('Error removing facility:', err);
      toast.error('Error al eliminar CLUES');
    }
  };

  // Validators handlers
  const handleAddValidators = async () => {
    if (!selectedPositionForValidator || selectedValidatorUnits.length === 0) {
      toast.error('Selecciona una posición y al menos una unidad validadora');
      return;
    }
    try {
      const toInsert = selectedValidatorUnits.map(unitId => ({
        campaign_id: id,
        campaign_position_id: selectedPositionForValidator,
        validator_unit_id: unitId,
        is_required: true,
      }));

      const { error } = await supabase
        .from('campaign_validators')
        .upsert(toInsert, { onConflict: 'campaign_id,campaign_position_id,validator_unit_id' });

      if (error) throw error;
      toast.success('Validadores asignados');
      setValidatorDialogOpen(false);
      setSelectedPositionForValidator('');
      setSelectedValidatorUnits([]);
      fetchCampaignValidators();
    } catch (err) {
      console.error('Error adding validators:', err);
      toast.error('Error al asignar validadores');
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
      fetchCampaignValidators();
    } catch (err) {
      console.error('Error removing validator:', err);
      toast.error('Error al eliminar validador');
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/planeacion/campaigns')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold text-slate-900">{campaign?.name}</h1>
              {getStatusBadge(campaign?.status)}
              {!isEditable && <Lock className="w-4 h-4 text-slate-400" />}
            </div>
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
                disabled={!canEdit}
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
            CLUES Autorizadas ({authorizedFacilities.length})
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
                <CardTitle className="text-lg">Posiciones de la campaña</CardTitle>
                <CardDescription>Selecciona las posiciones y define las plazas autorizadas</CardDescription>
              </div>
              {canEdit && (
                <Dialog open={positionDialogOpen} onOpenChange={setPositionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="w-4 h-4 mr-2" />Agregar posición</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar posición</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Posición</Label>
                        <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar posición" /></SelectTrigger>
                          <SelectContent>
                            {positions.filter(p => !campaignPositions.some(cp => cp.position_id === p.id)).map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Plazas autorizadas</Label>
                        <Input 
                          type="number" 
                          min="1" 
                          value={slotsAuthorized} 
                          onChange={(e) => setSlotsAuthorized(e.target.value)}
                          placeholder="Ej: 10"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPositionDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleAddPosition}>Agregar</Button>
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
                      <TableHead>Plazas autorizadas</TableHead>
                      {canEdit && <TableHead>Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignPositions.map((cp) => (
                      <TableRow key={cp.id}>
                        <TableCell className="font-medium">{cp.positions_catalog?.name || 'N/A'}</TableCell>
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
              <CardDescription>Unidades de salud habilitadas para esta campaña</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canEdit && (
                <div className="space-y-2">
                  <Label>Agregar CLUES (separadas por coma, punto y coma o salto de línea)</Label>
                  <Textarea
                    value={cluesInput}
                    onChange={(e) => setCluesInput(e.target.value)}
                    placeholder="BSSSA000001&#10;BSSSA000002&#10;BSSSA000003"
                    rows={4}
                  />
                  <Button onClick={handleValidateClues} disabled={validatingClues}>
                    {validatingClues ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Validar y agregar
                  </Button>
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
                      {canEdit && <TableHead>Acciones</TableHead>}
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
                <CardTitle className="text-lg">Unidades validadoras</CardTitle>
                <CardDescription>Asigna las unidades que validarán cada posición</CardDescription>
              </div>
              {canEdit && campaignPositions.length > 0 && (
                <Dialog open={validatorDialogOpen} onOpenChange={setValidatorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="w-4 h-4 mr-2" />Asignar validadores</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Asignar validadores</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Posición</Label>
                        <Select value={selectedPositionForValidator} onValueChange={setSelectedPositionForValidator}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar posición" /></SelectTrigger>
                          <SelectContent>
                            {campaignPositions.map(cp => (
                              <SelectItem key={cp.id} value={cp.id}>{cp.positions_catalog?.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Unidades validadoras</Label>
                        <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                          {validatorUnits.map(unit => (
                            <div key={unit.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`unit-${unit.id}`}
                                checked={selectedValidatorUnits.includes(unit.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedValidatorUnits([...selectedValidatorUnits, unit.id]);
                                  } else {
                                    setSelectedValidatorUnits(selectedValidatorUnits.filter(id => id !== unit.id));
                                  }
                                }}
                              />
                              <label htmlFor={`unit-${unit.id}`} className="text-sm">{unit.name}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setValidatorDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleAddValidators}>Asignar</Button>
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
                      <TableHead>Requerido</TableHead>
                      {canEdit && <TableHead>Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignValidators.map((cv) => (
                      <TableRow key={cv.id}>
                        <TableCell>{cv.campaign_positions?.positions_catalog?.name || 'N/A'}</TableCell>
                        <TableCell>{cv.validator_units?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={cv.is_required ? 'default' : 'secondary'}>
                            {cv.is_required ? 'Sí' : 'No'}
                          </Badge>
                        </TableCell>
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
