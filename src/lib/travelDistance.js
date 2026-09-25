import { ORIGIN_ZIP } from '../data/pricing';

const METERS_PER_MILE = 1609.344;
const geoCache = new Map();
const routeCache = new Map();

const fail = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

async function geocodeZip(zip) {
  if (geoCache.has(zip)) return geoCache.get(zip);

  let response;
  try {
    response = await fetch(`https://api.zippopotam.us/us/${zip}`);
  } catch {
    throw fail('NETWORK', 'Distance lookup failed. Check your connection and try again.');
  }

  if (response.status === 404) {
    throw fail('NOT_FOUND', "We couldn't find that ZIP code.");
  }
  if (!response.ok) {
    throw fail('NETWORK', 'Distance lookup failed. Check your connection and try again.');
  }

  const data = await response.json();
  const place = data.places?.[0];
  if (!place) throw fail('NOT_FOUND', "We couldn't find that ZIP code.");

  const location = {
    lat: Number(place.latitude),
    lon: Number(place.longitude),
    label: `${place['place name']}, ${place['state abbreviation']}`,
  };
  geoCache.set(zip, location);
  return location;
}

function haversineMiles(origin, destination) {
  const earthMiles = 3958.8;
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRad(destination.lat - origin.lat);
  const dLon = toRad(destination.lon - origin.lon);
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(destination.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthMiles * Math.asin(Math.sqrt(h));
}

async function drivingMiles(origin, destination) {
  const key = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
  if (routeCache.has(key)) return routeCache.get(key);

  const url = `https://router.project-osrm.org/route/v1/driving/${key}?overview=false`;
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw fail('ROUTE', 'Driving directions were unavailable.');
  }
  if (!response.ok) throw fail('ROUTE', 'Driving directions were unavailable.');

  const data = await response.json();
  const meters = data.routes?.[0]?.distance;
  if (typeof meters !== 'number') throw fail('ROUTE', 'Driving directions were unavailable.');

  const miles = meters / METERS_PER_MILE;
  routeCache.set(key, miles);
  return miles;
}

// One-way driving miles from 77070. Falls back to a road-adjusted straight line
// when routing is unavailable, and says so.
export async function milesFromOrigin(zip) {
  const origin = await geocodeZip(ORIGIN_ZIP);
  const destination = await geocodeZip(zip);

  try {
    const oneWayMiles = await drivingMiles(origin, destination);
    return { oneWayMiles, approximate: false, label: destination.label };
  } catch (error) {
    if (error.code !== 'ROUTE') throw error;
    return {
      oneWayMiles: haversineMiles(origin, destination) * 1.3,
      approximate: true,
      label: destination.label,
    };
  }
}
