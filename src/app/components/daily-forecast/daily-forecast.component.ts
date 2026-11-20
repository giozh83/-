import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { WeatherIconComponent } from '../weather-icon/weather-icon.component';
import { DailyItem } from '../../models/weather.model';

@Component({
  selector: 'app-daily-forecast',
  standalone: true,
  imports: [CommonModule, WeatherIconComponent],
  template: `
    @if (state.weatherData(); as data) {
      <div class="rounded-3xl bg-slate-900/45 border border-white/15 p-5 sm:p-6 backdrop-blur-2xl shadow-xl overflow-hidden">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
          <div class="flex items-center gap-2 text-sm sm:text-base font-bold text-white">
            <svg class="w-5 h-5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke-width="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke-width="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke-width="2"/>
            </svg>
            <span>{{ state.translationService.t().dailyForecast }}</span>
          </div>
          <span class="text-[11px] text-slate-400">დააჭირეთ საათობრივად სანახავად</span>
        </div>

        <!-- Daily Rows List (Clickable to switch hourly forecast) -->
        <div class="space-y-2.5">
          @for (day of data.daily; track day.date; let idx = $index) {
            <div (click)="state.selectDay(idx)"
                 class="p-3 rounded-2xl border transition-all duration-200 cursor-pointer group select-none"
                 [ngClass]="state.selectedDayIndex() === idx 
                   ? 'bg-sky-500/20 border-sky-400/60 shadow-lg shadow-sky-500/15 ring-1 ring-sky-400/40' 
                   : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/15'">
              
              <div class="flex items-center justify-between gap-2">
                
                <!-- 1. Day & Date -->
                <div class="flex items-center gap-2.5 min-w-[85px] sm:min-w-[95px] shrink-0">
                  <div class="w-2 h-2 rounded-full shrink-0 transition-colors"
                       [ngClass]="state.selectedDayIndex() === idx ? 'bg-sky-400 ring-2 ring-sky-400/50' : 'bg-slate-500'"></div>
                  <div class="flex flex-col">
                    <span class="text-xs sm:text-sm font-bold transition-colors leading-tight"
                          [ngClass]="state.selectedDayIndex() === idx ? 'text-sky-300' : 'text-white group-hover:text-sky-300'">
                      {{ state.translationService.language() === 'ka' ? day.dayNameKa : day.dayNameEn }}
                    </span>
                    <span class="text-[11px] text-slate-400 leading-tight">
                      {{ day.formattedDate }}
                    </span>
                  </div>
                </div>

                <!-- 2. Weather Icon & Condition -->
                <div class="flex items-center gap-2 min-w-0 flex-1 px-1">
                  <app-weather-icon [code]="day.weatherCode"
                                    [isDay]="true"
                                    [size]="26"
                                    class="shrink-0 group-hover:scale-110 transition-transform">
                  </app-weather-icon>
                  <div class="flex flex-col min-w-0">
                    <span class="text-xs font-medium text-slate-200 truncate" [title]="getConditionName(day.weatherCode)">
                      {{ getConditionName(day.weatherCode) }}
                    </span>
                    @if (day.precipitationProbabilityMax > 0) {
                      <span class="text-[10px] text-sky-400 font-semibold flex items-center gap-1">
                        <svg class="w-2.5 h-2.5 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                        </svg>
                        <span>{{ day.precipitationProbabilityMax }}%</span>
                        @if (day.precipitationSum > 0) {
                          <span class="text-slate-400">({{ day.precipitationSum }}მმ)</span>
                        }
                      </span>
                    }
                  </div>
                </div>

                <!-- 3. Min/Max Temperatures & Range Bar -->
                <div class="flex items-center gap-1.5 shrink-0 pl-1">
                  <!-- Min Temp -->
                  <span class="text-xs font-semibold text-slate-400 w-6 text-right font-mono">
                    {{ state.formatTemp(day.tempMin) }}
                  </span>

                  <!-- Visual range track -->
                  <div class="w-12 sm:w-16 bg-white/10 h-1.5 rounded-full overflow-hidden relative">
                    <div class="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-orange-400"
                         [style.left.%]="getTempLeftPercent(day.tempMin)"
                         [style.width.%]="getTempWidthPercent(day.tempMin, day.tempMax)">
                    </div>
                  </div>

                  <!-- Max Temp -->
                  <span class="text-xs font-bold text-white w-6 text-left font-mono">
                    {{ state.formatTemp(day.tempMax) }}
                  </span>
                </div>

              </div>

            </div>
          }
        </div>

      </div>
    }
  `
})
export class DailyForecastComponent {
  state = inject(StateService);

  readonly minTempWeek = computed(() => {
    const data = this.state.weatherData();
    if (!data || data.daily.length === 0) return 0;
    return Math.min(...data.daily.map(d => d.tempMin));
  });

  readonly maxTempWeek = computed(() => {
    const data = this.state.weatherData();
    if (!data || data.daily.length === 0) return 40;
    return Math.max(...data.daily.map(d => d.tempMax));
  });

  getConditionName(code: number): string {
    const cond = this.state.translationService.getWeatherCondition(code);
    return this.state.translationService.language() === 'ka' ? cond.nameKa : cond.nameEn;
  }

  getTempLeftPercent(min: number): number {
    const totalRange = Math.max(1, this.maxTempWeek() - this.minTempWeek());
    const offset = min - this.minTempWeek();
    return Math.max(0, Math.min(80, (offset / totalRange) * 100));
  }

  getTempWidthPercent(min: number, max: number): number {
    const totalRange = Math.max(1, this.maxTempWeek() - this.minTempWeek());
    const width = ((max - min) / totalRange) * 100;
    return Math.max(15, Math.min(100, width));
  }
}
