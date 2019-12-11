import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 

@Component({
  selector: 'navbar-servicio',
  templateUrl: './navbar-servicio.component.html',
  styleUrls: ['./navbar-servicio.component.css']
})
export class NavbarServicioComponent implements OnInit {
puesto:any;
  constructor(private router: Router) { }

  ngOnInit() {
    this.puesto=localStorage.getItem('puesto');
	}

	redireccion_menu(){
		this.router.navigate(['']);
	}
  cerrar(){
    localStorage . clear(); 
    this.router.navigate(['/login']);
  }
}
