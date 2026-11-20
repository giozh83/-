import { Injectable, inject, signal, computed } from '@angular/core';
import { WeatherService } from './weather.service';
import { GeocodingService, POPULAR_GEORGIAN_CITIES } from './geocoding.service';
import { TranslationService } from './translation.service';
import { LocationItem, WeatherData, TempUnit, Language, HourlyItem } from '../models/weather.model';

const STORAGE_FAVORITES_KEY = 'weather_app_favorites';
const STORAGE_RECENTS_KEY = 'weather_app_recents';
const STORAGE_UNIT_KEY = 'weather_app_unit';
const STORAGE_LAST_LOC_KEY = 'weather_app_last_loc';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private weatherService = inject(WeatherService);
  private geocodingService = inject(GeocodingService);
  public translationService = inject(TranslationService);

  readonly currentLocation = signal<LocationItem>(POPULAR_GEORGIAN_CITIES[0]); // Default to Tbilisi
  readonly weatherData = signal<WeatherData | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isLocating = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly tempUnit = signal<TempUnit>('C');
  readonly favorites = signal<LocationItem[]>([]);
  readonly recentSearches = signal<LocationItem[]>([]);
  readonly selectedDayIndex = signal<number>(0); // 0 = Today, 1 = Tomorrow, 2 = Day 3, etc.

  // Computed properties
  readonly bgType = computed(() => {
    const data = this.weatherData();
    if (!data) return 'clear-day';
    const cur = data.current;
    const cond = this.translationService.getWeatherCondition(cur.weatherCode);

    if (!cur.isDay) {
      if (cond.bgType === 'clear-day') return 'clear-night';
      if (cond.bgType === 'partly-cloudy-day') return 'partly-cloudy-night';
    }
    return cond.bgType;
  });

  readonly currentDayHourly = computed<HourlyItem[]>(() => {
    const data = this.weatherData();
    if (!data || !data.hourlyByDay || data.hourlyByDay.length === 0) return [];
    const idx = this.selectedDayIndex();
    const dayHours = data.hourlyByDay[idx] || data.hourlyByDay[0] || [];

    // If it's today (idx === 0), highlight 'ახლა' for the current hour
    if (idx === 0 && data.current) {
      const curHourStr = data.current.time.slice(11, 13);
      return dayHours.map(h => {
        if (h.time.slice(11, 13) === curHourStr) {
          return { ...h, displayHour: this.translationService.language() === 'ka' ? 'ახლა' : 'Now' };
        }
        return h;
      });
    }

    return dayHours;
  });

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage(): void {
    // Restore Temp Unit
    const savedUnit = localStorage.getItem(STORAGE_UNIT_KEY) as TempUnit;
    if (savedUnit === 'C' || savedUnit === 'F') {
      this.tempUnit.set(savedUnit);
    }

    // Restore Language
    const savedLang = localStorage.getItem('weather_app_lang') as Language;
    if (savedLang === 'ka' || savedLang === 'en') {
      this.translationService.setLanguage(savedLang);
    }

    // Restore Favorites
    try {
      const savedFavs = localStorage.getItem(STORAGE_FAVORITES_KEY);
      if (savedFavs) {
        this.favorites.set(JSON.parse(savedFavs));
      } else {
        this.favorites.set([
          POPULAR_GEORGIAN_CITIES[0], // თბილისი
          POPULAR_GEORGIAN_CITIES[1], // ბათუმი
          POPULAR_GEORGIAN_CITIES[2], // ქუთაისი
        ]);
      }
    } catch {
      this.favorites.set([]);
    }

    // Restore Recents
    try {
      const savedRecents = localStorage.getItem(STORAGE_RECENTS_KEY);
      if (savedRecents) {
        this.recentSearches.set(JSON.parse(savedRecents));
      }
    } catch {
      this.recentSearches.set([]);
    }

    // Restore Last Location or default to Tbilisi
    try {
      const lastLoc = localStorage.getItem(STORAGE_LAST_LOC_KEY);
      if (lastLoc) {
        const parsed = JSON.parse(lastLoc);
        this.loadLocation(parsed);
        return;
      }
    } catch {}

    // Default load
    this.loadLocation(POPULAR_GEORGIAN_CITIES[0]);
  }

  loadLocation(location: LocationItem): void {
    this.currentLocation.set(location);
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.selectedDayIndex.set(0); // Reset to today on new location

    // Save as last location
    try {
      localStorage.setItem(STORAGE_LAST_LOC_KEY, JSON.stringify(location));
      this.addToRecents(location);
    } catch {}

    this.weatherService.getWeatherData(location).subscribe({
      next: (data) => {
        this.weatherData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Weather load error:', err);
        this.errorMessage.set(
          this.translationService.language() === 'ka'
            ? 'ამინდის მონაცემების მიღება ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით.'
            : 'Failed to retrieve weather data. Please try again.'
        );
        this.isLoading.set(false);
      }
    });
  }

  selectDay(index: number): void {
    this.selectedDayIndex.set(index);
  }

  detectCurrentLocation(): void {
    if (!navigator.geolocation) {
      alert(this.translationService.language() === 'ka' 
        ? 'თქვენს ბრაუზერს არ აქვს გეოლოკაციის მხარდაჭერა' 
        : 'Geolocation is not supported by your browser');
      return;
    }

    this.isLocating.set(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        this.geocodingService.reverseGeocode(lat, lon).subscribe({
          next: (loc) => {
            this.isLocating.set(false);
            this.loadLocation(loc);
          },
          error: () => {
            this.isLocating.set(false);
            this.loadLocation({
              id: 'my-gps',
              name: this.translationService.language() === 'ka' ? 'ჩემი ლოკაცია' : 'My Location',
              country: '',
              lat,
              lon,
              isCurrentLocation: true
            });
          }
        });
      },
      (error) => {
        this.isLocating.set(false);
        console.warn('Geolocation error:', error);
        alert(this.translationService.language() === 'ka'
          ? 'ლოკაციაზე წვდომა უარყოფილია ან მიუწვდომელია.'
          : 'Location access denied or unavailable.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  toggleUnit(): void {
    const next: TempUnit = this.tempUnit() === 'C' ? 'F' : 'C';
    this.tempUnit.set(next);
    localStorage.setItem(STORAGE_UNIT_KEY, next);
  }

  formatTemp(celsius: number): string {
    if (this.tempUnit() === 'F') {
      const fahrenheit = Math.round((celsius * 9) / 5 + 32);
      return `${fahrenheit}°`;
    }
    return `${Math.round(celsius)}°`;
  }

  formatSpeed(kmh: number): string {
    if (this.tempUnit() === 'F') {
      const mph = Math.round(kmh * 0.621371);
      return `${mph} mph`;
    }
    return `${Math.round(kmh)} ${this.translationService.language() === 'ka' ? 'კმ/სთ' : 'km/h'}`;
  }

  isFavorite(location: LocationItem): boolean {
    return this.favorites().some(
      (f) => Math.abs(f.lat - location.lat) < 0.05 && Math.abs(f.lon - location.lon) < 0.05
    );
  }

  toggleFavorite(location: LocationItem): void {
    if (this.isFavorite(location)) {
      this.removeFavorite(location);
    } else {
      const updated = [...this.favorites(), location];
      this.favorites.set(updated);
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(updated));
    }
  }

  removeFavorite(location: LocationItem): void {
    const updated = this.favorites().filter(
      (f) => !(Math.abs(f.lat - location.lat) < 0.05 && Math.abs(f.lon - location.lon) < 0.05)
    );
    this.favorites.set(updated);
    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(updated));
  }

  private addToRecents(location: LocationItem): void {
    const currentList = this.recentSearches().filter(
      (r) => !(Math.abs(r.lat - location.lat) < 0.05 && Math.abs(r.lon - location.lon) < 0.05)
    );
    const updated = [location, ...currentList].slice(0, 5);
    this.recentSearches.set(updated);
    localStorage.setItem(STORAGE_RECENTS_KEY, JSON.stringify(updated));
  }

  clearRecents(): void {
    this.recentSearches.set([]);
    localStorage.removeItem(STORAGE_RECENTS_KEY);
  }
}
