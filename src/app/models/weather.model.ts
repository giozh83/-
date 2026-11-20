export interface LocationItem {
  id?: number | string;
  name: string;
  country: string;
  countryCode?: string;
  lat: number;
  lon: number;
  admin1?: string;
  isCurrentLocation?: boolean;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  isDay: boolean;
  precipitation: number;
  weatherCode: number;
  surfacePressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
  time: string;
}

export interface HourlyItem {
  time: string;
  displayHour: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitationProbability: number;
  weatherCode: number;
  surfacePressure: number;
  visibility: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  isDay: boolean;
  uvIndex: number;
}

export interface DailyItem {
  date: string;
  dayNameKa: string;
  dayNameEn: string;
  formattedDate: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentMax: number;
  apparentMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
}

export interface AirQualityData {
  europeanAqi: number;
  usAqi: number;
  pm2_5: number;
  pm10: number;
  co: number;
  no2: number;
  so2: number;
  ozone: number;
  statusKa: string;
  statusEn: string;
  statusColor: string;
  adviceKa: string;
  adviceEn: string;
}

export interface WeatherData {
  location: LocationItem;
  current: CurrentWeather;
  hourly: HourlyItem[];
  hourlyByDay: HourlyItem[][];
  daily: DailyItem[];
  airQuality?: AirQualityData;
  airQualityByDay?: AirQualityData[];
  timezone: string;
  elevation?: number;
}

export type TempUnit = 'C' | 'F';
export type Language = 'ka' | 'en';

export interface WeatherConditionInfo {
  code: number;
  nameKa: string;
  nameEn: string;
  icon: string;
  bgType: 'clear-day' | 'clear-night' | 'partly-cloudy-day' | 'partly-cloudy-night' | 'cloudy' | 'foggy' | 'rainy' | 'heavy-rain' | 'thunderstorm' | 'snowy';
}

export const WMO_WEATHER_MAP: Record<number, WeatherConditionInfo> = {
  0: { code: 0, nameKa: 'მოწმენდილი ცა', nameEn: 'Clear Sky', icon: 'clear', bgType: 'clear-day' },
  1: { code: 1, nameKa: 'უმეტესად მოწმენდილი', nameEn: 'Mainly Clear', icon: 'mostly-clear', bgType: 'clear-day' },
  2: { code: 2, nameKa: 'ნაწილობრივ ღრუბლიანი', nameEn: 'Partly Cloudy', icon: 'partly-cloudy', bgType: 'partly-cloudy-day' },
  3: { code: 3, nameKa: 'მოღრუბლული', nameEn: 'Overcast', icon: 'cloudy', bgType: 'cloudy' },
  45: { code: 45, nameKa: 'ნისლი', nameEn: 'Foggy', icon: 'fog', bgType: 'foggy' },
  48: { code: 48, nameKa: 'ყინულოვანი ნისლი', nameEn: 'Depositing Rime Fog', icon: 'fog', bgType: 'foggy' },
  51: { code: 51, nameKa: 'მსუბუქი ჟინჟღლი', nameEn: 'Light Drizzle', icon: 'drizzle', bgType: 'rainy' },
  53: { code: 53, nameKa: 'ზომიერი ჟინჟღლი', nameEn: 'Moderate Drizzle', icon: 'drizzle', bgType: 'rainy' },
  55: { code: 55, nameKa: 'ძლიერი ჟინჟღლი', nameEn: 'Dense Drizzle', icon: 'drizzle', bgType: 'rainy' },
  56: { code: 56, nameKa: 'მსუბუქი ცივი ჟინჟღლი', nameEn: 'Light Freezing Drizzle', icon: 'snow-rain', bgType: 'snowy' },
  57: { code: 57, nameKa: 'ძლიერი ცივი ჟინჟღლი', nameEn: 'Dense Freezing Drizzle', icon: 'snow-rain', bgType: 'snowy' },
  61: { code: 61, nameKa: 'სუსტი წვიმა', nameEn: 'Slight Rain', icon: 'rain-light', bgType: 'rainy' },
  62: { code: 62, nameKa: 'საშუალო წვიმა', nameEn: 'Moderate Rain', icon: 'rain', bgType: 'rainy' },
  63: { code: 63, nameKa: 'ზომიერი წვიმა', nameEn: 'Moderate Rain', icon: 'rain', bgType: 'rainy' },
  65: { code: 65, nameKa: 'ძლიერი წვიმა', nameEn: 'Heavy Rain', icon: 'rain-heavy', bgType: 'heavy-rain' },
  66: { code: 66, nameKa: 'სუსტი ყინულოვანი წვიმა', nameEn: 'Light Freezing Rain', icon: 'snow-rain', bgType: 'snowy' },
  67: { code: 67, nameKa: 'ძლიერი ყინულოვანი წვიმა', nameEn: 'Heavy Freezing Rain', icon: 'snow-rain', bgType: 'snowy' },
  71: { code: 71, nameKa: 'სუსტი თოვა', nameEn: 'Slight Snow Fall', icon: 'snow-light', bgType: 'snowy' },
  73: { code: 73, nameKa: 'ზომიერი თოვა', nameEn: 'Moderate Snow Fall', icon: 'snow', bgType: 'snowy' },
  75: { code: 75, nameKa: 'ძლიერი თოვა', nameEn: 'Heavy Snow Fall', icon: 'snow-heavy', bgType: 'snowy' },
  77: { code: 77, nameKa: 'თოვლის მარცვლები', nameEn: 'Snow Grains', icon: 'snow', bgType: 'snowy' },
  80: { code: 80, nameKa: 'ხანმოკლე სუსტი წვიმა', nameEn: 'Slight Rain Showers', icon: 'rain-light', bgType: 'rainy' },
  81: { code: 81, nameKa: 'ხანმოკლე ზომიერი წვიმა', nameEn: 'Moderate Rain Showers', icon: 'rain', bgType: 'rainy' },
  82: { code: 82, nameKa: 'თავსხმა წვიმა', nameEn: 'Violent Rain Showers', icon: 'rain-heavy', bgType: 'heavy-rain' },
  85: { code: 85, nameKa: 'ხანმოკლე სუსტი თოვა', nameEn: 'Slight Snow Showers', icon: 'snow-light', bgType: 'snowy' },
  86: { code: 86, nameKa: 'ხანმოკლე ძლიერი თოვა', nameEn: 'Heavy Snow Showers', icon: 'snow-heavy', bgType: 'snowy' },
  95: { code: 95, nameKa: 'ჭექა-ქუხილი', nameEn: 'Thunderstorm', icon: 'thunderstorm', bgType: 'thunderstorm' },
  96: { code: 96, nameKa: 'ჭექა-ქუხილი და სუსტი სეტყვა', nameEn: 'Thunderstorm with Slight Hail', icon: 'thunder-hail', bgType: 'thunderstorm' },
  97: { code: 97, nameKa: 'ჭექა-ქუხილი', nameEn: 'Thunderstorm', icon: 'thunderstorm', bgType: 'thunderstorm' },
  99: { code: 99, nameKa: 'ჭექა-ქუხილი და ძლიერი სეტყვა', nameEn: 'Thunderstorm with Heavy Hail', icon: 'thunder-hail', bgType: 'thunderstorm' },
};
