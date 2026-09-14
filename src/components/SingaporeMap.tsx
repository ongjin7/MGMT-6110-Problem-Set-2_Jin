import React, { useState } from 'react';
import { BusStopItem, TrainStationItem, TravelMode } from '../types';
import { MapPin, Navigation, Bus, Train, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface SingaporeMapProps {
  originCoords?: [number, number]; // [lat, lng]
  destCoords?: [number, number] | null;
  destName?: string;
  travelMode?: TravelMode;
  routeData?: any;
  nearbyBusStops?: BusStopItem[];
  nearbyTrainStations?: TrainStationItem[];
  selectedBusStopCode?: string | null;
  onSelectBusStop?: (code: string) => void;
  viewMode?: 'route' | 'transit';
  heightClass?: string;
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  originCoords = [1.3966, 103.8886], // OLA EC
  destCoords = null,
  destName = '',
  travelMode = 'pt',
  routeData = null,
  nearbyBusStops = [],
  nearbyTrainStations = [],
  selectedBusStopCode = null,
  onSelectBusStop,
  viewMode = 'route',
  heightClass = 'h-[360px] sm:h-[420px]',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(viewMode === 'transit' ? 2 : 1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState<{ title: string; subtitle: string; x: number; y: number } | null>(null);

  // Singapore geographic coordinate boundaries
  // Lat: 1.22 to 1.47, Lng: 103.60 to 104.04
  const mapBounds = {
    minLat: 1.23,
    maxLat: 1.46,
    minLng: 103.62,
    maxLng: 104.02,
  };

  // Sengkang local bounds for high-detail transit view around OLA EC
  const sengkangBounds = {
    minLat: 1.385,
    maxLat: 1.405,
    minLng: 103.880,
    maxLng: 103.905,
  };

  const isLocalView = viewMode === 'transit' || zoomLevel >= 2;
  const currentBounds = isLocalView ? sengkangBounds : mapBounds;

  // Convert GPS [lat, lng] to SVG viewbox percentage [x, y]
  const coordToSvg = (lat: number, lng: number) => {
    const xPct = ((lng - currentBounds.minLng) / (currentBounds.maxLng - currentBounds.minLng)) * 1000;
    // Invert lat for SVG Y coordinate
    const yPct = ((currentBounds.maxLat - lat) / (currentBounds.maxLat - currentBounds.minLat)) * 600;
    return { x: xPct, y: yPct };
  };

  const originPos = coordToSvg(originCoords[0], originCoords[1]);
  const destPos = destCoords ? coordToSvg(destCoords[0], destCoords[1]) : null;

  // Render curved routing path from OLA to destination
  let routePath = '';
  if (destPos) {
    const dx = destPos.x - originPos.x;
    const dy = destPos.y - originPos.y;
    const cx1 = originPos.x + dx * 0.3 + (dy > 0 ? 30 : -30);
    const cy1 = originPos.y + dy * 0.2;
    const cx2 = originPos.x + dx * 0.7 - (dy > 0 ? 20 : -20);
    const cy2 = originPos.y + dy * 0.8;
    routePath = `M ${originPos.x} ${originPos.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${destPos.x} ${destPos.y}`;
  }

  const modeColors: Record<TravelMode, { stroke: string; label: string }> = {
    pt: { stroke: '#0D9488', label: 'Public Transit' }, // Teal
    drive: { stroke: '#2563EB', label: 'Drive' }, // Blue
    walk: { stroke: '#10B981', label: 'Walking' }, // Green
    cycle: { stroke: '#F59E0B', label: 'Cycling' }, // Amber
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(1, Math.min(3, prev + delta)));
  };

  const handleReset = () => {
    setZoomLevel(viewMode === 'transit' ? 2 : 1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div
      id={`sg-map-container-${viewMode}`}
      className={`relative w-full ${heightClass} bg-slate-900 rounded-2xl overflow-hidden border border-slate-700/60 shadow-inner select-none`}
    >
      {/* Interactive SVG Canvas */}
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoomLevel === 1 ? 1 : zoomLevel === 2 ? 1.4 : 1.9}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0b172a" />
            <stop offset="100%" stopColor="#08101d" />
          </linearGradient>
          <linearGradient id="islandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#172233" />
          </linearGradient>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E25C38" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor={modeColors[travelMode].stroke} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sea Background */}
        <rect width="1000" height="600" fill="url(#waterGrad)" />

        {/* Grid lines */}
        <g stroke="#334155" strokeWidth="0.5" opacity="0.25">
          <line x1="0" y1="150" x2="1000" y2="150" strokeDasharray="4 8" />
          <line x1="0" y1="300" x2="1000" y2="300" strokeDasharray="4 8" />
          <line x1="0" y1="450" x2="1000" y2="450" strokeDasharray="4 8" />
          <line x1="250" y1="0" x2="250" y2="600" strokeDasharray="4 8" />
          <line x1="500" y1="0" x2="500" y2="600" strokeDasharray="4 8" />
          <line x1="750" y1="0" x2="750" y2="600" strokeDasharray="4 8" />
        </g>

        {!isLocalView ? (
          /* Singapore Island Simplified Stylized Boundary Geometry */
          <g id="sg-island-geometry">
            {/* Main Singapore Island */}
            <path
              d="M 170 340 
                 C 150 310, 180 250, 240 220 
                 C 310 180, 390 190, 470 170 
                 C 530 160, 610 150, 710 170 
                 C 790 190, 880 250, 890 310 
                 C 890 360, 830 400, 750 420 
                 C 680 440, 580 440, 480 460 
                 C 380 480, 290 460, 230 430 
                 C 180 400, 180 370, 170 340 Z"
              fill="url(#islandGrad)"
              stroke="#475569"
              strokeWidth="1.5"
            />
            {/* Pulau Ubin */}
            <path
              d="M 740 160 C 760 150, 820 160, 830 175 C 810 185, 750 180, 740 160 Z"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1"
            />
            {/* Sentosa */}
            <path
              d="M 430 490 C 460 485, 500 490, 480 505 C 440 505, 420 495, 430 490 Z"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1"
            />

            {/* Major Arteries / Expressways (TPE, CTE, PIE) */}
            <g stroke="#334155" strokeWidth="1.2" opacity="0.6">
              {/* TPE across north-east through Sengkang */}
              <path d="M 520 180 Q 640 210, 820 270" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" />
              {/* North-East Line corridor (HarbourFront to Punggol) */}
              <path d="M 470 470 Q 560 350, 660 190" stroke="#9333ea" strokeWidth="1.5" opacity="0.4" />
            </g>

            {/* Non-overlapping regional orientation marks */}
            <g opacity="0.75">
              <text x="440" y="145" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">Woodlands</text>
              <text x="290" y="370" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">Jurong</text>
              <text x="810" y="275" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">Changi</text>
              <text x="530" y="445" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">Marina Bay / CBD</text>
            </g>
          </g>
        ) : (
          /* Sengkang & OLA Local Neighborhood Detailed Geometry */
          <g id="sengkang-local-geometry">
            {/* Sungei Punggol / River */}
            <path
              d="M 320 0 C 300 200, 310 380, 300 600"
              stroke="#0284c7"
              strokeWidth="45"
              fill="none"
              opacity="0.35"
            />
            {/* Punggol River Label placed cleanly along river */}
            <text x="325" y="80" fill="#38bdf8" fontSize="10" fontWeight="600" opacity="0.7" transform="rotate(85, 325, 80)">
              Sungei Punggol & PCN
            </text>

            {/* Anchorvale Street */}
            <path d="M 150 280 L 850 280" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            <text x="180" y="272" fill="#94a3b8" fontSize="10" fontWeight="600">Anchorvale St</text>

            {/* Anchorvale Crescent Loop around OLA EC */}
            <path
              d="M 380 280 C 360 210, 410 150, 520 150 C 630 150, 670 210, 640 280"
              stroke="#64748b"
              strokeWidth="5"
              fill="none"
              strokeDasharray="4 2"
            />
            <text x="470" y="142" fill="#cbd5e1" fontSize="10" fontWeight="bold">Anchorvale Cres</text>

            {/* Sengkang East Way to Sengkang MRT */}
            <path d="M 150 440 L 850 440" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            <text x="180" y="432" fill="#94a3b8" fontSize="10" fontWeight="600">Sengkang East Way</text>

            {/* Compassvale Road */}
            <path d="M 720 100 L 720 550" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            <text x="732" y="150" fill="#94a3b8" fontSize="10" fontWeight="600">Compassvale Rd</text>

            {/* Sengkang General Hospital block */}
            <rect x="580" y="310" width="120" height="85" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="640" y="356" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">Sengkang Hospital</text>

            {/* OLA EC Compound Area Boundary (surrounding origin without duplicate overlapping text) */}
            <rect
              x="290"
              y="205"
              width="110"
              height="90"
              rx="10"
              fill="#042f2e"
              fillOpacity="0.45"
              stroke="#0d9488"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text x="345" y="284" textAnchor="middle" fill="#2dd4bf" fontSize="8" fontWeight="600" opacity="0.8">
              OLA RESIDENCE GROUNDS
            </text>
          </g>
        )}

        {/* Route Line (if destination selected) */}
        {destPos && routePath && (
          <g id="map-route-layer">
            {/* Route Outer Halo */}
            <path
              d={routePath}
              fill="none"
              stroke={modeColors[travelMode].stroke}
              strokeWidth="8"
              strokeOpacity="0.25"
              strokeLinecap="round"
            />
            {/* Route Active Line */}
            <path
              d={routePath}
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="8 6"
              className="animate-[dash_20s_linear_infinite]"
            />
          </g>
        )}

        {/* Train Stations (MRT / LRT) in Local View */}
        {isLocalView &&
          nearbyTrainStations.map(stn => {
            const pos = coordToSvg(stn.latitude, stn.longitude);
            const isMRT = stn.type.includes('MRT');

            // Explicit collision-free label positioning
            let cfg: { dx: number; dy: number; anchor: 'start' | 'end' | 'middle'; label: string } = {
              dx: 16,
              dy: -2,
              anchor: 'start',
              label: 'LRT',
            };
            if (stn.code === 'SW1') {
              cfg = { dx: 16, dy: -4, anchor: 'start', label: 'Cheng Lim LRT' };
            } else if (stn.code.includes('NE16') || stn.code.includes('STC')) {
              cfg = { dx: 18, dy: -2, anchor: 'start', label: 'Sengkang MRT' };
            } else if (stn.code === 'SW2') {
              cfg = { dx: -16, dy: -4, anchor: 'end', label: 'Farmway LRT' };
            } else if (stn.code === 'SE1') {
              cfg = { dx: 16, dy: -4, anchor: 'start', label: 'Compassvale LRT' };
            }

            const textWidth = cfg.label.length * 6.5 + 14;
            const rectX = cfg.anchor === 'start' ? cfg.dx - 4 : cfg.anchor === 'end' ? cfg.dx - textWidth + 4 : -textWidth / 2;

            return (
              <g
                key={stn.code}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer group"
                onMouseEnter={() =>
                  setHoveredItem({
                    title: stn.name,
                    subtitle: `${stn.type} (${stn.code}) • ${stn.distanceM}m from OLA`,
                    x: pos.x,
                    y: pos.y,
                  })
                }
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Station Pin */}
                <circle
                  r={isMRT ? 13 : 9}
                  fill={isMRT ? '#9333ea' : '#475569'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                <circle r={isMRT ? 5 : 3.5} fill="#ffffff" />

                {/* Station Label Badge with solid high-contrast backdrop */}
                <g>
                  <rect
                    x={rectX}
                    y={cfg.dy - 11}
                    width={textWidth}
                    height={18}
                    rx={4}
                    fill="#0b1120"
                    fillOpacity="0.95"
                    stroke={isMRT ? '#a855f7' : '#64748b'}
                    strokeWidth="1"
                  />
                  <text
                    x={cfg.anchor === 'start' ? cfg.dx + 3 : cfg.anchor === 'end' ? cfg.dx - 3 : 0}
                    y={cfg.dy + 2}
                    textAnchor={cfg.anchor}
                    fill="#f8fafc"
                    fontSize="9.5"
                    fontWeight="bold"
                  >
                    {cfg.label}
                  </text>
                </g>
              </g>
            );
          })}

        {/* Nearby Bus Stops in Local View */}
        {isLocalView &&
          nearbyBusStops.map(stop => {
            const pos = coordToSvg(stop.latitude, stop.longitude);
            const isSelected = selectedBusStopCode === stop.busStopCode;

            // Intelligent offset for selected stop badge to prevent overlapping adjacent LRT/MRT
            const isNearChengLim = stop.busStopCode === '67429' || stop.busStopCode === '67421';
            const isNearSengkangStn = stop.busStopCode === '67409' || stop.busStopCode === '67009';
            
            const badgeOffset = isNearChengLim
              ? { x: -14, y: 0, anchor: 'end' as const }
              : isNearSengkangStn
              ? { x: -14, y: 0, anchor: 'end' as const }
              : { x: 0, y: -18, anchor: 'middle' as const };

            return (
              <g
                key={stop.busStopCode}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer"
                onClick={() => onSelectBusStop && onSelectBusStop(stop.busStopCode)}
                onMouseEnter={() =>
                  setHoveredItem({
                    title: `${stop.description} (${stop.busStopCode})`,
                    subtitle: `${stop.roadName} • ${stop.distanceM}m away`,
                    x: pos.x,
                    y: pos.y,
                  })
                }
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Selected pulse animation */}
                {isSelected && (
                  <circle r="16" fill="#0d9488" opacity="0.35" className="animate-ping" />
                )}
                <circle
                  r={isSelected ? 10 : 6.5}
                  fill={isSelected ? '#0d9488' : '#334155'}
                  stroke={isSelected ? '#5eead4' : '#94a3b8'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />
                <circle r={isSelected ? 4 : 2.5} fill="#ffffff" />

                {/* Selected Stop Callout with high contrast backdrop */}
                {isSelected && (
                  <g transform={`translate(${badgeOffset.x}, ${badgeOffset.y})`}>
                    <rect
                      x={badgeOffset.anchor === 'end' ? -80 : -40}
                      y="-10"
                      width="80"
                      height="18"
                      rx="4"
                      fill="#042f2e"
                      fillOpacity="0.96"
                      stroke="#14b8a6"
                      strokeWidth="1.2"
                    />
                    <text
                      x={badgeOffset.anchor === 'end' ? -40 : 0}
                      y="3"
                      textAnchor="middle"
                      fill="#5eead4"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      Stop {stop.busStopCode}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

        {/* Destination Marker (if present) */}
        {destPos && (
          <g
            transform={`translate(${destPos.x}, ${destPos.y})`}
            filter="url(#glow)"
            className="cursor-pointer"
          >
            <circle r="14" fill="#ef4444" opacity="0.3" className="animate-pulse" />
            <circle r="8.5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            <circle r="3" fill="#ffffff" />
            
            {/* Offset label if close to OLA origin to eliminate overlap */}
            {(() => {
              const isNearOrigin =
                Math.abs(destPos.x - originPos.x) < 80 &&
                Math.abs(destPos.y - originPos.y) < 55;
              const offsetY = isNearOrigin ? 22 : -22;
              const rawName = destName || 'Destination';
              const label = rawName.length > 22 ? rawName.slice(0, 20) + '…' : rawName;
              const textWidth = Math.max(70, label.length * 6.5 + 16);

              return (
                <g transform={`translate(0, ${offsetY})`}>
                  <rect
                    x={-textWidth / 2}
                    y="-11"
                    width={textWidth}
                    height={20}
                    rx="5"
                    fill="#180b0e"
                    fillOpacity="0.96"
                    stroke="#ef4444"
                    strokeWidth="1.2"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#fca5a5"
                    fontSize="9.5"
                    fontWeight="bold"
                  >
                    {label}
                  </text>
                </g>
              );
            })()}
          </g>
        )}

        {/* Origin Marker: OLA Executive Condominium */}
        <g
          transform={`translate(${originPos.x}, ${originPos.y})`}
          className="cursor-pointer"
          onMouseEnter={() =>
            setHoveredItem({
              title: 'OLA Executive Condominium',
              subtitle: '70 Anchorvale Cres, Singapore 544651',
              x: originPos.x,
              y: originPos.y,
            })
          }
          onMouseLeave={() => setHoveredItem(null)}
        >
          {/* Beacon Waves */}
          <circle r="18" fill="#f59e0b" opacity="0.25" className="animate-ping" />
          <circle r="11" fill="#e25c38" stroke="#ffffff" strokeWidth="2.5" filter="url(#glow)" />
          <circle r="3.5" fill="#ffffff" />
          
          {/* Origin Badge with dark high-contrast backdrop */}
          <g transform="translate(0, -22)">
            <rect
              x="-60"
              y="-11"
              width="120"
              height="20"
              rx="5"
              fill="#1a1426"
              fillOpacity="0.96"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              fill="#fef08a"
              fontSize="9.5"
              fontWeight="bold"
              letterSpacing="0.2"
            >
              OLA EC (Origin)
            </text>
          </g>
        </g>
      </svg>

      {/* Interactive Tooltip Card */}
      {hoveredItem && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900/95 text-white px-3 py-2 rounded-xl text-xs border border-slate-700 shadow-xl backdrop-blur-sm"
          style={{
            left: `${Math.min(75, Math.max(10, (hoveredItem.x / 1000) * 100))}%`,
            top: `${Math.min(70, Math.max(15, (hoveredItem.y / 600) * 100))}%`,
            transform: 'translate(-50%, -120%)',
          }}
        >
          <p className="font-bold text-teal-300">{hoveredItem.title}</p>
          <p className="text-slate-300 text-[11px] mt-0.5">{hoveredItem.subtitle}</p>
        </div>
      )}

      {/* Map Control Buttons */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
        <button
          type="button"
          onClick={() => handleZoom(1)}
          className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg border border-slate-600/80 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(-1)}
          className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg border border-slate-600/80 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg border border-slate-600/80 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
          title="Reset map view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-300/40" />
          <span>OLA EC</span>
        </div>
        {destCoords && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-300/40" />
            <span>Destination</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          <span>Bus Stop</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>MRT / LRT</span>
        </div>
        <div className="text-slate-500 text-[10px] hidden sm:inline">
          {isLocalView ? '• Sengkang Local Detail' : '• Singapore Island View'}
        </div>
      </div>
    </div>
  );
};
