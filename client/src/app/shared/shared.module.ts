import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { DialogService } from 'primeng/dynamicdialog';
import { NotificationService } from './services/notification.services';
import { PermissionService } from './services/permission.service';

/*Primeng Control*/
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SidebarModule } from 'primeng/sidebar';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { EditorModule } from 'primeng/editor';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepsModule } from 'primeng/steps';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TabViewModule } from 'primeng/tabview';
import { GalleriaModule } from 'primeng/galleria';
import { ChipsModule } from 'primeng/chips';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { InputSwitchModule } from 'primeng/inputswitch';
import { GMapModule } from 'primeng/gmap';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PasswordModule } from 'primeng/password';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TreeModule } from 'primeng/tree';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TreeTableModule } from 'primeng/treetable';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChartModule } from 'primeng/chart';
import { TreeSelectModule } from 'primeng/treeselect';
/*End*/

import { DatePipe } from '@angular/common';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MenuComponent } from './components/menu/menu.component';
import { LayoutComponent } from './components/layout/layout.component';
import { ButtonComponent } from './components/button/button.component';
import { TableComponent } from './components/table/table.component';

import { HeaderHomepageComponent } from './components/header-homepage/header-homepage.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    MenuComponent,
    LayoutComponent,
    ButtonComponent,
    TableComponent,
    HeaderHomepageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    DropdownModule,
    AutoCompleteModule,
    SplitButtonModule,
    InputTextModule,
    CalendarModule,
    TableModule,
    MultiSelectModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    ProgressSpinnerModule,
    DynamicDialogModule,
    DialogModule,
    TooltipModule,
    AccordionModule,
    ConfirmDialogModule,
    SidebarModule,
    CheckboxModule,
    PaginatorModule,
    EditorModule,
    RadioButtonModule,
    StepsModule,
    FileUploadModule,
    InputTextareaModule,
    TabViewModule,
    GalleriaModule,
    ChipsModule,
    OrganizationChartModule,
    InputSwitchModule,
    GMapModule,
    PanelMenuModule,
    PasswordModule,
    SelectButtonModule,
    ToggleButtonModule,
    TreeModule,
    OverlayPanelModule,
    TreeTableModule,
    InputNumberModule,
    ChartModule,
    TreeSelectModule
  ],
  providers: [
    NotificationService,
    DialogService,
    DatePipe,
    PermissionService
  ],
  exports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    MenuComponent,
    LayoutComponent,
    DropdownModule,
    AutoCompleteModule,
    SplitButtonModule,
    InputTextModule,
    CalendarModule,
    TableModule,
    MultiSelectModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    ProgressSpinnerModule,
    DynamicDialogModule,
    DialogModule,
    TooltipModule,
    AccordionModule,
    ConfirmDialogModule,
    SidebarModule,
    CheckboxModule,
    PaginatorModule,
    EditorModule,
    RadioButtonModule,
    StepsModule,
    FileUploadModule,
    InputTextareaModule,
    TabViewModule,
    GalleriaModule,
    ChipsModule,
    OrganizationChartModule,
    InputSwitchModule,
    GMapModule,
    PanelMenuModule,
    PasswordModule,
    SelectButtonModule,
    ToggleButtonModule,
    TreeModule,
    OverlayPanelModule,
    TreeTableModule,
    ButtonComponent,
    TableComponent,
    InputNumberModule,
    ChartModule,
    TreeSelectModule,
    HeaderHomepageComponent
  ]
})
export class SharedModule { }
