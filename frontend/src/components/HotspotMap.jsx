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

const HotspotMap = ({ hotspots = [], reports = [] }) => {
  // Gracefully handle both properties
  const items = hotspots.length > 0 ? hotspots : reports;
  
  // Default map position: India overview
  const defaultCenter = items.length > 0 && items[0].latitude ? [items[0].latitude, items[0].longitude] : [20.5937, 78.9629];
  const defaultZoom = items.length > 0 && items[0].latitude ? 12 : 5;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xs relative z-0">
      <MapContainer center={defaultCenter} zoom={defaultZoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {items.map((item) => (
          item.latitude && item.longitude ? (
            <Marker key={item.id} position={[item.latitude, item.longitude]}>
              <Popup>
                <div className="p-1 space-y-2 max-w-xs font-sans text-slate-800">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#166534] bg-[#DCFCE7] px-1.5 py-0.5 rounded">
                      {item.reportNumber || `#${item.id}`}
                    </span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-snug">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{item.address || 'Thrissur, Kerala'}</p>
                  <div className="pt-1 flex items-center justify-between border-t border-slate-50">
                    <span className="text-[10px] font-bold text-[#166534]">{item.categoryName || 'Environmental'}</span>
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
