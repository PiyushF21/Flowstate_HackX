import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

// ─── Default chart colors ─────────
const CHART_COLORS = [
  '#3B82F6', // blue
  '#F97316', // orange
  '#22C55E', // green
  '#EAB308', // yellow
  '#A855F7', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#EF4444', // red
]

// ─── Shared tooltip style ─────────
const tooltipStyle = {
  contentStyle: {
    background: 'rgba(19, 19, 26, 0.95)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '10px 14px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  labelStyle: { color: '#94A3B8', fontSize: 12 },
  itemStyle: { color: '#F1F5F9', fontSize: 12 },
}

// ─── Axis style ─────────
const axisStyle = {
  tick: { fill: '#64748B', fontSize: 11 },
  axisLine: { stroke: '#2A2A3C' },
  tickLine: { stroke: '#2A2A3C' },
}

// ──────────────────────────────────
// BAR CHART
// ──────────────────────────────────
interface BarChartProps {
  data: Record<string, unknown>[]
  dataKey: string
  xKey?: string
  color?: string
  height?: number
  showGrid?: boolean
  className?: string
}

export function ChartBar({
  data,
  dataKey,
  xKey = 'name',
  color = CHART_COLORS[0],
  height = 300,
  showGrid = true,
  className,
}: BarChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barSize={28}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1C1C27" />}
          <XAxis dataKey={xKey} {...axisStyle} />
          <YAxis {...axisStyle} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ──────────────────────────────────
// LINE CHART
// ──────────────────────────────────
interface LineChartProps {
  data: Record<string, unknown>[]
  lines: Array<{ dataKey: string; color?: string; name?: string }>
  xKey?: string
  height?: number
  showGrid?: boolean
  className?: string
}

export function ChartLine({
  data,
  lines,
  xKey = 'name',
  height = 300,
  showGrid = true,
  className,
}: LineChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1C1C27" />}
          <XAxis dataKey={xKey} {...axisStyle} />
          <YAxis {...axisStyle} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12, color: '#94A3B8' }} />
          {lines.map((line, i) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={line.color || CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ──────────────────────────────────
// AREA CHART
// ──────────────────────────────────
interface AreaChartProps {
  data: Record<string, unknown>[]
  dataKey: string
  xKey?: string
  color?: string
  height?: number
  showGrid?: boolean
  className?: string
}

export function ChartArea({
  data,
  dataKey,
  xKey = 'name',
  color = CHART_COLORS[0],
  height = 300,
  showGrid = true,
  className,
}: AreaChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1C1C27" />}
          <XAxis dataKey={xKey} {...axisStyle} />
          <YAxis {...axisStyle} />
          <Tooltip {...tooltipStyle} />
          <defs>
            <linearGradient id={`areaGrad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#areaGrad-${dataKey})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ──────────────────────────────────
// DONUT CHART
// ──────────────────────────────────
interface DonutChartProps {
  data: Array<{ name: string; value: number; color?: string }>
  height?: number
  innerRadius?: number
  outerRadius?: number
  className?: string
}

export function ChartDonut({
  data,
  height = 250,
  innerRadius = 60,
  outerRadius = 90,
  className,
}: DonutChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend
            wrapperStyle={{ paddingTop: 12, fontSize: 12, color: '#94A3B8' }}
            formatter={(value) => <span style={{ color: '#F1F5F9' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
