import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
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
