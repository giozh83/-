import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { HourlyItem } from '../../models/weather.model';
import { StateService } from '../../services/state.service';
import { WeatherIconComponent } from '../weather-icon/weather-icon.component';

@Component({
  selector: 'app-hourly-forecast',
  standalone: true,
  imports: [CommonModule, WeatherIconComponent],
  template: `
    @if (state.weatherData(); as data) {
      <section class="rounded-3xl bg-slate-900/55 border border-white/15 p-4 sm:p-6 backdrop-blur-2xl shadow-xl space-y-3.5 sm:space-y-4">
        
        <!-- Header -->
        <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke-width="2" />
              <path d="M12 7v5l3.5 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <h2 class="text-sm sm:text-base font-bold text-white tracking-tight">
              {{ state.translationService.t().hourlyForecast }}
            </h2>
          </div>

          <div class="flex items-center gap-1.5 text-xs text-sky-400 font-semibold shrink-0">
            <span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span>{{ activeDayLabel() }}</span>
          </div>
        </div>

        <!-- Day Selector Pills Row (Today, Tomorrow, Fri, Sat...) -->
        <nav class="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent select-none"
             aria-label="Forecast days">
          @for (day of data.daily; track day.date; let idx = $index) {
            <button type="button"
                    (click)="selectDay(idx)"
                    class="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl text-xs transition-all duration-200 shrink-0 border"
                    [ngClass]="state.selectedDayIndex() === idx
                      ? 'bg-gradient-to-r from-sky-400 to-cyan-500 text-white font-bold border-sky-300 shadow-md shadow-sky-500/30 scale-102'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border-white/10'">
              <span class="font-bold">{{ state.translationService.language() === 'ka' ? day.dayNameKa : day.dayNameEn }}</span>
              <span class="text-[11px] opacity-80 font-normal">{{ day.formattedDate }}</span>
            </button>
          }
        </nav>

        <!-- Hourly Capsules Track (24 hours) -->
        <div #hourlyScroller
             (scroll)="updateScrollProgress()"
             class="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent select-none"
             aria-label="Hourly weather capsules">
          @for (hour of state.currentDayHourly(); track hour.time; let isFirst = $first) {
            <article class="flex flex-col items-center justify-between min-w-[84px] sm:min-w-[94px] py-3.5 sm:py-4 px-2.5 sm:px-3 rounded-2xl border transition-all duration-200 shrink-0 group"
                     [ngClass]="isCurrentHour(hour, isFirst)
                       ? 'bg-sky-500/20 border-sky-400/60 shadow-lg shadow-sky-500/15 ring-1 ring-sky-400/40'
                       : 'bg-slate-800/40 hover:bg-slate-800/70 border-white/10'">
              
              <!-- Time -->
              <time class="text-xs sm:text-sm font-bold tracking-tight"
                    [ngClass]="isCurrentHour(hour, isFirst) ? 'text-sky-300' : 'text-slate-200'">
                {{ hour.displayHour }}
              </time>

              <!-- Weather Icon -->
              <div class="my-2.5 sm:my-3 group-hover:scale-110 transition-transform">
                <app-weather-icon [code]="hour.weatherCode"
                                  [isDay]="hour.isDay"
                                  [size]="36"
                                  class="sm:scale-110">
                </app-weather-icon>
              </div>

              <!-- Temperature -->
              <strong class="text-base sm:text-xl font-extrabold text-white font-mono leading-none">
                {{ state.formatTemp(hour.temperature) }}
              </strong>

              <!-- Rain Percentage Badge -->
              <div class="mt-2.5 sm:mt-3 flex items-center gap-1 text-xs font-bold"
                   [ngClass]="hour.precipitationProbability > 0 ? 'text-sky-400' : 'text-slate-500'">
                <svg class="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2.7 17.7 8.4a8 8 0 1 1-11.4 0L12 2.7Z" />
                </svg>
                <span>{{ hour.precipitationProbability }}%</span>
              </div>

              <!-- Wind Speed -->
              <div class="mt-1 text-[11px] text-slate-400 font-medium">
                {{ state.formatSpeed(hour.windSpeed) }}
              </div>

            </article>
          }
        </div>

        <!-- Scroll Navigation Footer (Arrows & Progress Track) -->
        <div class="flex items-center justify-between gap-3 pt-1 text-slate-400">
          <button type="button"
                  (click)="scrollHours(-1)"
                  [title]="'მარცხნივ'"
                  class="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Visual Scroll Rail -->
          <div class="flex-1 max-w-xs sm:max-w-md h-1 bg-white/10 rounded-full overflow-hidden relative">
            <div class="absolute top-0 bottom-0 bg-sky-400/80 rounded-full transition-all duration-100"
                 [style.left.%]="scrollProgress()"
                 style="width: 30%;">
            </div>
          </div>

          <button type="button"
                  (click)="scrollHours(1)"
                  [title]="'მარჯვნივ'"
                  class="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </section>
    }
  `
})
export class HourlyForecastComponent {
  @ViewChild('hourlyScroller') private hourlyScroller?: ElementRef<HTMLDivElement>;
  readonly state = inject(StateService);
  readonly scrollProgress = signal(0);

  readonly activeDayLabel = computed(() => {
    const data = this.state.weatherData();
    if (!data || data.daily.length === 0) return '';
    const day = data.daily[this.state.selectedDayIndex()] || data.daily[0];
    const dayName = this.state.translationService.language() === 'ka' ? day.dayNameKa : day.dayNameEn;
    return `${dayName} (${day.formattedDate})`;
  });

  selectDay(index: number): void {
    this.state.selectDay(index);
    this.hourlyScroller?.nativeElement.scrollTo({ left: 0, behavior: 'smooth' });
    this.scrollProgress.set(0);
  }

  isCurrentHour(hour: HourlyItem, isFirst: boolean): boolean {
    if (this.state.selectedDayIndex() !== 0) return false;
    return hour.displayHour === 'ახლა' || hour.displayHour === 'Now';
  }

  scrollHours(direction: -1 | 1): void {
    const scroller = this.hourlyScroller?.nativeElement;
    if (!scroller) return;
    scroller.scrollBy({ left: direction * 280, behavior: 'smooth' });
  }

  updateScrollProgress(): void {
    const scroller = this.hourlyScroller?.nativeElement;
    if (!scroller) return;
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    this.scrollProgress.set(maxScroll > 0 ? (scroller.scrollLeft / maxScroll) * 70 : 0);
  }
}
