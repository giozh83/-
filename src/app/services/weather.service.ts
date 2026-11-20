import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { WeatherData, CurrentWeather, HourlyItem, DailyItem, AirQualityData, LocationItem } from '../models/weather.model';

const GEORGIAN_DAYS = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
const ENGLISH_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const GEORGIAN_MONTHS = ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'];

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);

  private readonly FORECAST_API = 'https://api.open-meteo.com/v1/forecast';
  private readonly AIR_QUALITY_API = 'https://air-quality-api.open-meteo.com/v1/air-quality';

  getWeatherData(location: LocationItem): Observable<WeatherData> {
    const params = [
      `latitude=${location.lat}`,
      `longitude=${location.lon}`,
      'current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index',
      'hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day,uv_index',
      'daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
      'timezone=auto'
    ].join('&');

    const forecast$ = this.http.get<any>(`${this.FORECAST_API}?${params}`);
    const airQuality$ = this.getAirQuality(location.lat, location.lon);

    return forkJoin({
      forecast: forecast$,
      airQuality: airQuality$
    }).pipe(
      map(({ forecast, airQuality }) => this.transformWeatherData(location, forecast, airQuality.current, airQuality.byDay))
    );
  }

  getAirQuality(lat: number, lon: number): Observable<{ current?: AirQualityData; byDay: AirQualityData[] }> {
    const params = [
      `latitude=${lat}`,
      `longitude=${lon}`,
      'current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
      'hourly=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
      'forecast_days=7',
      'timezone=auto'
    ].join('&');

    return this.http.get<any>(`${this.AIR_QUALITY_API}?${params}`).pipe(
      map(res => {
        if (!res || !res.current) return { current: undefined, byDay: [] };
        const byDay: AirQualityData[] = [];
        const hourly = res.hourly;
        if (hourly?.time?.length) {
          const average = (values: Array<number | null | undefined>) => {
            const valid = values.filter((value): value is number => typeof value === 'number');
            return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
          };
          for (let start = 0; start < hourly.time.length; start += 24) {
            const slice = (key: string) => (hourly[key] || []).slice(start, start + 24);
            byDay.push(this.toAirQuality({
              european_aqi: average(slice('european_aqi')),
              us_aqi: average(slice('us_aqi')),
              pm10: average(slice('pm10')),
              pm2_5: average(slice('pm2_5')),
              carbon_monoxide: average(slice('carbon_monoxide')),
              nitrogen_dioxide: average(slice('nitrogen_dioxide')),
              sulphur_dioxide: average(slice('sulphur_dioxide')),
              ozone: average(slice('ozone'))
            }));
          }
        }
        return { current: this.toAirQuality(res.current), byDay };
      }),
      catchError(() => of({ current: undefined, byDay: [] }))
    );
  }

  private toAirQuality(c: any): AirQualityData {
        const eAqi = Math.round(c.european_aqi ?? 0);
        const usAqi = Math.round(c.us_aqi ?? 0);

        let statusKa = 'სუფთა ჰაერი';
        let statusEn = 'Good';
        let statusColor = '#10b981'; // Green
        let adviceKa = 'ჰაერის ხარისხი იდეალურია გარე აქტივობებისთვის.';
        let adviceEn = 'Air quality is ideal for outdoor activities.';

        if (eAqi > 80 || usAqi > 150) {
          statusKa = 'ძალიან დაბინძურებული';
          statusEn = 'Very Poor';
          statusColor = '#ef4444'; // Red
          adviceKa = 'მოერიდეთ გარეთ ხანგრძლივ ყოფნას.';
          adviceEn = 'Avoid prolonged outdoor exertion.';
        } else if (eAqi > 60 || usAqi > 100) {
          statusKa = 'დაბინძურებული';
          statusEn = 'Poor';
          statusColor = '#f97316'; // Orange
          adviceKa = 'მგრძნობიარე ადამიანებმა უნდა შეამცირონ დატვირთვა.';
          adviceEn = 'Sensitive groups should reduce heavy exertion.';
        } else if (eAqi > 40 || usAqi > 50) {
          statusKa = 'ზომიერი';
          statusEn = 'Moderate';
          statusColor = '#eab308'; // Yellow
          adviceKa = 'ჰაერის ხარისხი მისაღებია ადამიანთა უმეტესობისთვის.';
          adviceEn = 'Air quality is acceptable for most people.';
        }

        return {
          europeanAqi: eAqi,
          usAqi: usAqi,
          pm2_5: Math.round(c.pm2_5 ?? 0),
          pm10: Math.round(c.pm10 ?? 0),
          co: Math.round(c.carbon_monoxide ?? 0),
          no2: Math.round(c.nitrogen_dioxide ?? 0),
          so2: Math.round(c.sulphur_dioxide ?? 0),
          ozone: Math.round(c.ozone ?? 0),
          statusKa,
          statusEn,
          statusColor,
          adviceKa,
          adviceEn
        };
  }

  private transformWeatherData(location: LocationItem, forecast: any, airQuality?: AirQualityData, airQualityByDay: AirQualityData[] = []): WeatherData {
    const cur = forecast.current;
    const current: CurrentWeather = {
      temperature: Math.round(cur.temperature_2m),
      apparentTemperature: Math.round(cur.apparent_temperature),
      relativeHumidity: Math.round(cur.relative_humidity_2m),
      isDay: cur.is_day === 1,
      precipitation: cur.precipitation ?? 0,
      weatherCode: cur.weather_code ?? 0,
      surfacePressure: Math.round(cur.surface_pressure ?? 1013),
      windSpeed: Math.round(cur.wind_speed_10m ?? 0),
      windDirection: Math.round(cur.wind_direction_10m ?? 0),
      windGusts: Math.round(cur.wind_gusts_10m ?? 0),
      uvIndex: Math.round((cur.uv_index ?? 0) * 10) / 10,
      time: cur.time
    };

    // Group 168 hours into 7 days (24 hours per day)
    const hourlyByDay: HourlyItem[][] = [];
    if (forecast.hourly && Array.isArray(forecast.hourly.time)) {
      const totalHours = forecast.hourly.time.length;
      const daysCount = Math.floor(totalHours / 24);

      for (let dayIdx = 0; dayIdx < daysCount; dayIdx++) {
        const dayHours: HourlyItem[] = [];
        const startHourIdx = dayIdx * 24;

        for (let h = 0; h < 24; h++) {
          const idx = startHourIdx + h;
          if (idx >= totalHours) break;

          const timeStr = forecast.hourly.time[idx];
          const dateObj = new Date(timeStr);
          const hours = dateObj.getHours().toString().padStart(2, '0');
          const isFirstHourToday = (dayIdx === 0 && h === 0);
          const displayHour = `${hours}:00`;

          dayHours.push({
            time: timeStr,
            displayHour,
            temperature: Math.round(forecast.hourly.temperature_2m[idx]),
            feelsLike: Math.round(forecast.hourly.apparent_temperature[idx]),
            humidity: Math.round(forecast.hourly.relative_humidity_2m[idx]),
            precipitationProbability: Math.round(forecast.hourly.precipitation_probability[idx] ?? 0),
            weatherCode: forecast.hourly.weather_code[idx] ?? 0,
            surfacePressure: Math.round(forecast.hourly.surface_pressure[idx] ?? 1013),
            visibility: Math.round((forecast.hourly.visibility[idx] ?? 10000) / 1000),
            windSpeed: Math.round(forecast.hourly.wind_speed_10m[idx] ?? 0),
            windDirection: Math.round(forecast.hourly.wind_direction_10m[idx] ?? 0),
            windGusts: Math.round(forecast.hourly.wind_gusts_10m[idx] ?? 0),
            isDay: forecast.hourly.is_day[idx] === 1,
            uvIndex: Math.round((forecast.hourly.uv_index[idx] ?? 0) * 10) / 10,
          });
        }
        hourlyByDay.push(dayHours);
      }
    }

    // Default hourly list starting from current hour
    const hourlyList: HourlyItem[] = hourlyByDay[0] || [];

    // Process 7 daily forecast items
    const dailyList: DailyItem[] = [];
    if (forecast.daily && Array.isArray(forecast.daily.time)) {
      for (let i = 0; i < forecast.daily.time.length; i++) {
        const dateStr = forecast.daily.time[i];
        const dateObj = new Date(dateStr);
        const dayIdx = dateObj.getDay();
        const monthIdx = dateObj.getMonth();
        const dayNum = dateObj.getDate();

        let dayNameKa = GEORGIAN_DAYS[dayIdx];
        let dayNameEn = ENGLISH_DAYS[dayIdx];
        if (i === 0) {
          dayNameKa = 'დღეს';
          dayNameEn = 'Today';
        } else if (i === 1) {
          dayNameKa = 'ხვალ';
          dayNameEn = 'Tomorrow';
        }

        const formattedDate = `${dayNum} ${GEORGIAN_MONTHS[monthIdx]}`;

        dailyList.push({
          date: dateStr,
          dayNameKa,
          dayNameEn,
          formattedDate,
          weatherCode: forecast.daily.weather_code[i] ?? 0,
          tempMax: Math.round(forecast.daily.temperature_2m_max[i]),
          tempMin: Math.round(forecast.daily.temperature_2m_min[i]),
          apparentMax: Math.round(forecast.daily.apparent_temperature_max[i]),
          apparentMin: Math.round(forecast.daily.apparent_temperature_min[i]),
          sunrise: forecast.daily.sunrise[i]?.slice(11, 16) || '06:00',
          sunset: forecast.daily.sunset[i]?.slice(11, 16) || '20:00',
          uvIndexMax: Math.round((forecast.daily.uv_index_max[i] ?? 0) * 10) / 10,
          precipitationSum: Math.round((forecast.daily.precipitation_sum[i] ?? 0) * 10) / 10,
          precipitationProbabilityMax: Math.round(forecast.daily.precipitation_probability_max[i] ?? 0),
          windSpeedMax: Math.round(forecast.daily.wind_speed_10m_max[i] ?? 0)
        });
      }
    }

    return {
      location,
      current,
      hourly: hourlyList,
      hourlyByDay,
      daily: dailyList,
      airQuality,
      airQualityByDay,
      timezone: forecast.timezone || 'UTC',
      elevation: forecast.elevation
    };
  }
}
