import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from "./auth/components/login/login.component";
import { ReactiveFormsModule } from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { ResetPasswordComponent } from './auth/components/resetPassword/resetPassword.component';
import { SignUpComponent } from './auth/components/sign-up/sign-up.component';
import { NgxCaptchaModule } from '@binssoft/ngx-captcha';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { PolicyComponent } from './policy/policy.component';
import { GalleriaModule } from 'primeng/galleria';
import { PaginatorModule } from 'primeng/paginator';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ResetPasswordComponent,
    PageNotFoundComponent,
    SignUpComponent,
    TermsAndConditionsComponent,
    PolicyComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GraphQLModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxCaptchaModule,
    CommonModule,
    GalleriaModule,
    PaginatorModule,
  ],
  providers: [
    MessageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
