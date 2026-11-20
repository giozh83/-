import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { WeatherIconComponent } from '../weather-icon/weather-icon.component';

@Component({
  selector: 'app-weather-details',
  standalone: true,
  imports: [CommonModule, WeatherIconComponent],
  template: `
    @if (state.weatherData(); as data) {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        
        <!-- 1. Wind & Direction Card -->
        <div class="rounded-3xl bg-slate-900/50 border border-white/15 p-4 sm:p-5 backdrop-blur-2xl shadow-xl flex flex-col justify-between group hover:bg-slate-900/60 transition-all">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <div class="flex items-center gap-1.5 text-sky-400">
              <app-weather-icon [name]="'wind'" [size]="18"></app-weather-icon>
              <span>{{ state.translationService.t().wind }}</span>
            </div>
            <span class="text-slate-300 font-mono text-xs">{{ cardinalDirection() }}</span>
          </div>

          <div class="flex items-center justify-between my-1 sm:my-2">
            <div>
              <div class="text-xl sm:text-3xl font-extrabold text-white font-mono">
                {{ state.formatSpeed(dayMetrics().windSpeed) }}
              </div>
              <div class="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                {{ state.translationService.t().windGusts }}: <span class="text-white font-medium">{{ state.formatSpeed(dayMetrics().windGusts) }}</span>
              </div>
            </div>

            <!-- Compass Needle Graphic -->
            <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative shadow-inner shrink-0">
              <div class="absolute text-[8px] sm:text-[9px] font-bold text-slate-400 top-0.5">N</div>
              <div class="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center transition-transform duration-700 ease-out"
                   [style.transform]="'rotate(' + dayMetrics().windDirection + 'deg)'">
                <svg class="w-5 h-5 sm:w-7 sm:h-7 text-sky-400 fill-sky-400" viewBox="0 0 24 24">
                  <polygon points="12 2 15 11 12 8 9 11 12 2"/>
                  <polygon points="12 22 9 13 12 16 15 13 12 22" class="fill-slate-500 text-slate-500 opacity-60"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Wind scale bar -->
          <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
            <div class="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
                 [style.width.%]="Math.min(100, (dayMetrics().windSpeed / 60) * 100)"></div>
          </div>
        </div>

        <!-- 2. Humidity & Dew Point Card -->
        <div class="rounded-3xl bg-slate-900/50 border border-white/15 p-4 sm:p-5 backdrop-blur-2xl shadow-xl flex flex-col justify-between group hover:bg-slate-900/60 transition-all">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <div class="flex items-center gap-1.5 text-sky-400">
              <app-weather-icon [name]="'droplet'" [size]="18"></app-weather-icon>
              <span>{{ state.translationService.t().humidity }}</span>
            </div>
            <span class="text-xs text-slate-300 font-medium">{{ humidityStatus() }}</span>
          </div>

          <div class="my-1 sm:my-2">
            <div class="text-xl sm:text-3xl font-extrabold text-white font-mono">
              {{ dayMetrics().humidity }}%
            </div>
            <div class="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {{ state.translationService.language() === 'ka' ? 'კომფორტული დონე' : 'Comfort' }}: 
              <span class="text-white font-medium">{{ dayMetrics().humidity >= 40 && dayMetrics().humidity <= 60 ? 'ოპტიმალური' : 'ნორმალური' }}</span>
            </div>
          </div>

          <!-- Humidity Bar -->
          <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
            <div class="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full transition-all duration-500"
                 [style.width.%]="dayMetrics().humidity"></div>
          </div>
        </div>

        <!-- 3. UV Index Card -->
        <div class="rounded-3xl bg-slate-900/50 border border-white/15 p-4 sm:p-5 backdrop-blur-2xl shadow-xl flex flex-col justify-between group hover:bg-slate-900/60 transition-all">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <div class="flex items-center gap-1.5 text-amber-400">
              <app-weather-icon [name]="'uv'" [size]="18"></app-weather-icon>
              <span>{{ state.translationService.t().uvIndex }}</span>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold text-white shadow-sm"
                  [style.backgroundColor]="uvInfo().color">
              {{ uvInfo().label }}
            </span>
          </div>

          <div class="my-1 sm:my-2">
            <div class="text-xl sm:text-3xl font-extrabold text-white font-mono">
              {{ dayMetrics().uvIndex }}
            </div>
            <div class="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {{ state.translationService.language() === 'ka' ? 'მაქსიმუმი დღეს' : 'Max today' }}: 
              <span class="text-white font-medium">{{ selectedDay()?.uvIndexMax || dayMetrics().uvIndex }}</span>
            </div>
          </div>

          <!-- UV Gauge Scale -->
          <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
            <div class="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full transition-all duration-500"
                 [style.width.%]="Math.min(100, (dayMetrics().uvIndex / 11) * 100)"></div>
          </div>
        </div>

        <!-- 4. Sunrise & Sunset Card -->
        <div class="rounded-3xl bg-slate-900/50 border border-white/15 p-4 sm:p-5 backdrop-blur-2xl shadow-xl flex flex-col justify-between group hover:bg-slate-900/60 transition-all">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <div class="flex items-center gap-1.5 text-amber-300">
              <app-weather-icon [name]="'sunrise'" [size]="18"></app-weather-icon>
              <span>{{ state.translationService.t().sunrise }} / {{ state.translationService.t().sunset }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 my-1 sm:my-2">
            <div class="flex items-center gap-2 p-2 rounded-2xl bg-white/5 border border-white/5">
              <app-weather-icon [name]="'sunrise'" [size]="20" class="shrink-0"></app-weather-icon>
              <div>
                <div class="text-[10px] text-slate-400 leading-none">{{ state.translationService.t().sunrise }}</div>
                <div class="text-xs sm:text-sm font-bold text-white mt-1 font-mono">{{ selectedDay()?.sunrise || '06:00' }}</div>
              </div>
            </div>

            <div class="flex items-center gap-2 p-2 rounded-2xl bg-white/5 border border-white/5">
              <app-weather-icon [name]="'sunset'" [size]="20" class="shrink-0"></app-weather-icon>
              <div>
                <div class="text-[10px] text-slate-400 leading-none">{{ state.translationService.t().sunset }}</div>
                <div class="text-xs sm:text-sm font-bold text-white mt-1 font-mono">{{ selectedDay()?.sunset || '20:00' }}</div>
              </div>
            </div>
          </div>

          <div class="text-[10px] sm:text-[11px] text-slate-400 text-center">
            {{ state.translationService.language() === 'ka' ? 'დღის ხანგრძლივობა ~14 სთ' : 'Daylight duration ~14h' }}
          </div>
        </div>

        <!-- 5. Visibility & Pressure Card -->
        <div class="rounded-3xl bg-slate-900/50 border border-white/15 p-4 sm:p-5 backdrop-blur-2xl shadow-xl flex flex-col justify-between group hover:bg-slate-900/60 transition-all">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <div class="flex items-center gap-1.5 text-teal-400">
              <app-weather-icon [name]="'eye'" [size]="18"></app-weather-icon>
              <span>{{ state.translationService.t().visibility }} / {{ state.translationService.t().pressure }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 my-1 sm:my-2">
            <div class="p-2 rounded-2xl bg-white/5 border border-white/5">
              <div class="text-[10px] text-slate-400 leading-none">{{ state.translationService.t().visibility }}</div>
              <div class="text-xs sm:text-sm font-bold text-white mt-1 font-mono">
                {{ dayMetrics().visibility }} {{ state.translationService.language() === 'ka' ? 'კმ' : 'km' }}
              </div>
              <div class="text-[9px] text-emerald-400 mt-0.5">იდეალური</div>
            </div>

            <div class="p-2 rounded-2xl bg-white/5 border border-white/5">
              <div class="text-[10px] text-slate-400 leading-none">{{ state.translationService.t().pressure }}</div>
              <div class="text-xs sm:text-sm font-bold text-white mt-1 font-mono">
                {{ dayMetrics().pressure }} <span class="text-[10px] font-normal text-slate-400">hPa</span>
              </div>
              <div class="text-[9px] text-slate-400 mt-0.5">ნორმალური</div>
            </div>
          </div>

          <div class="text-[10px] sm:text-[11px] text-slate-400">
            {{ state.translationService.language() === 'ka' ? 'სტაბილური ატმოსფერული წნევა' : 'Stable atmospheric pressure' }}
          </div>
        </div>

        <!-- 6. Precipitation Card -->
        <div class="rounded-3xl bg-slate-900/50 border border-white/15 p-4 sm:p-5 backdrop-blur-2xl shadow-xl flex flex-col justify-between group hover:bg-slate-900/60 transition-all">
          <div class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <div class="flex items-center gap-1.5 text-sky-400">
              <app-weather-icon [name]="'rain'" [size]="18"></app-weather-icon>
              <span>{{ state.translationService.t().precipitation }}</span>
            </div>
            <span class="text-[11px] text-sky-400 font-semibold">
              {{ selectedDay()?.precipitationProbabilityMax || 0 }}% {{ state.translationService.language() === 'ka' ? 'ალბათობა' : 'chance' }}
            </span>
          </div>

          <div class="my-1 sm:my-2">
            <div class="text-xl sm:text-3xl font-extrabold text-white font-mono">
              {{ selectedDay()?.precipitationSum || 0 }} <span class="text-xs font-normal text-slate-400">მმ</span>
            </div>
            <div class="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {{ state.translationService.language() === 'ka' ? 'დღის ჯამი' : 'Total today' }}: 
              <span class="text-white font-medium">{{ selectedDay()?.precipitationSum || 0 }} მმ</span>
            </div>
          </div>

          <!-- Precipitation Bar -->
          <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
            <div class="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
                 [style.width.%]="Math.min(100, ((selectedDay()?.precipitationSum || 0) / 10) * 100)"></div>
          </div>
        </div>

      </div>
    }
  `
})
export class WeatherDetailsComponent {
  state = inject(StateService);
  protected readonly Math = Math;

  readonly selectedDay = computed(() => {
    const data = this.state.weatherData();
    return data?.daily[this.state.selectedDayIndex()] || data?.daily[0];
  });

  readonly dayMetrics = computed(() => {
    const data = this.state.weatherData();
    const hours = data?.hourlyByDay[this.state.selectedDayIndex()] || [];
    const average = (values: number[], fallback = 0) =>
      values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : fallback;

    if (!data) {
      return { windSpeed: 0, windGusts: 0, windDirection: 0, humidity: 0, uvIndex: 0, visibility: 0, pressure: 0 };
    }

    const radians = hours.map(hour => hour.windDirection * Math.PI / 180);
    const direction = radians.length
      ? (Math.atan2(
          radians.reduce((sum, angle) => sum + Math.sin(angle), 0),
          radians.reduce((sum, angle) => sum + Math.cos(angle), 0)
        ) * 180 / Math.PI + 360) % 360
      : data.current.windDirection;

    return {
      windSpeed: average(hours.map(hour => hour.windSpeed), data.current.windSpeed),
      windGusts: Math.max(...hours.map(hour => hour.windGusts), data.current.windGusts),
      windDirection: Math.round(direction),
      humidity: average(hours.map(hour => hour.humidity), data.current.relativeHumidity),
      uvIndex: this.selectedDay()?.uvIndexMax ?? data.current.uvIndex,
      visibility: average(hours.map(hour => hour.visibility), data.hourly[0]?.visibility || 10),
      pressure: average(hours.map(hour => hour.surfacePressure), data.current.surfacePressure)
    };
  });

  readonly uvInfo = computed(() => {
    const data = this.state.weatherData();
    const uv = data ? this.dayMetrics().uvIndex : 0;
    return this.state.translationService.getUvRiskLabel(uv);
  });

  readonly humidityStatus = computed(() => {
    const data = this.state.weatherData();
    const isKa = this.state.translationService.language() === 'ka';
    if (!data) return '';
    const h = this.dayMetrics().humidity;
    if (h < 30) return isKa ? 'მშრალი' : 'Dry';
    if (h <= 60) return isKa ? 'ოპტიმალური' : 'Comfortable';
    if (h <= 80) return isKa ? 'ნოტიო' : 'Humid';
    return isKa ? 'ძალიან ნოტიო' : 'Very Humid';
  });

  readonly cardinalDirection = computed(() => {
    const data = this.state.weatherData();
    if (!data) return 'N';
    const deg = this.dayMetrics().windDirection;
    const isKa = this.state.translationService.language() === 'ka';
    
    const directionsKa = ['ჩრდ', 'ჩრდ-აღმ', 'აღმ', 'სამხ-აღმ', 'სამხ', 'სამხ-დას', 'დას', 'ჩრდ-დას'];
    const directionsEn = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return isKa ? directionsKa[index] : directionsEn[index];
  });
}
