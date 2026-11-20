import { Injectable, signal, computed } from '@angular/core';
import { Language, WMO_WEATHER_MAP, WeatherConditionInfo } from '../models/weather.model';

export interface Translations {
  searchPlaceholder: string;
  myLocation: string;
  favorites: string;
  noFavorites: string;
  addFavorite: string;
  removeFavorite: string;
  feelsLike: string;
  humidity: string;
  wind: string;
  windGusts: string;
  pressure: string;
  visibility: string;
  uvIndex: string;
  sunrise: string;
  sunset: string;
  precipitation: string;
  precipitationChance: string;
  hourlyForecast: string;
  dailyForecast: string;
  airQuality: string;
  now: string;
  today: string;
  tomorrow: string;
  high: string;
  low: string;
  loading: string;
  errorLocation: string;
  tryAgain: string;
  popularCities: string;
  clearHistory: string;
  recentSearches: string;
  uvLow: string;
  uvModerate: string;
  uvHigh: string;
  uvVeryHigh: string;
  uvExtreme: string;
  appTitle: string;
  developedWith: string;
}

const KA_DICT: Translations = {
  searchPlaceholder: 'მოძებნეთ ქალაქი (მაგ: თბილისი, ბათუმი, ლონდონი...)',
  myLocation: 'ჩემი ლოკაცია',
  favorites: 'რჩეული ქალაქები',
  noFavorites: 'რჩეული ქალაქები ჯერ არ გაქვთ',
  addFavorite: 'რჩეულებში დამატება',
  removeFavorite: 'რჩეულებიდან წაშლა',
  feelsLike: 'იგრძნობა როგორც',
  humidity: 'ტენიანობა',
  wind: 'ქარი',
  windGusts: 'დაბერვა',
  pressure: 'წნევა',
  visibility: 'ხილვადობა',
  uvIndex: 'UV ინდექსი',
  sunrise: 'მზის ამოსვლა',
  sunset: 'მზის ჩასვლა',
  precipitation: 'ნალექი',
  precipitationChance: 'ნალექის ალბათობა',
  hourlyForecast: '24-საათიანი საათობრივი პროგნოზი',
  dailyForecast: '7-დღიანი ამინდის პროგნოზი',
  airQuality: 'ჰაერის ხარისხი (AQI)',
  now: 'ახლა',
  today: 'დღეს',
  tomorrow: 'ხვალ',
  high: 'მაქს',
  low: 'მინ',
  loading: 'ამინდის მონაცემები იტვირთება...',
  errorLocation: 'ლოკაციის ამოცნობა ვერ მოხერხდა',
  tryAgain: 'თავიდან ცდა',
  popularCities: 'პოპულარული ქალაქები',
  clearHistory: 'გასუფთავება',
  recentSearches: 'ბოლოს მოძიებული',
  uvLow: 'დაბალი',
  uvModerate: 'ზომიერი',
  uvHigh: 'მაღალი',
  uvVeryHigh: 'ძალიან მაღალი',
  uvExtreme: 'ექსტრემალური',
  appTitle: 'ამინდის პროგნოზი',
  developedWith: 'შექმნილია თანამედროვე Angular-ში'
};

const EN_DICT: Translations = {
  searchPlaceholder: 'Search city (e.g. Tbilisi, London, Tokyo...)',
  myLocation: 'My Location',
  favorites: 'Favorite Cities',
  noFavorites: 'No favorite cities added yet',
  addFavorite: 'Add to Favorites',
  removeFavorite: 'Remove from Favorites',
  feelsLike: 'Feels like',
  humidity: 'Humidity',
  wind: 'Wind',
  windGusts: 'Gusts',
  pressure: 'Pressure',
  visibility: 'Visibility',
  uvIndex: 'UV Index',
  sunrise: 'Sunrise',
  sunset: 'Sunset',
  precipitation: 'Precipitation',
  precipitationChance: 'Precipitation Chance',
  hourlyForecast: '24-Hour Forecast',
  dailyForecast: '7-Day Forecast',
  airQuality: 'Air Quality (AQI)',
  now: 'Now',
  today: 'Today',
  tomorrow: 'Tomorrow',
  high: 'High',
  low: 'Low',
  loading: 'Loading weather data...',
  errorLocation: 'Could not detect location',
  tryAgain: 'Try Again',
  popularCities: 'Popular Cities',
  clearHistory: 'Clear',
  recentSearches: 'Recent Searches',
  uvLow: 'Low',
  uvModerate: 'Moderate',
  uvHigh: 'High',
  uvVeryHigh: 'Very High',
  uvExtreme: 'Extreme',
  appTitle: 'Weather Forecast',
  developedWith: 'Built with Modern Angular'
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  readonly language = signal<Language>('ka');

  readonly t = computed(() => {
    return this.language() === 'ka' ? KA_DICT : EN_DICT;
  });

  setLanguage(lang: Language): void {
    this.language.set(lang);
    localStorage.setItem('weather_app_lang', lang);
  }

  toggleLanguage(): void {
    const next = this.language() === 'ka' ? 'en' : 'ka';
    this.setLanguage(next);
  }

  getWeatherCondition(code: number): WeatherConditionInfo {
    return WMO_WEATHER_MAP[code] || {
      code,
      nameKa: 'უცნობი პირობა',
      nameEn: 'Unknown condition',
      icon: 'clear',
      bgType: 'clear-day'
    };
  }

  getUvRiskLabel(uv: number): { label: string; color: string } {
    const isKa = this.language() === 'ka';
    if (uv <= 2) return { label: isKa ? KA_DICT.uvLow : EN_DICT.uvLow, color: '#10b981' };
    if (uv <= 5) return { label: isKa ? KA_DICT.uvModerate : EN_DICT.uvModerate, color: '#eab308' };
    if (uv <= 7) return { label: isKa ? KA_DICT.uvHigh : EN_DICT.uvHigh, color: '#f97316' };
    if (uv <= 10) return { label: isKa ? KA_DICT.uvVeryHigh : EN_DICT.uvVeryHigh, color: '#ef4444' };
    return { label: isKa ? KA_DICT.uvExtreme : EN_DICT.uvExtreme, color: '#a855f7' };
  }
}
