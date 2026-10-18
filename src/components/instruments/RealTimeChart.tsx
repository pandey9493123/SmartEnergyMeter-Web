import { useMemo } from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
);

interface RealTimeChartProps {
  title: string;
  labels: string[];
  dataStream: number[];
  lineColor: string;
  backgroundColor: string;
  yMin?: number;
  yMax?: number;
  unit: string;
}

export function RealTimeChart({
  title,
  labels,
  dataStream,
  lineColor,
  backgroundColor,
  yMin,
  yMax,
  unit,
}: RealTimeChartProps) {
  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 400,
        easing: 'linear',
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.88)',
          titleFont: {
            family: 'IBM Plex Mono',
          },
          bodyFont: {
            family: 'IBM Plex Mono',
          },
          callbacks: {
            label: (context) => `${context.parsed.y} ${unit}`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(128, 128, 128, 0.12)',
          },
          ticks: {
            font: {
              family: 'IBM Plex Mono',
              size: 10,
            },
            color: '#8b96a8',
          },
        },
        y: {
          min: yMin,
          max: yMax,
          grid: {
            color: 'rgba(128, 128, 128, 0.12)',
          },
          ticks: {
            font: {
              family: 'IBM Plex Mono',
              size: 10,
            },
            color: '#8b96a8',
            callback: (value) => `${value}`,
          },
        },
      },
      elements: {
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4,
        },
        line: {
          tension: 0.4,
          borderWidth: 2,
        },
      },
    }),
    [unit, yMin, yMax],
  );

  const data: ChartData<'line'> = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: title,
          data: dataStream,
          borderColor: lineColor,
          backgroundColor,
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    }),
    [backgroundColor, dataStream, labels, lineColor, title],
  );

  return (
    <section
      style={{
        width: '100%',
        minWidth: 0,
        height: '300px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--surface-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        boxShadow: `0 0 16px ${lineColor}22`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
          color: 'var(--text-secondary)',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '0.8rem',
        }}
      >
        <span
          style={{
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>

        <span style={{ color: lineColor }}>{unit}</span>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
        }}
      >
        <Line options={options} data={data} />
      </div>
    </section>
  );
}