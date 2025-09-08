import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@phroosta/theme-manager';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Theme Manager Demo');
  protected readonly themeService = inject(ThemeService);
  
  protected readonly themes = this.themeService.getAvailableThemes();
  
  protected onThemeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.themeService.setTheme(target.value);
  }
}
