import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'navbar-co',
  templateUrl: './navbar-co.component.html',
  styleUrls: ['./navbar-co.component.css']
})
export class NavbarCOComponent implements OnInit {
puesto:any;
httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'miembroID': localStorage.getItem('miembroID'),
    'Authorization': localStorage.getItem('Authorization')
  })
};
resultado: any;
url = "https://api-remota.conveyor.cloud/api/";
  
constructor(private router: Router, private http: HttpClient) {
  this.verificacion_sesion();
}

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

  verificacion_sesion() {
    if (localStorage.getItem('miembroID') == null || localStorage.getItem('Authorization') == null) {
      localStorage.clear();
      this.router.navigate(['/login']);
    }
    else {
      var response = this.http.get(this.url + "Usuario/id?id=" + localStorage.getItem('miembroID'), this.httpOptions);
      response.subscribe((data: any[]) => {
        this.resultado = data;
        if (this.resultado == "Sesión invalida") {          
          this.router.navigate(['/login']);
          return;
         }
      },
        error => {          
          this.router.navigate(['/login']);
          console.log("Error", error)
        });
    }
  }

}
