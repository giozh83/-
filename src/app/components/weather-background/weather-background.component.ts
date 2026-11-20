import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weather-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 -z-50 overflow-hidden transition-all duration-1000 ease-in-out pointer-events-none"
         [ngClass]="bgGradientClass()">
      
      <!-- Ambient Sun Rays / Glow for Day -->
      @if (theme() === 'clear-day' || theme() === 'partly-cloudy-day') {
        <div class="absolute -top-32 -right-32 w-[550px] h-[550px] bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div class="absolute top-10 right-20 w-80 h-80 bg-yellow-300/10 rounded-full blur-2xl animate-spin-slow"></div>
      }

      <!-- Twinkling Stars for Clear Night -->
      @if (theme() === 'clear-night' || theme() === 'partly-cloudy-night') {
        <div class="absolute -top-20 -right-20 w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-3xl"></div>
        <div class="stars-container absolute inset-0">
          @for (star of stars; track $index) {
            <div class="absolute rounded-full bg-white animate-twinkle"
                 [style.top.%]="star.top"
                 [style.left.%]="star.left"
                 [style.width.px]="star.size"
                 [style.height.px]="star.size"
                 [style.opacity]="star.opacity"
                 [style.animation-delay.s]="star.delay"
                 [style.animation-duration.s]="star.duration"></div>
          }
        </div>
      }

      <!-- Floating Clouds for Cloudy -->
      @if (theme() === 'cloudy' || theme() === 'partly-cloudy-day' || theme() === 'partly-cloudy-night') {
        <div class="cloud-1 absolute top-[12%] -left-[20%] w-[600px] h-[180px] bg-white/5 rounded-full blur-2xl animate-cloud-drift"></div>
        <div class="cloud-2 absolute top-[35%] -right-[20%] w-[700px] h-[220px] bg-sky-200/5 rounded-full blur-3xl animate-cloud-drift-reverse"></div>
      }

      <!-- Animated Rain Drops -->
      @if (theme() === 'rainy' || theme() === 'heavy-rain' || theme() === 'thunderstorm') {
        <div class="rain-container absolute inset-0">
          @for (drop of rainDrops; track $index) {
            <div class="absolute bg-gradient-to-b from-transparent to-sky-300/60 rounded-full animate-rain"
                 [style.top.%]="drop.top"
                 [style.left.%]="drop.left"
                 [style.width.px]="drop.width"
                 [style.height.px]="drop.height"
                 [style.animation-delay.s]="drop.delay"
                 [style.animation-duration.s]="drop.duration"></div>
          }
        </div>
      }

      <!-- Thunderstorm Lightning Flash -->
      @if (theme() === 'thunderstorm') {
        <div class="absolute inset-0 bg-blue-100/10 animate-lightning pointer-events-none"></div>
      }

      <!-- Drifting Snowflakes -->
      @if (theme() === 'snowy') {
        <div class="snow-container absolute inset-0">
          @for (flake of snowFlakes; track $index) {
            <div class="absolute bg-white/80 rounded-full blur-[0.5px] animate-snow"
                 [style.top.%]="flake.top"
                 [style.left.%]="flake.left"
                 [style.width.px]="flake.size"
                 [style.height.px]="flake.size"
                 [style.opacity]="flake.opacity"
                 [style.animation-delay.s]="flake.delay"
                 [style.animation-duration.s]="flake.duration"></div>
          }
        </div>
      }

      <!-- Fog Layer -->
      @if (theme() === 'foggy') {
        <div class="absolute inset-0 bg-gradient-to-t from-slate-800/40 via-slate-700/20 to-transparent backdrop-blur-[2px] animate-fog"></div>
      }

      <!-- Noise Texture / Overlay for luxury glass depth -->
      <div class="absolute inset-0 bg-radial-vignette opacity-70"></div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
    .bg-radial-vignette {
      background: radial-gradient(circle at 50% 30%, transparent 40%, rgba(3, 7, 18, 0.6) 100%);
    }
    @keyframes twinkle {
      0%, 100% { opacity: 0.2; transform: scale(0.8); }
      50% { opacity: 0.9; transform: scale(1.3); }
    }
    .animate-twinkle {
      animation: twinkle ease-in-out infinite;
    }
    @keyframes cloudDrift {
      0% { transform: translateX(0); }
      50% { transform: translateX(60px); }
      100% { transform: translateX(0); }
    }
    @keyframes cloudDriftReverse {
      0% { transform: translateX(0); }
      50% { transform: translateX(-70px); }
      100% { transform: translateX(0); }
    }
    .animate-cloud-drift {
      animation: cloudDrift 24s ease-in-out infinite;
    }
    .animate-cloud-drift-reverse {
      animation: cloudDriftReverse 28s ease-in-out infinite;
    }
    @keyframes rainDrop {
      0% { transform: translateY(-40px) skewX(-10deg); opacity: 0; }
      20% { opacity: 0.7; }
      100% { transform: translateY(110vh) skewX(-10deg); opacity: 0.1; }
    }
    .animate-rain {
      animation: rainDrop linear infinite;
    }
    @keyframes snowFall {
      0% { transform: translateY(-20px) translateX(0); opacity: 0; }
      20% { opacity: 0.9; }
      50% { transform: translateY(50vh) translateX(15px); }
      100% { transform: translateY(105vh) translateX(-15px); opacity: 0.2; }
    }
    .animate-snow {
      animation: snowFall linear infinite;
    }
    @keyframes lightningFlash {
      0%, 94%, 98%, 100% { opacity: 0; }
      95%, 97% { opacity: 0.6; }
    }
    .animate-lightning {
      animation: lightningFlash 8s infinite ease-out;
    }
    @keyframes fogMotion {
      0%, 100% { transform: translateY(0); opacity: 0.5; }
      50% { transform: translateY(-15px); opacity: 0.75; }
    }
    .animate-fog {
      animation: fogMotion 16s ease-in-out infinite;
    }
  `]
})
export class WeatherBackgroundComponent {
  theme = input<string>('clear-day');

  readonly stars = Array.from({ length: 45 }, (_, i) => ({
    top: Math.random() * 85,
    left: Math.random() * 98,
    size: Math.random() * 2.5 + 1,
    opacity: Math.random() * 0.7 + 0.3,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2
  }));

  readonly rainDrops = Array.from({ length: 40 }, (_, i) => ({
    top: -20,
    left: Math.random() * 100,
    width: Math.random() * 1.5 + 1,
    height: Math.random() * 25 + 15,
    delay: Math.random() * 2,
    duration: Math.random() * 0.7 + 0.6
  }));

  readonly snowFlakes = Array.from({ length: 40 }, (_, i) => ({
    top: -10,
    left: Math.random() * 100,
    size: Math.random() * 4 + 2,
    opacity: Math.random() * 0.7 + 0.3,
    delay: Math.random() * 6,
    duration: Math.random() * 4 + 4
  }));

  readonly bgGradientClass = computed(() => {
    switch (this.theme()) {
      case 'clear-day':
        return 'bg-gradient-to-b from-sky-600 via-blue-700 to-indigo-950';
      case 'clear-night':
        return 'bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950';
      case 'partly-cloudy-day':
        return 'bg-gradient-to-b from-cyan-600 via-sky-800 to-slate-900';
      case 'partly-cloudy-night':
        return 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950';
      case 'cloudy':
        return 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950';
      case 'foggy':
        return 'bg-gradient-to-b from-slate-600 via-zinc-800 to-stone-900';
      case 'rainy':
        return 'bg-gradient-to-b from-slate-800 via-cyan-950 to-slate-950';
      case 'heavy-rain':
        return 'bg-gradient-to-b from-slate-900 via-blue-950 to-black';
      case 'thunderstorm':
        return 'bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950';
      case 'snowy':
        return 'bg-gradient-to-b from-slate-700 via-sky-900 to-slate-950';
      default:
        return 'bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950';
    }
  });
}
