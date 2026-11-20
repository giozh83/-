import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weather-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [style.width.px]="size()" [style.height.px]="size()" class="inline-flex items-center justify-center relative select-none">
      @switch (resolvedIcon()) {
        @case ('sun') {
          <!-- Animated Sun -->
          <svg class="w-full h-full text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4" fill="currentColor" fill-opacity="0.2"/>
            <path d="M12 2v2"/>
            <path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/>
            <path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
            <path d="m6.34 17.66-1.41 1.41"/>
            <path d="m19.07 4.93-1.41 1.41"/>
          </svg>
        }
        @case ('moon') {
          <!-- Glowing Moon -->
          <svg class="w-full h-full text-indigo-200 drop-shadow-[0_0_10px_rgba(199,210,254,0.4)] animate-pulse-gentle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fill-opacity="0.25"/>
            <circle cx="18" cy="6" r="1" fill="currentColor"/>
          </svg>
        }
        @case ('partly-cloudy-day') {
          <!-- Sun with Cloud -->
          <svg class="w-full h-full drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path class="text-amber-400" d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M6.34 17.66l-1.41 1.41" />
            <circle class="text-amber-400" cx="12" cy="12" r="3.5" fill="currentColor" fill-opacity="0.3"/>
            <path class="text-sky-100" d="M17.5 19H9a5 5 0 0 1 0-10 6.5 6.5 0 0 1 12 3.5 4.5 4.5 0 0 1-3.5 6.5Z" fill="currentColor" fill-opacity="0.8"/>
          </svg>
        }
        @case ('partly-cloudy-night') {
          <!-- Moon with Cloud -->
          <svg class="w-full h-full drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path class="text-indigo-200" d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fill-opacity="0.3"/>
            <path class="text-slate-200" d="M17.5 19H9a5 5 0 0 1 0-10 6.5 6.5 0 0 1 12 3.5 4.5 4.5 0 0 1-3.5 6.5Z" fill="currentColor" fill-opacity="0.85"/>
          </svg>
        }
        @case ('cloudy') {
          <!-- Overcast Clouds -->
          <svg class="w-full h-full text-slate-300 drop-shadow-md animate-float-gentle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19H9a5 5 0 0 1 0-10 6.5 6.5 0 0 1 12 3.5 4.5 4.5 0 0 1-3.5 6.5Z" fill="currentColor" fill-opacity="0.7"/>
            <path d="M7 16a4 4 0 0 1-3-4 4 4 0 0 1 4-4 5 5 0 0 1 7.5 2" stroke-opacity="0.6"/>
          </svg>
        }
        @case ('rain-light') {
          <!-- Light Rain -->
          <svg class="w-full h-full text-sky-300 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path class="text-slate-300" d="M17.5 16H9a5 5 0 0 1 0-10 6.5 6.5 0 0 1 12 3.5 4.5 4.5 0 0 1-3.5 6.5Z" fill="currentColor" fill-opacity="0.75"/>
            <line class="text-sky-400 animate-rain-drop" x1="10" y1="18" x2="9" y2="21" stroke-width="2.2" />
            <line class="text-sky-400 animate-rain-drop" x1="14" y1="18" x2="13" y2="21" stroke-width="2.2" style="animation-delay: 0.2s" />
          </svg>
        }
        @case ('rain') {
          <!-- Moderate Rain -->
          <svg class="w-full h-full drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path class="text-slate-400" d="M17.5 15H9a5 5 0 0 1 0-10 6.5 6.5 0 0 1 12 3.5 4.5 4.5 0 0 1-3.5 6.5Z" fill="currentColor" fill-opacity="0.8"/>
            <line class="text-sky-400" x1="8" y1="18" x2="7" y2="22" stroke-width="2.2" />
            <line class="text-sky-400" x1="12" y1="18" x2="11" y2="22" stroke-width="2.2" />
            <line class="text-sky-400" x1="16" y1="18" x2="15" y2="22" stroke-width="2.2" />
          </svg>
        }
        @case ('rain-heavy') {
          <!-- Heavy Rain -->
          <svg class="w-full h-full drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path class="text-slate-500" d="M17.5 14H9a5 5 0 0 1 0-10 6.5 6.5 0 0 1 12 3.5 4.5 4.5 0 0 1-3.5 6.5Z" fill="currentColor" fill-opacity="0.85"/>
            <line class="text-blue-400" x1="7" y1="17" x2="5.5" y2="22.5" stroke-width="2.5"/>
            <line class="text-blue-400" x1="11" y1="17" x2="9.5" y2="22.5" stroke-width="2.5"/>
            <line class="text-blue-400" x1="15" y1="17" x2="13.5" y2="22.5" stroke-width="2.5"/>
            <line class="text-blue-400" x1="19" y1="17" x2="17.5" y2="22.5" stroke-width="2.5"/>
          </svg>
        }
        @case ('thunderstorm') {
          <!-- Thunderstorm with Lightning -->
          <svg class="w-full h-full drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path class="text-slate-600" d="M17.5 15H9a5 5 0 0 1 0-10 6.5 6.5 0 0 1 12 3.5 4.5 4.5 0 0 1-3.5 6.5Z" fill="currentColor" fill-opacity="0.9"/>
            <polygon class="text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" points="13 14 10 19 14 19 11 23 18 17 14 17 17 14" fill="currentColor" stroke="none" />
          </svg>
        }
        @case ('snow') {
          <!-- Snow -->
          <svg class="w-full h-full drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path class="text-slate-300" d="M17.5 15H9a5 5 0 0 1 0-10 6.5 6.5 0 0 1 12 3.5 4.5 4.5 0 0 1-3.5 6.5Z" fill="currentColor" fill-opacity="0.8"/>
            <circle class="text-white fill-white" cx="9" cy="19" r="1.5"/>
            <circle class="text-white fill-white" cx="14" cy="19" r="1.5"/>
            <circle class="text-white fill-white" cx="11.5" cy="22" r="1.2"/>
          </svg>
        }
        @case ('fog') {
          <!-- Fog -->
          <svg class="w-full h-full text-slate-300 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 14h16M2 18h20M6 10h12"/>
            <path class="text-slate-400" d="M17 9A5 5 0 0 0 7 9" stroke-dasharray="2 2" />
          </svg>
        }
        @case ('wind') {
          <!-- Wind Icon -->
          <svg class="w-full h-full text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
            <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
            <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
          </svg>
        }
        @case ('droplet') {
          <!-- Humidity Droplet -->
          <svg class="w-full h-full text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor" fill-opacity="0.2"/>
          </svg>
        }
        @case ('uv') {
          <!-- UV Sun Icon -->
          <svg class="w-full h-full text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5" fill="currentColor" fill-opacity="0.2"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        }
        @case ('sunrise') {
          <!-- Sunrise Icon -->
          <svg class="w-full h-full text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v6M4.93 10.93l1.41 1.41M20 18h2M2 18h2M19.07 10.93l-1.41 1.41M22 22H2M8 6l4-4 4 4M16 18a4 4 0 0 0-8 0"/>
          </svg>
        }
        @case ('sunset') {
          <!-- Sunset Icon -->
          <svg class="w-full h-full text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 10V4M4.93 10.93l1.41 1.41M20 18h2M2 18h2M19.07 10.93l-1.41 1.41M22 22H2M8 6l4 4 4-4M16 18a4 4 0 0 0-8 0"/>
          </svg>
        }
        @case ('eye') {
          <!-- Visibility Eye -->
          <svg class="w-full h-full text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.25"/>
          </svg>
        }
        @case ('pressure') {
          <!-- Pressure Gauge -->
          <svg class="w-full h-full text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 12l3-3"/>
            <path d="M12 7v1"/>
            <path d="M7 12h1"/>
            <path d="M17 12h-1"/>
          </svg>
        }
        @case ('leaf') {
          <!-- Leaf / Air Quality -->
          <svg class="w-full h-full text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
        }
        @default {
          <!-- Default Sun/Moon -->
          <svg class="w-full h-full text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
        }
      }
    </div>
  `
})
export class WeatherIconComponent {
  name = input<string>('');
  code = input<number | undefined>(undefined);
  isDay = input<boolean>(true);
  size = input<number>(32);

  readonly resolvedIcon = computed(() => {
    const explicitName = this.name();
    if (explicitName) return explicitName;

    const c = this.code();
    const day = this.isDay();

    if (c === undefined || c === null) {
      return day ? 'sun' : 'moon';
    }

    if (c === 0 || c === 1) {
      return day ? 'sun' : 'moon';
    }
    if (c === 2) {
      return day ? 'partly-cloudy-day' : 'partly-cloudy-night';
    }
    if (c === 3) {
      return 'cloudy';
    }
    if (c === 45 || c === 48) {
      return 'fog';
    }
    if (c >= 51 && c <= 57) {
      return 'rain-light';
    }
    if (c >= 61 && c <= 63 || c === 80 || c === 81) {
      return 'rain';
    }
    if (c === 65 || c === 82) {
      return 'rain-heavy';
    }
    if (c >= 71 && c <= 77 || c === 85 || c === 86 || c === 66 || c === 67) {
      return 'snow';
    }
    if (c >= 95 && c <= 99) {
      return 'thunderstorm';
    }

    return day ? 'sun' : 'moon';
  });
}
