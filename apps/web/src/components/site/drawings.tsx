// Лінійні «архітектурні» креслення для редакційних панелей.
// Колір береться з currentColor, тож працюють і на paper, і на tan.
import type { SVGProps } from 'react';

type DrawingProps = SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  vectorEffect: 'non-scaling-stroke',
} as const;

function Grid() {
  return (
    <g opacity={0.25} strokeWidth={0.5}>
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={20 + i * 20}
          y1={10}
          x2={20 + i * 20}
          y2={190}
          strokeDasharray="2 4"
        />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={10}
          y1={20 + i * 20}
          x2={190}
          y2={20 + i * 20}
          strokeDasharray="2 4"
        />
      ))}
    </g>
  );
}

function Dimension({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g strokeWidth={0.75}>
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} />
      <text
        x={(x1 + x2) / 2}
        y={y - 5}
        textAnchor="middle"
        fontSize={7}
        fill="currentColor"
        stroke="none"
      >
        {label}
      </text>
    </g>
  );
}

export function ProfileDrawing(props: DrawingProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden {...base} {...props}>
      <Grid />
      {/* профіль голови */}
      <path d="M118 40c-26-8-56 6-62 36-3 14 0 24-4 34l-8 14c-2 4 0 6 4 6h8l2 14c1 8 7 12 15 11l12-2 4 20h40l-6-34c14-12 22-30 20-52-2-22-11-41-25-47Z" />
      {/* лінія росту волосся та форма */}
      <path d="M62 70c10-22 40-32 64-24 18 6 26 22 26 40" strokeDasharray="4 3" />
      <path d="M58 82c18-18 56-24 90-6" opacity={0.6} />
      {/* осі */}
      <line x1={100} y1={20} x2={100} y2={185} strokeWidth={0.75} strokeDasharray="8 3 2 3" />
      <line x1={30} y1={95} x2={175} y2={95} strokeWidth={0.75} strokeDasharray="8 3 2 3" />
      <circle cx={100} cy={95} r={3} />
      <Dimension x1={52} x2={152} y={190} label="18,4 см" />
    </svg>
  );
}

export function ScissorsDrawing(props: DrawingProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden {...base} {...props}>
      <Grid />
      <circle cx={58} cy={140} r={18} />
      <circle cx={58} cy={140} r={11} opacity={0.5} />
      <circle cx={92} cy={162} r={18} />
      <circle cx={92} cy={162} r={11} opacity={0.5} />
      <path d="M72 128 168 34l4 6-88 104" />
      <path d="M86 146 170 52l-2 8-72 96" />
      <circle cx={92} cy={122} r={3} />
      <path d="M150 30a40 40 0 0 1 28 30" strokeDasharray="3 3" />
      <text x={168} y={30} fontSize={7} fill="currentColor" stroke="none">
        32°
      </text>
      <Dimension x1={40} x2={172} y={190} label="6,5″" />
    </svg>
  );
}

export function RazorDrawing(props: DrawingProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden {...base} {...props}>
      <Grid />
      {/* лезо */}
      <path d="M40 84h92c10 0 16 6 16 14v4H40z" />
      <path d="M40 102h108" opacity={0.6} />
      <path d="M48 92h76" strokeDasharray="2 3" opacity={0.6} />
      {/* шарнір і ручка */}
      <circle cx={150} cy={93} r={4} />
      <path d="M150 97c6 18 4 40-4 64l-8-2c6-22 8-42 4-58" />
      <path d="M140 150c-2 10-6 18-12 24" strokeDasharray="4 3" opacity={0.6} />
      <line x1={30} y1={60} x2={160} y2={60} strokeWidth={0.75} strokeDasharray="8 3 2 3" />
      <Dimension x1={40} x2={148} y={72} label="0,1 мм кромка" />
      <Dimension x1={40} x2={170} y={190} label="155 мм" />
    </svg>
  );
}

export function CombDrawing(props: DrawingProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden {...base} {...props}>
      <Grid />
      <path d="M30 70h140v18H30z" />
      {Array.from({ length: 22 }, (_, i) => (
        <line key={i} x1={36 + i * 6} y1={88} x2={36 + i * 6} y2={i < 10 ? 128 : 118} />
      ))}
      {/* хвиля пари від рушника */}
      <path d="M50 160c10-8 20 8 30 0s20 8 30 0 20 8 30 0" opacity={0.7} />
      <path d="M50 172c10-8 20 8 30 0s20 8 30 0 20 8 30 0" opacity={0.4} />
      <Dimension x1={30} x2={170} y={50} label="190 мм" />
    </svg>
  );
}

// План зали: 6 крісел, рецепція, зона очікування
export function FloorPlanDrawing(props: DrawingProps) {
  return (
    <svg viewBox="0 0 320 200" aria-hidden {...base} {...props}>
      <path d="M10 10h300v180H10z" />
      <path d="M10 150h70v40" />
      <path d="M130 190v-14h40v14" opacity={0.6} />
      {Array.from({ length: 6 }, (_, i) => {
        const x = 110 + (i % 3) * 66;
        const y = i < 3 ? 22 : 104;
        return (
          <g key={i}>
            <rect x={x} y={y} width={36} height={8} />
            <circle cx={x + 18} cy={y + 30} r={11} />
            <path d={`M${x + 8} ${y + 44}h20`} />
            <text
              x={x + 18}
              y={y + 33}
              textAnchor="middle"
              fontSize={8}
              fill="currentColor"
              stroke="none"
            >
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        );
      })}
      <path d="M22 24h54v34H22z" />
      <text x={49} y={44} textAnchor="middle" fontSize={7} fill="currentColor" stroke="none">
        РЕЦЕПЦІЯ
      </text>
      <path d="M22 80h40v56H22z" strokeDasharray="3 3" />
      <text x={42} y={111} textAnchor="middle" fontSize={7} fill="currentColor" stroke="none">
        ЛАУНЖ
      </text>
      <text x={45} y={174} textAnchor="middle" fontSize={7} fill="currentColor" stroke="none">
        ВХІД
      </text>
    </svg>
  );
}

export const drawings = {
  profile: ProfileDrawing,
  scissors: ScissorsDrawing,
  razor: RazorDrawing,
  comb: CombDrawing,
} as const;
