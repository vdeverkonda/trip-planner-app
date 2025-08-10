import React, { useMemo } from 'react';
import { Map as MapIcon, ExternalLink, Ban } from 'lucide-react';

// Using Google Maps Embed API for robust, dependency-free embedding

export default function RouteSummary({ startLocation, destination }) {

  const start = useMemo(() => ({
    lat: startLocation?.coordinates?.lat,
    lng: startLocation?.coordinates?.lng,
  }), [startLocation]);

  const end = useMemo(() => ({
    lat: destination?.coordinates?.lat,
    lng: destination?.coordinates?.lng,
  }), [destination]);

  // No backend calls; Google Maps handles route rendering

  // Metrics removed per request (distance/time/traffic)

  const mapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const mapsUrl = useMemo(() => {
    if (!start?.lat || !end?.lat) return '#';
    const params = new URLSearchParams({
      api: '1',
      origin: `${start.lat},${start.lng}`,
      destination: `${end.lat},${end.lng}`,
      travelmode: 'driving',
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }, [start, end]);

  return (
    <div className="card mt-6">
      <div className="card-header">
        <h3 className="card-title flex items-center"><MapIcon className="h-5 w-5 mr-2"/>Route</h3>
        <p className="card-description">Route map powered by Google Maps</p>
      </div>
      <div className="card-content space-y-4">
        <div className="flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn-outline btn-sm flex items-center">
              Open in Google Maps <ExternalLink className="h-3 w-3 ml-1"/>
            </a>
          </div>
        </div>

        <div>
          {mapsApiKey ? (
            <iframe
              title="route-map"
              className="w-full h-64 rounded-lg border"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/directions?key=${mapsApiKey}&origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&mode=driving`}
            />
          ) : (
            <div className="flex items-center text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3">
              <Ban className="h-4 w-4 mr-2"/> Map not available. Set REACT_APP_GOOGLE_MAPS_API_KEY to show the embedded map.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


