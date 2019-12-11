import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MyserviceService } from '../../myservice.service'
import { HttpClient } from '@angular/common/http';
import {Location} from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bloqueo',
  templateUrl: './bloqueo.component.html',
  styleUrls: ['./bloqueo.component.css']
})
export class BloqueoComponent implements OnInit {

  constructor(private router: Router,private _location: Location) { }

  ngOnInit() {
  }

  return(){
    this._location.back();
  }
  go(){
    localStorage . clear(); 
    this.router.navigate(['/login']);
  }
  home(){
    if (localStorage.getItem('puesto')== "Administrador" ){
        //ruta home administrador
        this.router.navigate(['']);
    } else if(localStorage.getItem('puesto')== "Recepcion"){
      //ruta home Recepcion
      this.router.navigate(['/recepcion/agregar-modificar']);
    } else if(localStorage.getItem('puesto')== "Desarrollo Humano"){
      //ruta home Desarrollo Humano
      this.router.navigate(['/desarrollo_humano']);
    } else if(localStorage.getItem('puesto')== "Desarrollo Institucional"){
      //ruta home Desarrollo Institucional
      this.router.navigate(['/donacion']);
    } else if(localStorage.getItem('puesto')== "Coordinacion Operativa"){
      //ruta home Coordinacion Operativa
      this.router.navigate(['/coordinacion_operativa']);
  } else{
    this.router.navigate(['/login']);
  }
}

}
