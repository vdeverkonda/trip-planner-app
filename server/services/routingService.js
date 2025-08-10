const axios = require('axios');

/**
 * RoutingService computes route details using Google Routes API (preferred)
 * with a fallback to the Directions API when Routes is unavailable.
 */
class RoutingService {
  constructor() {
    // Independent keys per Google service for resilience
    this.routesApiKey = process.env.GOOGLE_ROUTES_API_KEY
      || process.env.GOOGLE_MAPS_API_KEY
      || process.env.GOOGLE_PLACES_API_KEY;
    this.directionsApiKey = process.env.GOOGLE_DIRECTIONS_API_KEY
      || process.env.GOOGLE_MAPS_API_KEY
      || process.env.GOOGLE_PLACES_API_KEY;
    this.distanceMatrixApiKey = process.env.GOOGLE_DISTANCE_MATRIX_API_KEY
      || process.env.GOOGLE_DIRECTIONS_API_KEY
      || process.env.GOOGLE_MAPS_API_KEY
      || process.env.GOOGLE_PLACES_API_KEY;

    this.routesApiUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    this.directionsUrl = 'https://maps.googleapis.com/maps/api/directions/json';
    this.distanceMatrixUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';

    // Shared axios config with sane timeouts
    this.http = axios.create({ timeout: 8000 });
  }

  buildGoogleMapsUrl(origin, destination, avoidTolls) {
    const params = new URLSearchParams({
      api: '1',
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      travelmode: 'driving',
    });
    if (avoidTolls) params.append('avoid', 'tolls');
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  computeAvgSpeedKph(distanceMeters, durationSeconds) {
    if (!distanceMeters || !durationSeconds) return null;
    const kph = (distanceMeters / durationSeconds) * 3.6;
    return Math.round(kph * 10) / 10;
  }

  async computeRouteWithRoutesAPI({ origin, destination, avoidTolls }) {
    if (!this.routesApiKey) {
      throw new Error('Missing Google API key');
    }

    const body = {
      origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
      destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: !!avoidTolls,
      },
      departureTime: { seconds: Math.floor(Date.now() / 1000) },
      // Request toll computation explicitly
      extraComputations: ['TOLLS'],
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.routesApiKey,
      'X-Goog-FieldMask': [
        'routes.distanceMeters',
        'routes.duration',
        'routes.polyline.encodedPolyline',
        'routes.travelAdvisory.tollInfo',
        'routes.travelAdvisory.tollInfo.estimatedPrice',
        'routes.travelAdvisory.speedReadingIntervals',
      ].join(','),
    };

    const res = await this.http.post(this.routesApiUrl, body, { headers });
    const route = res.data?.routes?.[0];
    if (!route) throw new Error('No route returned');

    const distanceMeters = route.distanceMeters || null;
    const durationSecs = route.duration ? parseInt(String(route.duration).replace('s', ''), 10) : null;
    const polyline = route.polyline?.encodedPolyline || null;

    // Toll info (Routes API provides tollInfo with estimatedPrice in some regions)
    let hasTolls = false;
    let tollCostUSD = null;
    let tollPrice = null;
    const tollInfo = route.travelAdvisory?.tollInfo;
    if (tollInfo && Array.isArray(tollInfo.estimatedPrice) && tollInfo.estimatedPrice.length > 0) {
      const price = tollInfo.estimatedPrice[0];
      if (price && (price.units != null || price.nanos != null)) {
        const amount = (Number(price.units || 0)) + ((price.nanos || 0) / 1e9);
        const currency = price.currencyCode || 'USD';
        tollPrice = { amount, currency };
        if (currency === 'USD') tollCostUSD = amount;
        hasTolls = true;
      }
    }

    // Traffic summary (very coarse from speedReadingIntervals length)
    const speedIntervals = route.travelAdvisory?.speedReadingIntervals || [];
    const trafficSummary = speedIntervals.length > 0 ? 'Traffic considered' : 'Typical traffic';

    return {
      source: 'routes',
      distanceMeters,
      durationSecs,
      durationInTrafficSecs: durationSecs,
      avgSpeedKph: this.computeAvgSpeedKph(distanceMeters, durationSecs),
      hasTolls,
      tollCostUSD,
      tollPrice,
      polyline,
      trafficSummary,
      googleMapsUrl: this.buildGoogleMapsUrl(origin, destination, avoidTolls),
    };
  }

  async computeRouteWithDirectionsAPI({ origin, destination, avoidTolls }) {
    if (!this.directionsApiKey) {
      throw new Error('Missing Google API key');
    }

    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: 'driving',
      departure_time: 'now',
      traffic_model: 'best_guess',
      key: this.directionsApiKey,
    };
    if (avoidTolls) params.avoid = 'tolls';

    const res = await this.http.get(this.directionsUrl, { params });
    const route = res.data?.routes?.[0];
    const leg = route?.legs?.[0];
    if (!route || !leg) throw new Error('No route returned');

    const distanceMeters = leg.distance?.value || null;
    const durationSecs = leg.duration_in_traffic?.value || leg.duration?.value || null;
    const polyline = route.overview_polyline?.points || null;

    // Directions API does not provide toll cost; detect toll presence from warnings when available
    const warnings = route.warnings || [];
    const hasTolls = warnings.some((w) => /toll/i.test(w));

    return {
      source: 'directions',
      distanceMeters,
      durationSecs,
      durationInTrafficSecs: durationSecs,
      avgSpeedKph: this.computeAvgSpeedKph(distanceMeters, durationSecs),
      hasTolls,
      tollCostUSD: null,
      polyline,
      trafficSummary: 'Traffic considered',
      googleMapsUrl: this.buildGoogleMapsUrl(origin, destination, avoidTolls),
    };
  }

  async computeRouteWithDistanceMatrix({ origin, destination, avoidTolls }) {
    if (!this.distanceMatrixApiKey) {
      throw new Error('Missing Google API key');
    }

    const params = {
      origins: `${origin.lat},${origin.lng}`,
      destinations: `${destination.lat},${destination.lng}`,
      mode: 'driving',
      departure_time: 'now',
      traffic_model: 'best_guess',
      key: this.distanceMatrixApiKey,
    };
    // Distance Matrix does not support avoid tolls directly; still useful as a last resort

    const res = await this.http.get(this.distanceMatrixUrl, { params });
    const elem = res.data?.rows?.[0]?.elements?.[0];
    if (!elem || elem.status !== 'OK') throw new Error('No matrix result');

    const distanceMeters = elem.distance?.value || null;
    const durationSecs = elem.duration_in_traffic?.value || elem.duration?.value || null;

    return {
      source: 'distance-matrix',
      distanceMeters,
      durationSecs,
      durationInTrafficSecs: durationSecs,
      avgSpeedKph: this.computeAvgSpeedKph(distanceMeters, durationSecs),
      hasTolls: false,
      tollCostUSD: null,
      polyline: null,
      trafficSummary: 'Traffic considered',
      googleMapsUrl: this.buildGoogleMapsUrl(origin, destination, avoidTolls),
    };
  }

  async getRouteSummary({ startLocation, destination, avoidTolls = false }) {
    const origin = {
      lat: startLocation.coordinates.lat,
      lng: startLocation.coordinates.lng,
    };
    const dest = {
      lat: destination.coordinates.lat,
      lng: destination.coordinates.lng,
    };

    // Try Routes API, fall back to Directions API, then Distance Matrix
    try {
      return await this.computeRouteWithRoutesAPI({ origin, destination: dest, avoidTolls });
    } catch (e) {
      try {
        return await this.computeRouteWithDirectionsAPI({ origin, destination: dest, avoidTolls });
      } catch (err) {
        try {
          return await this.computeRouteWithDistanceMatrix({ origin, destination: dest, avoidTolls });
        } catch (err2) {
          throw new Error(`Failed to compute route: ${err2.message}`);
        }
      }
    }
  }
}

module.exports = new RoutingService();


