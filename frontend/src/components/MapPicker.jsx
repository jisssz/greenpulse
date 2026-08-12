import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, onLocationSelected }) {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

const MapPicker = ({ latitude, longitude, onLocationChange }) => {
  const [position, setPosition] = useState([latitude || 37.7749, longitude || -122.4194]);
  const [loadingGeo, setLoadingGeo] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleSelectLocation = async (lat, lng) => {
    setPosition([lat, lng]);
    let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        address = data.display_name;
      }
    } catch (e) {
      console.warn('Reverse geocoding unavailable, using coordinates', e);
    }
    onLocationChange({ latitude: lat, longitude: lng, address });
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setLoadingGeo(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoadingGeo(false);
          handleSelectLocation(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          setLoadingGeo(false);
          alert('Could not retrieve device location: ' + err.message);
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-400" /> Click Map to Pin Exact Location
        </label>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={loadingGeo}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/25 px-3 py-1.5 rounded-lg transition-all border border-emerald-500/30 shadow-glow-emerald"
        >
          {loadingGeo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5 text-emerald-400" />}
          Use GPS Location
        </button>
      </div>

      <div className="h-64 w-full rounded-xl overflow-hidden border border-emerald-500/20 shadow-inner relative z-0 glass-panel">
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <LocationMarker position={position} onLocationSelected={handleSelectLocation} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPicker;
