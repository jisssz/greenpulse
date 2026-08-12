import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const HotspotMap = ({ hotspots = [] }) => {
  const defaultCenter = hotspots.length > 0 && hotspots[0].latitude ? [hotspots[0].latitude, hotspots[0].longitude] : [37.7749, -122.4194];

  return (
    <div className="h-[420px] w-full rounded-2xl overflow-hidden border border-emerald-500/20 shadow-glow-emerald relative z-0 glass-panel">
      <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {hotspots.map((item) => (
          item.latitude && item.longitude ? (
            <Marker key={item.id} position={[item.latitude, item.longitude]}>
              <Popup>
                <div className="p-2 space-y-2 max-w-xs font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-500/20 pb-1.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">{item.reportNumber}</span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 leading-snug">{item.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{item.address}</p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-300">{item.categoryName}</span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
};

export default HotspotMap;
