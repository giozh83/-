import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, catchError, map } from 'rxjs';
import { LocationItem } from '../models/weather.model';

export const POPULAR_GEORGIAN_CITIES: LocationItem[] = [
  { id: 'geo-1', name: 'თბილისი', country: 'საქართველო', countryCode: 'GE', lat: 41.6938, lon: 44.8015, admin1: 'თბილისი' },
  { id: 'geo-2', name: 'ბათუმი', country: 'საქართველო', countryCode: 'GE', lat: 41.6416, lon: 41.6359, admin1: 'აჭარა' },
  { id: 'geo-3', name: 'ქუთაისი', country: 'საქართველო', countryCode: 'GE', lat: 42.2679, lon: 42.6946, admin1: 'იმერეთი' },
  { id: 'geo-4', name: 'რუსთავი', country: 'საქართველო', countryCode: 'GE', lat: 41.5495, lon: 44.9932, admin1: 'ქვემო ქართლი' },
  { id: 'geo-5', name: 'გორი', country: 'საქართველო', countryCode: 'GE', lat: 41.9842, lon: 44.1158, admin1: 'შიდა ქართლი' },
  { id: 'geo-6', name: 'ზუგდიდი', country: 'საქართველო', countryCode: 'GE', lat: 42.5088, lon: 41.8709, admin1: 'სამეგრელო' },
  { id: 'geo-7', name: 'ფოთი', country: 'საქართველო', countryCode: 'GE', lat: 42.1462, lon: 41.6720, admin1: 'სამეგრელო' },
  { id: 'geo-8', name: 'თელავი', country: 'საქართველო', countryCode: 'GE', lat: 41.9198, lon: 45.4731, admin1: 'კახეთი' },
  { id: 'geo-9', name: 'ახალციხე', country: 'საქართველო', countryCode: 'GE', lat: 41.6390, lon: 42.9826, admin1: 'სამცხე-ჯავახეთი' },
  { id: 'geo-10', name: 'ბორჯომი', country: 'საქართველო', countryCode: 'GE', lat: 41.8399, lon: 43.3799, admin1: 'სამცხე-ჯავახეთი' },
  { id: 'geo-11', name: 'მესტია', country: 'საქართველო', countryCode: 'GE', lat: 43.0458, lon: 42.7278, admin1: 'სვანეთი' },
  { id: 'geo-12', name: 'სტეფანწმინდა (ყაზბეგი)', country: 'საქართველო', countryCode: 'GE', lat: 42.6567, lon: 44.6433, admin1: 'მცხეთა-მთიანეთი' },
  { id: 'geo-13', name: 'სიღნაღი', country: 'საქართველო', countryCode: 'GE', lat: 41.6209, lon: 45.9221, admin1: 'კახეთი' },
  { id: 'geo-14', name: 'ქობულეთი', country: 'საქართველო', countryCode: 'GE', lat: 41.8198, lon: 41.7753, admin1: 'აჭარა' },
  { id: 'geo-15', name: 'ბაკურიანი', country: 'საქართველო', countryCode: 'GE', lat: 41.7497, lon: 43.5328, admin1: 'სამცხე-ჯავახეთი' },
  { id: 'geo-16', name: 'გუდაური', country: 'საქართველო', countryCode: 'GE', lat: 42.4770, lon: 44.4747, admin1: 'მცხეთა-მთიანეთი' },
];

export const POPULAR_WORLD_CITIES: LocationItem[] = [
  { id: 'w-1', name: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lon: -0.1278, admin1: 'England' },
  { id: 'w-2', name: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lon: 2.3522, admin1: 'Île-de-France' },
  { id: 'w-3', name: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lon: -74.0060, admin1: 'New York' },
  { id: 'w-4', name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6762, lon: 139.6503, admin1: 'Tokyo' },
  { id: 'w-5', name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lon: 55.2708, admin1: 'Dubai' },
  { id: 'w-6', name: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.9028, lon: 12.4964, admin1: 'Lazio' },
  { id: 'w-7', name: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.5200, lon: 13.4050, admin1: 'Berlin' },
  { id: 'w-8', name: 'Istanbul', country: 'Turkey', countryCode: 'TR', lat: 41.0082, lon: 28.9784, admin1: 'Istanbul' },
];

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private http = inject(HttpClient);

  private readonly OPEN_METEO_GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

  searchCities(query: string): Observable<LocationItem[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 1) {
      return of(POPULAR_GEORGIAN_CITIES.slice(0, 6));
    }

    const lower = trimmed.toLowerCase();
    
    // Filter local predefined cities first for instantaneous response
    const matchedLocalGeo = POPULAR_GEORGIAN_CITIES.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      (c.admin1 && c.admin1.toLowerCase().includes(lower))
    );

    const matchedLocalWorld = POPULAR_WORLD_CITIES.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      c.country.toLowerCase().includes(lower)
    );

    // If it's a Georgian script query, prioritize Nominatim or transliteration
    const isGeorgianScript = /[\u10A0-\u10FF]/.test(trimmed);

    if (isGeorgianScript) {
      return this.searchNominatim(trimmed).pipe(
        map(apiResults => {
          const combined = [...matchedLocalGeo, ...apiResults];
          return this.deduplicateLocations(combined);
        }),
        catchError(() => of(matchedLocalGeo))
      );
    }

    // For Latin queries, query Open-Meteo Geocoding
    const openMeteo$ = this.http.get<any>(`${this.OPEN_METEO_GEO_URL}?name=${encodeURIComponent(trimmed)}&count=10&language=en&format=json`).pipe(
      map(res => {
        if (!res || !res.results) return [];
        return res.results.map((r: any): LocationItem => ({
          id: r.id,
          name: r.name,
          country: r.country || '',
          countryCode: r.country_code || '',
          lat: r.latitude,
          lon: r.longitude,
          admin1: r.admin1 || ''
        }));
      }),
      catchError(() => of([]))
    );

    return openMeteo$.pipe(
      map(apiResults => {
        const combined = [...matchedLocalGeo, ...matchedLocalWorld, ...apiResults];
        return this.deduplicateLocations(combined);
      })
    );
  }

  searchNominatim(query: string): Observable<LocationItem[]> {
    const url = `${this.NOMINATIM_URL}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8`;
    return this.http.get<any[]>(url).pipe(
      map(results => {
        if (!Array.isArray(results)) return [];
        return results.map((item): LocationItem => {
          const addr = item.address || {};
          const cityName = addr.city || addr.town || addr.village || addr.municipality || item.name || item.display_name.split(',')[0];
          const countryName = addr.country || (addr.country_code === 'ge' ? 'საქართველო' : '');
          const stateOrRegion = addr.state || addr.county || addr.region || '';
          
          return {
            id: item.place_id,
            name: cityName,
            country: countryName,
            countryCode: (addr.country_code || '').toUpperCase(),
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            admin1: stateOrRegion
          };
        });
      }),
      catchError(() => of([]))
    );
  }

  reverseGeocode(lat: number, lon: number): Observable<LocationItem> {
    const url = `${this.NOMINATIM_URL}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    return this.http.get<any>(url).pipe(
      map(item => {
        const addr = item.address || {};
        const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || 'ადგილმდებარეობა';
        const countryName = addr.country || '';
        return {
          id: 'current-gps',
          name: cityName,
          country: countryName,
          countryCode: (addr.country_code || '').toUpperCase(),
          lat: lat,
          lon: lon,
          admin1: addr.state || addr.county || '',
          isCurrentLocation: true
        };
      }),
      catchError(() => {
        return of({
          id: 'current-gps',
          name: 'ჩემი ლოკაცია',
          country: '',
          lat: lat,
          lon: lon,
          isCurrentLocation: true
        });
      })
    );
  }

  private deduplicateLocations(locations: LocationItem[]): LocationItem[] {
    const seen = new Set<string>();
    const result: LocationItem[] = [];

    for (const loc of locations) {
      // Round coordinates to ~10km precision to avoid duplicate markers
      const key = `${loc.name.toLowerCase()}_${loc.lat.toFixed(2)}_${loc.lon.toFixed(2)}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(loc);
      }
    }
    return result.slice(0, 10);
  }
}
