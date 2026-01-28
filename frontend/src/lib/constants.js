// Role constants for the recruitment system
export const ROLES = {
  PLANEACION: 'PLANEACION',
  ATENCION_SALUD: 'ATENCION_SALUD',
  RH: 'RH',
  COORD_ESTATAL: 'COORD_ESTATAL',
  VALIDADOR: 'VALIDADOR',
  DG: 'DG',
};

export const ROLE_LABELS = {
  [ROLES.PLANEACION]: 'Planeación',
  [ROLES.ATENCION_SALUD]: 'Atención a la Salud',
  [ROLES.RH]: 'Recursos Humanos',
  [ROLES.COORD_ESTATAL]: 'Coordinación Estatal',
  [ROLES.VALIDADOR]: 'Validador',
  [ROLES.DG]: 'Dirección General',
};

export const CAMPAIGN_STATUS = {
  DRAFT: 'DRAFT',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const CAMPAIGN_STATUS_LABELS = {
  [CAMPAIGN_STATUS.DRAFT]: { label: 'Borrador', variant: 'secondary', color: 'bg-slate-100 text-slate-700' },
  [CAMPAIGN_STATUS.UNDER_REVIEW]: { label: 'En Revisión', variant: 'default', color: 'bg-amber-100 text-amber-700' },
  [CAMPAIGN_STATUS.APPROVED]: { label: 'Aprobada', variant: 'default', color: 'bg-blue-100 text-blue-700' },
  [CAMPAIGN_STATUS.ACTIVE]: { label: 'Activa', variant: 'default', color: 'bg-green-100 text-green-700' },
  [CAMPAIGN_STATUS.INACTIVE]: { label: 'Inactiva', variant: 'outline', color: 'bg-slate-100 text-slate-500' },
};

export const PROPOSAL_STATUS = {
  SUBMITTED: 'SUBMITTED',
  IN_VALIDATION: 'IN_VALIDATION',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const PROPOSAL_STATUS_LABELS = {
  [PROPOSAL_STATUS.SUBMITTED]: { label: 'Enviada', variant: 'secondary', color: 'bg-slate-100 text-slate-700' },
  [PROPOSAL_STATUS.IN_VALIDATION]: { label: 'En Validación', variant: 'default', color: 'bg-amber-100 text-amber-700' },
  [PROPOSAL_STATUS.APPROVED]: { label: 'Aprobada', variant: 'default', color: 'bg-green-100 text-green-700' },
  [PROPOSAL_STATUS.REJECTED]: { label: 'Rechazada', variant: 'destructive', color: 'bg-red-100 text-red-700' },
};

export const VALIDATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// CURP validation regex
export const CURP_REGEX = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[HM]{1}(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;

export const validateCURP = (curp) => {
  if (!curp) return false;
  return CURP_REGEX.test(curp.toUpperCase());
};
