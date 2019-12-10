import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'modifuser-admin',
  templateUrl: './modifuser-admin.component.html',
  styleUrls: ['./modifuser-admin.component.css']
})
export class ModifuserAdminComponent implements OnInit {
  //busqueda
  resultado: any;
  //type
  tipo: number = 0;
  //Tabla
  arreglo: any;

  //Formularios
  form_config: FormGroup;
  datos_miembro: any;
  //validacion
  submit_info = false;

  httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json',
			'miembroID': localStorage.getItem('miembroID'),
			'Authorization': localStorage.getItem('Authorization')
		})
	};

  url = "https://api-remota.conveyor.cloud/api/";

  constructor(private http: HttpClient, private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit() {
    //Se rellena los campos al formulario 
    //buscar
    this.form_config = this.formBuilder.group({
      usuarioID: ['', Validators.required],
      miembroID: ['', Validators.required],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      contrasena: ['', Validators.required],
      correo: ['',[Validators.required,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
      puesto: ['', Validators.required],
      tel1: [],
      tel2: [],
      direccion: [],
      fechanacimiento: [],
      nacionalidad: [],
      estado: [],
      status: [],
      sede: [localStorage.getItem('sede')],
    })
    this.buscar_usuario();

  }

  heiden_pass() {
    var modificar_see = document.getElementById("modificar_see");
    if (this.tipo === 0) {
      modificar_see.setAttribute("type", "text");
      this.tipo = 1;
    } else {
      modificar_see.setAttribute("type", "password");
      this.tipo = 0;
    }
  }

  //controls Buscar
  get f_A() {
    return this.form_config.controls;
  }

  //llenar tabla
  buscar_usuario() {
    //select mediante el id
    var response = this.http.get(this.url
      + "usuario/buscador?Rsede=" + this.form_config.value.sede
      + "&rmiembroid=0&Rstatus=false&Rnacionalidad=null&Restado=null&Rnombre=null&Rpuesto=null", this.httpOptions);
    response.subscribe((data: any[]) => {
      this.resultado = data;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
    },
      error => {
        console.log("Error", error)
      });
  }

  //llenar form
  llenar(id: any) {
    //select mediante el id
    var response = this.http.get(this.url
      + "usuario/buscador?Rsede=" + this.form_config.value.sede
      + "&rmiembroid=" + id
      + "&Rstatus=false&Rnacionalidad=null&Restado=null&Rnombre=null&Rpuesto=null", this.httpOptions
    );
    response.subscribe((data: any[]) => {
      this.arreglo = data;
      if (this.arreglo == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
      this.form_config.patchValue(this.arreglo[0]);
      this.form_config.get('status').setValue(this.arreglo[0].status);

      var modificar_status = (<HTMLInputElement>document.getElementById("modificar_status"));
      if(this.arreglo[0].status=="true")
      {
        modificar_status.checked=true;
      }
      else if(this.arreglo[0].status=="false")
      {
        modificar_status.checked=false;
      }

    },
      error => {
        console.log("Error", error)
      });
  }

  modificar() {    
    this.submit_info = false;
    var orig = this.form_config.value.contrasena;
    this.form_config.get('contrasena').setValue(orig.trim());
    orig = this.form_config.value.contrasena;

    //verifica formularío
    if (this.form_config.invalid && orig.length <= 3) {
      alert('Favor de seleccionar un usuario de la tabla o llenar los campos requeridos para su modificación(contraseña min. 3 letras).');
      this.submit_info = true;
      return;
    }
    var spinner_modificar = document.getElementById("spinner_modificar");
    spinner_modificar.removeAttribute("hidden");
    this.modificar_miembro();
    this.modificar_usuario();
    alert("Usuario Modificado Correctamente.");

    this.buscar_usuario();
    spinner_modificar.setAttribute("hidden", "true");
  }

  modificar_miembro() {
    this.datos_miembro = {
      miembroID: this.form_config.value.miembroID,
      estado: this.form_config.value.status,
      tipo: "Usuario",
      sede: this.form_config.value.sede
    }
    this.http.put(this.url + "Miembro/" + this.form_config.value.miembroID, this.datos_miembro, this.httpOptions).subscribe(data => {
      this.resultado =data;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
    },
      error => {
        console.log("Error", error);
      });
  }

  modificar_usuario() {
    this.http.put(this.url + "Usuarios/" + this.form_config.value.miembroID, this.form_config.value, this.httpOptions).subscribe(data => {
      this.resultado =data;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
    },
      error => {
        console.log("Error", error);
      });
  }
}
