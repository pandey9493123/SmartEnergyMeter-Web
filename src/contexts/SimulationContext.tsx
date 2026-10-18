import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { MeterLive } from '../types/telemetry';
import { SimulationContext } from './simulation-context';

const defaultSimData: MeterLive = {
  voltage: 230.1,
  current: 4.5,
  power: 1010,
  energy: 145.2,
  frequency: 50,
  powerFactor: 0.98,
  tariff: 7.5,
  bill: 1089,
  budgetLimit: 1500,
  budgetExceeded: false,
  relayState: true,
  faultActive: false,
  lastFault: null,
  receivedAt: Date.now(),
};

export function SimulationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simData, setSimData] = useState<MeterLive>(defaultSimData);

  useEffect(() => {
    if (!isSimulating) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSimData((previousData) => {
        if (previousData.faultActive) {
          return {
            ...previousData,
            current: 0,
            power: 0,
            receivedAt: Date.now(),
          };
        }

        const voltageNoise = (Math.random() - 0.5) * 1.5;
        const currentNoise = (Math.random() - 0.5) * 0.2;

        const nextVoltage = Math.max(
          0,
          previousData.voltage + voltageNoise,
        );

        const nextCurrent = Math.max(
          0,
          previousData.current + currentNoise,
        );

        const nextPower =
          nextVoltage * nextCurrent * previousData.powerFactor;

        return {
          ...previousData,
          voltage: nextVoltage,
          current: nextCurrent,
          power: nextPower,
          receivedAt: Date.now(),
        };
      });
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isSimulating]);

  const toggleSimulation = () => {
    setIsSimulating((previousValue) => {
      const nextValue = !previousValue;

      if (nextValue) {
        setSimData({
          ...defaultSimData,
          receivedAt: Date.now(),
        });
      }

      return nextValue;
    });
  };

  const triggerOverVoltage = () => {
    setSimData((previousData) => ({
      ...previousData,
      voltage: 275.4,
      faultActive: true,
      relayState: false,
      lastFault: 'OVER VOLTAGE DETECTED: 275.4 V',
      receivedAt: Date.now(),
    }));
  };

  const triggerOverCurrent = () => {
    setSimData((previousData) => ({
      ...previousData,
      current: 35.2,
      power: 230.1 * 35.2 * 0.98,
      faultActive: true,
      relayState: false,
      lastFault: 'OVER CURRENT DETECTED: 35.2 A',
      receivedAt: Date.now(),
    }));
  };

  const triggerUnderVoltage = () => {
    setSimData((previousData) => ({
      ...previousData,
      voltage: 165.3,
      power: 165.3 * previousData.current * previousData.powerFactor,
      faultActive: true,
      relayState: false,
      lastFault: 'UNDER VOLTAGE DETECTED: 165.3 V',
      receivedAt: Date.now(),
    }));
  };

  const triggerLoadSpike = () => {
    // Realistic non-fault event: a heavy appliance (e.g. motor startup)
    // briefly draws high current without tripping protection.
    setSimData((previousData) => ({
      ...previousData,
      current: 12.8,
      power: previousData.voltage * 12.8 * previousData.powerFactor,
      faultActive: false,
      relayState: true,
      lastFault: null,
      receivedAt: Date.now(),
    }));
  };

  const triggerBudgetWarning = () => {
    setSimData((previousData) => ({
      ...previousData,
      bill: previousData.budgetLimit + 50,
      budgetExceeded: true,
      receivedAt: Date.now(),
    }));
  };

  const resetFaults = () => {
    setSimData((previousData) => ({
      ...defaultSimData,
      bill: previousData.bill,
      budgetExceeded: previousData.budgetExceeded,
      receivedAt: Date.now(),
    }));
  };

  return (
    <SimulationContext.Provider
      value={{
        isSimulating,
        simulatedData: simData,
        toggleSimulation,
        triggerOverVoltage,
        triggerUnderVoltage,
        triggerOverCurrent,
        triggerLoadSpike,
        triggerBudgetWarning,
        resetFaults,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}