import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { IonicModule } from "@ionic/angular"
import { RouterModule } from "@angular/router"

import { LightControlPage } from "./light-control.page"
import { FilterByPipe } from "../../pipes/filter-by.pipe"

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LightControlPage, FilterByPipe,
    
    RouterModule.forChild([
      {
        path: "",
        component: LightControlPage,
      },
    ]),
  ],
  declarations: [],
})
export class LightControlPageModule {}

