import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { LocationItem } from '../../models/weather.model';

@Component({
  selector: 'app-favorite-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (state.favorites().length > 0) {
      <div class="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        <div class="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent select-none">
          
          <!-- Favorite Star Icon Badge -->
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold shrink-0">
            <svg class="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <span class="hidden sm:inline">{{ state.translationService.t().favorites }}:</span>
          </div>

          <!-- City Pills -->
          @for (fav of state.favorites(); track fav.lat + '_' + fav.lon) {
            <div class="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
                 [ngClass]="isActive(fav) 
                   ? 'bg-sky-500/25 border-sky-400/60 text-white shadow-sky-500/20 ring-1 ring-sky-400/40' 
                   : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/10 text-slate-300 hover:text-white'"
                 (click)="selectCity(fav)">
              <span>{{ fav.name }}</span>
              <button (click)="removeCity($event, fav)"
                      title="წაშლა"
                      class="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded-full transition-opacity ml-0.5">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class FavoriteBarComponent {
  state = inject(StateService);

  isActive(fav: LocationItem): boolean {
    const cur = this.state.currentLocation();
    return Math.abs(cur.lat - fav.lat) < 0.05 && Math.abs(cur.lon - fav.lon) < 0.05;
  }

  selectCity(fav: LocationItem): void {
    this.state.loadLocation(fav);
  }

  removeCity(e: Event, fav: LocationItem): void {
    e.stopPropagation();
    this.state.removeFavorite(fav);
  }
}
