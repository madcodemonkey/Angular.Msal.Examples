import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AuthGuard } from './core/guards/auth.guard';
import { SimpsonsComponent } from './components/simpsons/simpsons.component';
import { LogoutComponent } from './components/logout/logout.component';

const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'logout', component: LogoutComponent },
  { path: 'logout/:errorMessage', component: LogoutComponent },
  { path: 'welcome', component: WelcomeComponent, canActivate: [AuthGuard] },
  { path: 'simpsons', component: SimpsonsComponent, canActivate: [AuthGuard] },
  { path: '**', component: WelcomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
