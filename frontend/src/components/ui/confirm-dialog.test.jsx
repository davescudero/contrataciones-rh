import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmDialog, useConfirmDialog } from './confirm-dialog';

// Test component that uses the hook
function TestComponent({ onConfirm, options = {} }) {
  const dialog = useConfirmDialog({
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
    confirmLabel: 'Yes, confirm',
    cancelLabel: 'Cancel',
    ...options,
  });

  const handleConfirm = async (data) => {
    if (onConfirm) {
      await onConfirm(data);
    }
  };

  return (
    <div>
      <button onClick={() => dialog.confirm({ id: 123 })}>
        Open Dialog
      </button>
      <ConfirmDialog {...dialog.dialogProps} onConfirm={handleConfirm} />
      <span data-testid="is-open">{dialog.isOpen ? 'open' : 'closed'}</span>
      <span data-testid="pending-data">{JSON.stringify(dialog.pendingData)}</span>
    </div>
  );
}

describe('ConfirmDialog', () => {
  it('renders with title and description when open', () => {
    render(
      <ConfirmDialog 
        open={true}
        onOpenChange={() => {}}
        title="Test Title"
        description="Test Description"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ConfirmDialog 
        open={false}
        onOpenChange={() => {}}
        title="Test Title"
        description="Test Description"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('shows custom labels', () => {
    render(
      <ConfirmDialog 
        open={true}
        onOpenChange={() => {}}
        title="Delete Item"
        description="This cannot be undone"
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmDialog 
        open={true}
        onOpenChange={() => {}}
        title="Confirm"
        description="Proceed?"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    
    fireEvent.click(screen.getByText('Confirmar'));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(
      <ConfirmDialog 
        open={true}
        onOpenChange={() => {}}
        title="Confirm"
        description="Proceed?"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );
    
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('applies danger variant styles', () => {
    render(
      <ConfirmDialog 
        open={true}
        onOpenChange={() => {}}
        title="Delete"
        description="This action cannot be undone"
        variant="danger"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    
    const confirmButton = screen.getByText('Confirmar').closest('button');
    expect(confirmButton).toHaveClass('bg-red-600');
  });

  it('applies warning variant styles', () => {
    render(
      <ConfirmDialog 
        open={true}
        onOpenChange={() => {}}
        title="Warning"
        description="Are you sure?"
        variant="warning"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    
    const confirmButton = screen.getByText('Confirmar').closest('button');
    expect(confirmButton).toHaveClass('bg-amber-600');
  });
});

describe('useConfirmDialog hook', () => {
  it('starts with dialog closed', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('is-open')).toHaveTextContent('closed');
  });

  it('opens dialog when confirm is called', async () => {
    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Open Dialog'));
    
    await waitFor(() => {
      expect(screen.getByTestId('is-open')).toHaveTextContent('open');
    });
  });

  it('passes data to pendingData when confirm is called', async () => {
    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Open Dialog'));
    
    await waitFor(() => {
      expect(screen.getByTestId('pending-data')).toHaveTextContent('{"id":123}');
    });
  });
});
