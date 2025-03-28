import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { IonicModule } from "@ionic/angular"
import { RouterModule } from "@angular/router"

import { ConnectionPage } from "./connection.menu"

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: "",
        component: ConnectionPage,
      },
    ]),
  ],
  declarations: [ConnectionPage],
})
export class ConnectionPageModule {}

