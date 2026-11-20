import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { WeatherIconComponent } from '../weather-icon/weather-icon.component';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule, WeatherIconComponent],
  template: `
    @if (state.weatherData(); as data) {
      <div class="relative overflow-hidden rounded-3xl bg-slate-900/50 hover:bg-slate-900/60 transition-all duration-300 border border-white/15 p-5 sm:p-8 lg:p-10 backdrop-blur-2xl shadow-2xl shadow-black/30">
        
        <!-- Ambient Background Glow Inside Hero -->
        <div class="absolute -top-20 -left-20 w-64 h-64 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
          
          <!-- Left side: Location, Time, Favorite -->
          <div class="flex-1 space-y-2.5 sm:space-y-3 w-full">
            <div class="flex items-center justify-between sm:justify-start gap-2">
              <div class="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] sm:text-xs font-medium text-slate-300 backdrop-blur-md">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{{ formattedDate() }}</span>
                <span class="text-slate-500">•</span>
                <span>{{ formattedTime() }}</span>
              </div>

              <!-- Favorite Star Button -->
              <button (click)="toggleFav(data.location)"
                      [title]="state.isFavorite(data.location) ? state.translationService.t().removeFavorite : state.translationService.t().addFavorite"
                      class="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 border border-white/10 transition-all text-slate-300 touch-manipulation">
                <svg class="w-4 h-4 transition-colors"
                     [ngClass]="state.isFavorite(data.location) ? 'text-amber-400 fill-amber-400' : 'text-slate-400 hover:text-amber-300'"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            </div>

            <!-- City Name -->
            <div class="space-y-0.5">
              <h2 class="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span>{{ data.location.name }}</span>
                @if (data.location.isCurrentLocation) {
                  <span class="text-sky-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-500/20 border border-sky-500/30">GPS</span>
                }
              </h2>
              <p class="text-xs sm:text-sm text-slate-300 font-normal truncate">
                {{ data.location.admin1 ? data.location.admin1 + ', ' : '' }}{{ data.location.country }}
              </p>
            </div>

            <!-- Condition Description -->
            <div class="pt-1 flex items-center gap-2">
              <span class="text-lg sm:text-2xl font-bold text-sky-200 capitalize">
                {{ conditionName() }}
              </span>
            </div>

            <!-- Min/Max & Feels Like Badges -->
            <div class="pt-1 flex flex-wrap items-center gap-2">
              <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-200">
                <span class="text-slate-400">{{ state.translationService.t().feelsLike }}:</span>
                <span class="font-bold text-white">{{ state.formatTemp(data.current.apparentTemperature) }}</span>
              </div>

              @if (data.daily.length > 0) {
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-xs">
                  <span class="flex items-center gap-0.5 text-emerald-400 font-bold">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                    </svg>
                    {{ state.formatTemp(data.daily[0].tempMax) }}
                  </span>
                  <span class="text-slate-500">|</span>
                  <span class="flex items-center gap-0.5 text-sky-400 font-bold">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                    {{ state.formatTemp(data.daily[0].tempMin) }}
                  </span>
                </div>
              }
            </div>

          </div>

          <!-- Right side: Big Temperature + Animated Icon -->
          <div class="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 w-full md:w-auto pt-2 md:pt-0 border-t border-white/10 md:border-t-0">
            <div class="relative shrink-0">
              <app-weather-icon [code]="data.current.weatherCode"
                                [isDay]="data.current.isDay"
                                [size]="75"
                                class="sm:scale-125">
              </app-weather-icon>
            </div>
            
            <div class="flex flex-col text-right sm:text-left">
              <div class="text-5xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-sky-200 tracking-tighter leading-none select-none font-mono">
                {{ state.formatTemp(data.current.temperature) }}
              </div>
              <div class="text-[10px] sm:text-xs font-bold text-sky-400 uppercase tracking-widest mt-1">
                {{ data.current.isDay ? 'დღის ამინდი' : 'ღამის ამინდი' }}
              </div>
            </div>
          </div>

        </div>

      </div>
    }
  `
})
export class CurrentWeatherComponent {
  state = inject(StateService);

  readonly conditionName = computed(() => {
    const data = this.state.weatherData();
    if (!data) return '';
    const cond = this.state.translationService.getWeatherCondition(data.current.weatherCode);
    return this.state.translationService.language() === 'ka' ? cond.nameKa : cond.nameEn;
  });

  readonly formattedDate = computed(() => {
    const now = new Date();
    const isKa = this.state.translationService.language() === 'ka';
    const dayNames = isKa 
      ? ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = isKa
      ? ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${dayNames[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
  });

  readonly formattedTime = computed(() => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  });

  toggleFav(location: any): void {
    this.state.toggleFavorite(location);
  }
}
