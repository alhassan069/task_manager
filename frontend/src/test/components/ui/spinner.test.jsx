import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../../../components/ui/spinner';

describe('Spinner', () => {
  it('should render with default size', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    
    const svg = spinner.querySelector('svg');
    expect(svg).toHaveClass('h-8 w-8'); // Default size (md)
  });
  
  it('should render with small size', () => {
    render(<Spinner size="sm" />);
    
    const spinner = screen.getByRole('status');
    const svg = spinner.querySelector('svg');
    expect(svg).toHaveClass('h-4 w-4');
  });
  
  it('should render with large size', () => {
    render(<Spinner size="lg" />);
    
    const spinner = screen.getByRole('status');
    const svg = spinner.querySelector('svg');
    expect(svg).toHaveClass('h-12 w-12');
  });
  
  it('should apply additional className to SVG', () => {
    render(<Spinner className="text-red-500" />);
    
    const spinner = screen.getByRole('status');
    const svg = spinner.querySelector('svg');
    expect(svg).toHaveClass('text-red-500');
  });
}); 