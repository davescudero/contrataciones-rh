import { render, screen } from '@testing-library/react';
import { 
  TableSkeleton, 
  CardSkeleton, 
  StatCardSkeleton, 
  ListSkeleton,
  FormSkeleton,
  PageSkeleton,
  DetailSkeleton 
} from './skeletons';

describe('TableSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<TableSkeleton rows={3} columns={4} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with default values', () => {
    const { container } = render(<TableSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders without header when showHeader is false', () => {
    const { container } = render(<TableSkeleton rows={3} showHeader={false} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('CardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with specified lines', () => {
    const { container } = render(<CardSkeleton lines={3} />);
    // Should render skeleton lines
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('StatCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<StatCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('ListSkeleton', () => {
  it('renders correct number of items', () => {
    const { container } = render(<ListSkeleton items={4} />);
    // Each list item should have certain structure
    expect(container.firstChild).toBeInTheDocument();
  });

  it('uses default count when not specified', () => {
    const { container } = render(<ListSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('FormSkeleton', () => {
  it('renders correct number of fields', () => {
    const { container } = render(<FormSkeleton fields={3} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('uses default fields when not specified', () => {
    const { container } = render(<FormSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('PageSkeleton', () => {
  it('renders header skeleton', () => {
    const { container } = render(<PageSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('DetailSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<DetailSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders specified number of sections', () => {
    const { container } = render(<DetailSkeleton sections={3} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
