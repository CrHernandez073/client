import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contenedor-admin',
  templateUrl: './contenedor-admin.component.html',
  styleUrls: ['./contenedor-admin.component.css']
})
export class ContenedorAdminComponent implements OnInit {

  puesto: any;

  constructor(private router: Router) { }

  ngOnInit() {
    
		this.puesto=localStorage.getItem('puesto');
  }
  redireccion_menu(){
		this.router.navigate(['']);
	}

}
