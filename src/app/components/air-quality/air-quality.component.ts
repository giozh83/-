import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { WeatherIconComponent } from '../weather-icon/weather-icon.component';

@Component({
  selector: 'app-air-quality',
  standalone: true,
  imports: [CommonModule, WeatherIconComponent],
  template: `
    @if (selectedAirQuality(); as aqi) {
      <div class="rounded-3xl bg-slate-900/50 border border-white/15 p-4 sm:p-6 backdrop-blur-2xl shadow-xl space-y-4">
        
        <!-- Header -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 text-sm sm:text-base font-bold text-white">
            <app-weather-icon [name]="'leaf'" [size]="20"></app-weather-icon>
            <span>{{ state.translationService.t().airQuality }}</span>
            <span class="text-[11px] font-medium text-sky-300">· {{ selectedDayLabel() }}</span>
          </div>

          <!-- Status badge with color -->
          <div class="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold text-white shadow-md flex items-center gap-1.5 shrink-0"
               [style.backgroundColor]="aqi.statusColor">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>{{ state.translationService.language() === 'ka' ? aqi.statusKa : aqi.statusEn }}</span>
          </div>
        </div>

        <!-- AQI Score & Health Advice Banner -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-center p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/5">
          <div class="flex items-center gap-3.5">
            <div class="text-3xl sm:text-4xl font-extrabold text-white font-mono">
              {{ aqi.europeanAqi }}
            </div>
            <div class="text-xs text-slate-300">
              <div class="font-bold text-white">European AQI</div>
              <div class="text-slate-400 text-[11px]">US AQI: {{ aqi.usAqi }}</div>
            </div>
          </div>

          <div class="md:col-span-2 text-xs sm:text-sm text-slate-300">
            {{ state.translationService.language() === 'ka' ? aqi.adviceKa : aqi.adviceEn }}
          </div>
        </div>

        <!-- Pollutants Grid -->
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
          
          <!-- PM2.5 -->
          <div class="p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <div class="text-[10px] sm:text-[11px] font-semibold text-slate-400">PM2.5</div>
            <div class="text-sm sm:text-lg font-bold text-white my-0.5 font-mono">{{ aqi.pm2_5 }}</div>
            <div class="text-[9px] text-slate-500">μg/m³</div>
          </div>

          <!-- PM10 -->
          <div class="p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <div class="text-[10px] sm:text-[11px] font-semibold text-slate-400">PM10</div>
            <div class="text-sm sm:text-lg font-bold text-white my-0.5 font-mono">{{ aqi.pm10 }}</div>
            <div class="text-[9px] text-slate-500">μg/m³</div>
          </div>

          <!-- O3 Ozone -->
          <div class="p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <div class="text-[10px] sm:text-[11px] font-semibold text-slate-400">O₃ (ოზონი)</div>
            <div class="text-sm sm:text-lg font-bold text-white my-0.5 font-mono">{{ aqi.ozone }}</div>
            <div class="text-[9px] text-slate-500">μg/m³</div>
          </div>

          <!-- NO2 -->
          <div class="p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <div class="text-[10px] sm:text-[11px] font-semibold text-slate-400">NO₂</div>
            <div class="text-sm sm:text-lg font-bold text-white my-0.5 font-mono">{{ aqi.no2 }}</div>
            <div class="text-[9px] text-slate-500">μg/m³</div>
          </div>

          <!-- SO2 -->
          <div class="p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <div class="text-[10px] sm:text-[11px] font-semibold text-slate-400">SO₂</div>
            <div class="text-sm sm:text-lg font-bold text-white my-0.5 font-mono">{{ aqi.so2 }}</div>
            <div class="text-[9px] text-slate-500">μg/m³</div>
          </div>

          <!-- CO -->
          <div class="p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <div class="text-[10px] sm:text-[11px] font-semibold text-slate-400">CO</div>
            <div class="text-sm sm:text-lg font-bold text-white my-0.5 font-mono">{{ aqi.co }}</div>
            <div class="text-[9px] text-slate-500">μg/m³</div>
          </div>

        </div>

      </div>
    }
  `
})
export class AirQualityComponent {
  state = inject(StateService);

  readonly selectedAirQuality = computed(() => {
    const data = this.state.weatherData();
    if (!data) return undefined;
    return data.airQualityByDay?.[this.state.selectedDayIndex()] || data.airQuality;
  });

  readonly selectedDayLabel = computed(() => {
    const data = this.state.weatherData();
    const day = data?.daily[this.state.selectedDayIndex()];
    if (!day) return '';
    return this.state.translationService.language() === 'ka' ? day.dayNameKa : day.dayNameEn;
  });
}
