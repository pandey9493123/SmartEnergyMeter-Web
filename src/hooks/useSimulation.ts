import { useContext } from 'react';
import { SimulationContext } from '../contexts/simulation-context';

export function useSimulation() {
  const context = useContext(SimulationContext);

  if (!context) {
    throw new Error(
      'useSimulation must be used inside SimulationProvider.',
    );
  }

  return context;
}