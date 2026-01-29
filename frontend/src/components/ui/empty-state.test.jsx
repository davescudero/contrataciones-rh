import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState, SearchEmptyState, ErrorEmptyState } from './empty-state';

describe('EmptyState', () => {
  it('renders with title and description', () => {
    render(
      <EmptyState 
        title="No hay datos" 
        description="No se encontraron resultados"
      />
    );
    
    expect(screen.getByText('No hay datos')).toBeInTheDocument();
    expect(screen.getByText('No se encontraron resultados')).toBeInTheDocument();
  });

  it('renders with action button when provided', () => {
    const onAction = jest.fn();
    render(
      <EmptyState 
        title="No hay datos" 
        actionLabel="Crear nuevo"
        onAction={onAction}
      />
    );
    
    const button = screen.getByText('Crear nuevo');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

describe('SearchEmptyState', () => {
  it('renders with search query', () => {
    const onClear = jest.fn();
    render(<SearchEmptyState query="test" onClear={onClear} />);
    
    expect(screen.getByText(/No se encontraron resultados para "test"/)).toBeInTheDocument();
  });
});

describe('ErrorEmptyState', () => {
  it('renders with custom message', () => {
    render(<ErrorEmptyState message="Error de conexión" />);
    expect(screen.getByText('Error de conexión')).toBeInTheDocument();
  });

  it('renders with default message when not provided', () => {
    render(<ErrorEmptyState />);
    expect(screen.getByText('Error al cargar los datos')).toBeInTheDocument();
  });
});
