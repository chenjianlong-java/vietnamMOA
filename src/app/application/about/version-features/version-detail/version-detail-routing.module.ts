import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {VersionDetailComponent} from './version-detail.component';


const routes: Routes = [
    {path: '', component: VersionDetailComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VersionDetailRoutingModule {
}
