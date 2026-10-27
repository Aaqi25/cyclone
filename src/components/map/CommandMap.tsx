import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CycloneEvent, Shelter } from '../../types/index.ts';
import { Layers, Locate, ShieldAlert, Home, Eye } from 'lucide-react';

interface CommandMapProps {
  cyclones?: CycloneEvent[];
  shelters?: Shelter[];
  selectedCycloneId?: string;
  onSelectShelter?: (shelter: Shelter) => void;
  onSelectCyclone?: (cyclone: CycloneEvent) => void;
  height?: string;
  focusLocation?: { lat: number; lng: number; zoom?: number };
}

export const CommandMap: React.FC<CommandMapProps> = ({
  cyclones = [],
  shelters = [],
  selectedCycloneId,
  onSelectShelter,
  onSelectCyclone,
  height = '500px',
  focusLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{
    cyclones: L.LayerGroup;
    forecast: L.LayerGroup;
    shelters: L.LayerGroup;
    riskZones: L.LayerGroup;
  }>({
    cyclones: L.layerGroup(),
    forecast: L.layerGroup(),
    shelters: L.layerGroup(),
    riskZones: L.layerGroup(),
  });

  const [layersVisible, setLayersVisible] = useState({
    cyclones: true,
    forecast: true,
    shelters: true,
    riskZones: true,
  });

  // Initialize Leaflet map instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center over Bay of Bengal and Eastern/Southern India
    const map = L.map(mapContainerRef.current, {
      center: [18.8, 85.5],
      zoom: 6,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark Matter OpenStreetMap tiles hosted by Carto for high-contrast command center UI
    const tileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    );
    tileLayer.addTo(map);

    // Add layer groups to map
    layerGroupsRef.current.cyclones.addTo(map);
    layerGroupsRef.current.forecast.addTo(map);
    layerGroupsRef.current.shelters.addTo(map);
    layerGroupsRef.current.riskZones.addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update focus position when requested
  useEffect(() => {
    if (mapInstanceRef.current && focusLocation) {
      mapInstanceRef.current.setView(
        [focusLocation.lat, focusLocation.lng],
        focusLocation.zoom || 8,
        { animate: true }
      );
    }
  }, [focusLocation]);

  // Update Cyclone and Forecast layers
  useEffect(() => {
    const { cyclones: cycloneGroup, forecast: forecastGroup } = layerGroupsRef.current;
    cycloneGroup.clearLayers();
    forecastGroup.clearLayers();

    if (!layersVisible.cyclones && !layersVisible.forecast) return;

    cyclones.forEach((cyc) => {
      const isSelected = selectedCycloneId === cyc.id;

      // 1. Cyclone Eye Marker
      if (layersVisible.cyclones) {
        const eyeColor =
          cyc.warningStatus === 'RED ALERT'
            ? '#ef4444'
            : cyc.warningStatus === 'ORANGE WARNING'
            ? '#f97316'
            : '#eab308';

        // Custom HTML marker with radar ring
        const eyeIcon = L.divIcon({
          className: 'custom-cyclone-icon',
          html: `
            <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
              <div class="radar-ring" style="position: absolute; width: 40px; height: 40px; border-radius: 50%; border: 2px solid ${eyeColor};"></div>
              <div style="width: 20px; height: 20px; border-radius: 50%; background: ${eyeColor}; box-shadow: 0 0 16px ${eyeColor}; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff;">
                <div style="width: 6px; height: 6px; border-radius: 50%; background: #030712;"></div>
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const marker = L.marker([cyc.latitude, cyc.longitude], { icon: eyeIcon });
        marker.bindPopup(`
          <div style="min-width: 220px; font-family: system-ui;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 6px;">
              <strong style="color: #38bdf8; font-size: 14px;">Cyclone ${cyc.name}</strong>
              <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${eyeColor}22; color: ${eyeColor}; font-weight: bold; border: 1px solid ${eyeColor}44;">
                ${cyc.warningStatus}
              </span>
            </div>
            <div style="font-size: 12px; color: #cbd5e1; line-height: 1.6;">
              <div><strong>Category:</strong> ${cyc.category}</div>
              <div><strong>Wind Speed:</strong> ${cyc.windSpeedKmph} km/h</div>
              <div><strong>Pressure:</strong> ${cyc.centralPressureHpa} hPa</div>
              <div><strong>Coordinates:</strong> ${cyc.latitude}°N, ${cyc.longitude}°E</div>
              <div><strong>Trajectory:</strong> ${cyc.movementDirection} at ${cyc.movementSpeedKmph} km/h</div>
            </div>
            <div style="margin-top: 8px; font-size: 10px; color: #94a3b8; border-top: 1px dashed #334155; padding-top: 4px;">
              Source: ${cyc.dataSource} | Updated: ${new Date(cyc.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        `);

        if (onSelectCyclone) {
          marker.on('click', () => onSelectCyclone(cyc));
        }

        cycloneGroup.addLayer(marker);

        // Wind radius circle (approx 120km radius of destructive gale force winds)
        const windCircle = L.circle([cyc.latitude, cyc.longitude], {
          radius: 130000,
          color: eyeColor,
          weight: 1.5,
          opacity: 0.6,
          fillColor: eyeColor,
          fillOpacity: 0.08,
          dashArray: '4, 6',
        });
        cycloneGroup.addLayer(windCircle);
      }

      // 2. Projected Track and Forecast Cone
      if (layersVisible.forecast && cyc.forecastTrack && cyc.forecastTrack.length > 0) {
        const trackCoords: L.LatLngExpression[] = [
          [cyc.latitude, cyc.longitude],
          ...cyc.forecastTrack.map((pt) => [pt.latitude, pt.longitude] as [number, number]),
        ];

        // Track Polyline
        const trackLine = L.polyline(trackCoords, {
          color: '#38bdf8',
          weight: 2.5,
          dashArray: '6, 8',
          opacity: 0.85,
        });
        forecastGroup.addLayer(trackLine);

        // Waypoints on forecast track
        cyc.forecastTrack.forEach((pt) => {
          const ptIcon = L.divIcon({
            className: 'custom-forecast-node',
            html: `
              <div style="width: 12px; height: 12px; border-radius: 50%; background: #0284c7; border: 2px solid #ffffff; box-shadow: 0 0 6px #38bdf8;"></div>
            `,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });

          const nodeMarker = L.marker([pt.latitude, pt.longitude], { icon: ptIcon });
          nodeMarker.bindTooltip(
            `+${pt.timeHorizonHours}h: ${pt.estimatedWindSpeedKmph} km/h (${pt.expectedCategory})`,
            { permanent: false, direction: 'top' }
          );
          forecastGroup.addLayer(nodeMarker);
        });
      }
    });
  }, [cyclones, selectedCycloneId, layersVisible.cyclones, layersVisible.forecast, onSelectCyclone]);

  // Update Shelters Layer
  useEffect(() => {
    const shelterGroup = layerGroupsRef.current.shelters;
    shelterGroup.clearLayers();

    if (!layersVisible.shelters) return;

    shelters.forEach((shl) => {
      const statusColor =
        shl.status === 'Full'
          ? '#ef4444' // Red
          : shl.status === 'Near Capacity'
          ? '#eab308' // Yellow
          : shl.status === 'Temporarily Closed'
          ? '#64748b' // Slate
          : '#10b981'; // Green (Operational)

      const occupancyPercent =
        shl.maxCapacity > 0 ? Math.round((shl.currentOccupancy / shl.maxCapacity) * 100) : 0;

      const shelterIcon = L.divIcon({
        className: 'custom-shelter-icon',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 22px; height: 22px; border-radius: 6px; background: #0f172a; border: 2px solid ${statusColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.6);">
              <span style="font-size: 10px; font-weight: 800; color: ${statusColor};">S</span>
            </div>
            <div style="width: 4px; height: 4px; background: ${statusColor}; border-radius: 50%; margin-top: 1px;"></div>
          </div>
        `,
        iconSize: [22, 28],
        iconAnchor: [11, 28],
      });

      const marker = L.marker([shl.latitude, shl.longitude], { icon: shelterIcon });

      marker.bindPopup(`
        <div style="min-width: 240px; font-family: system-ui;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 6px;">
            <strong style="color: #f8fafc; font-size: 13px;">${shl.name}</strong>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${statusColor}22; color: ${statusColor}; font-weight: bold; border: 1px solid ${statusColor}44;">
              ${shl.status}
            </span>
          </div>
          <div style="font-size: 11px; color: #cbd5e1; line-height: 1.6;">
            <div><strong>Code:</strong> ${shl.code} (${shl.district}, ${shl.state})</div>
            <div style="margin: 6px 0;">
              <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
                <span>Occupancy: ${shl.currentOccupancy} / ${shl.maxCapacity}</span>
                <span>${occupancyPercent}%</span>
              </div>
              <div style="height: 6px; background: #1e293b; border-radius: 3px; overflow: hidden; margin-top: 2px;">
                <div style="height: 100%; width: ${Math.min(100, occupancyPercent)}%; background: ${statusColor}; border-radius: 3px;"></div>
              </div>
            </div>
            <div><strong>Available Places:</strong> <span style="color: #38bdf8; font-weight: bold;">${shl.availableCapacity}</span></div>
            <div><strong>Medical Facilities:</strong> ${shl.medicalFacilities}</div>
            <div><strong>Accessibility:</strong> ${shl.accessibilityInfo}</div>
            <div><strong>Emergency Contact:</strong> ${shl.contactPerson} (${shl.contactPhone})</div>
            <div style="display: flex; gap: 8px; margin-top: 4px; font-size: 10px; color: #64748b;">
              <span>Generator: ${shl.hasGenerator ? '✓ Active' : '✗ None'}</span>
              <span>Clean Water: ${shl.hasCleanWaterStorage ? '✓ Active' : '✗ None'}</span>
            </div>
          </div>
        </div>
      `);

      if (onSelectShelter) {
        marker.on('click', () => onSelectShelter(shl));
      }

      shelterGroup.addLayer(marker);
    });
  }, [shelters, layersVisible.shelters, onSelectShelter]);

  // Update Coastal Risk Zones Layer
  useEffect(() => {
    const riskGroup = layerGroupsRef.current.riskZones;
    riskGroup.clearLayers();

    if (!layersVisible.riskZones) return;

    // High risk coastal zone circles around sensitive hubs
    const highRiskZones = [
      { name: 'Ganjam Surge Inundation Zone', lat: 19.32, lng: 84.95, radius: 28000, color: '#ef4444' },
      { name: 'Puri Coastal Threat Envelope', lat: 19.82, lng: 85.85, radius: 32000, color: '#f97316' },
      { name: 'Chilika Estuary Breach Risk Zone', lat: 19.68, lng: 85.35, radius: 24000, color: '#eab308' },
    ];

    highRiskZones.forEach((zone) => {
      const circle = L.circle([zone.lat, zone.lng], {
        radius: zone.radius,
        color: zone.color,
        weight: 1.5,
        opacity: 0.5,
        fillColor: zone.color,
        fillOpacity: 0.12,
      });
      circle.bindTooltip(`Risk Zone: ${zone.name}`, { direction: 'center' });
      riskGroup.addLayer(circle);
    });
  }, [layersVisible.riskZones]);

  // Controls
  const toggleLayer = (key: keyof typeof layersVisible) => {
    setLayersVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && cyclones.length > 0) {
      const active = cyclones[0];
      mapInstanceRef.current.setView([active.latitude, active.longitude], 7, { animate: true });
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([18.8, 85.5], 6, { animate: true });
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Layer Controls Floating Panel */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200 pb-1 border-b border-slate-800">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tactical Map Layers</span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={layersVisible.cyclones}
            onChange={() => toggleLayer('cyclones')}
            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
          />
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            Cyclone Eye & Winds
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={layersVisible.forecast}
            onChange={() => toggleLayer('forecast')}
            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
          />
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span>
            Projected Track Path
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={layersVisible.shelters}
            onChange={() => toggleLayer('shelters')}
            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
          />
          <span className="flex items-center gap-1.5">
            <Home className="w-3 h-3 text-emerald-400 inline" />
            Evacuation Shelters
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={layersVisible.riskZones}
            onChange={() => toggleLayer('riskZones')}
            className="rounded border-slate-700 text-cyan-500 focus:ring-0"
          />
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3 text-amber-400 inline" />
            Surge Threat Zones
          </span>
        </label>

        <div className="pt-1.5 mt-0.5 border-t border-slate-800 flex justify-between gap-2">
          <button
            onClick={handleRecenter}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 text-[11px] transition-colors"
          >
            <Locate className="w-3 h-3 text-cyan-400" />
            Recenter
          </button>
        </div>
      </div>

      {/* Map Legend Bar */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-md px-3 py-1.5 text-[11px] text-slate-300 flex items-center gap-4 shadow-lg pointer-events-none">
        <span className="font-medium text-slate-400">Shelters:</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Operational
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span> &ge;85% Occupied
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> 100% Full
        </span>
        <span className="border-l border-slate-700 pl-2 text-slate-400">
          OpenStreetMap / Carto Dark Engine
        </span>
      </div>
    </div>
  );
};
