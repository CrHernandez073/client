import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'navbar-dh',
  templateUrl: './navbar-dh.component.html',
  styleUrls: ['./navbar-dh.component.css']
})
export class NavbarDHComponent implements OnInit {
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
