import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnsureModuleLoadedOnceGuard } from './ensure-module-loaded-once.guard';
import { AuthService } from './services/auth.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [AuthService]
})
export class CoreModule extends EnsureModuleLoadedOnceGuard {  // Ensure that CoreModule is only loaded into AppModule

  // Looks for the module in the parent injector to see if it's already been loaded (only want it loaded once)
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    super(parentModule);
  }

 }
