import { render, screen } from '@testing-library/react';
import { 
  StatusBadge, 
  CampaignStatusBadge, 
  ProposalStatusBadge,
  ValidationStatusBadge 
} from './status-badge';
import { CAMPAIGN_STATUS, PROPOSAL_STATUS } from '../../lib/constants';

describe('StatusBadge', () => {
  it('renders with default variant', () => {
    render(<StatusBadge label="Test Badge" />);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('renders with success variant', () => {
    render(<StatusBadge variant="success" label="Success" />);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('renders with warning variant', () => {
    render(<StatusBadge variant="warning" label="Warning" />);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('renders with error variant', () => {
    render(<StatusBadge variant="error" label="Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});

describe('CampaignStatusBadge', () => {
  it('renders DRAFT status', () => {
    render(<CampaignStatusBadge status={CAMPAIGN_STATUS.DRAFT} />);
    expect(screen.getByText('Borrador')).toBeInTheDocument();
  });

  it('renders ACTIVE status', () => {
    render(<CampaignStatusBadge status={CAMPAIGN_STATUS.ACTIVE} />);
    expect(screen.getByText('Activa')).toBeInTheDocument();
  });
});

describe('ProposalStatusBadge', () => {
  it('renders SUBMITTED status', () => {
    render(<ProposalStatusBadge status={PROPOSAL_STATUS.SUBMITTED} />);
    expect(screen.getByText('Enviada')).toBeInTheDocument();
  });

  it('renders APPROVED status', () => {
    render(<ProposalStatusBadge status={PROPOSAL_STATUS.APPROVED} />);
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
  });
});

describe('ValidationStatusBadge', () => {
  it('renders APPROVED status', () => {
    render(<ValidationStatusBadge status="APPROVED" />);
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
  });

  it('renders PENDING status', () => {
    render(<ValidationStatusBadge status="PENDING" />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });
});
