import { render, screen } from '@testing-library/react';
import { SearchInput, SearchBar } from './search-input';

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput placeholder="Buscar..." onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  it('shows search icon', () => {
    const { container } = render(<SearchInput onChange={() => {}} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <SearchInput onChange={() => {}} className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

describe('SearchBar', () => {
  it('renders search input', () => {
    render(
      <SearchBar 
        value="" 
        onChange={() => {}} 
      />
    );
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  it('renders filter buttons when provided', () => {
    render(
      <SearchBar 
        value="" 
        onChange={() => {}} 
        filters={[
          { label: 'Todos', value: 'all' },
          { label: 'Activos', value: 'active' },
        ]}
        activeFilter="all"
        onFilterChange={() => {}}
      />
    );
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Activos')).toBeInTheDocument();
  });
});
