import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

// Fix Leaflet marker icon URLs
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
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-brand-600" /> Click Map to Set Location Pin
        </label>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={loadingGeo}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors border border-brand-200"
        >
          {loadingGeo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
          Use Current GPS Location
        </button>
      </div>

      <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onLocationSelected={handleSelectLocation} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPicker;
