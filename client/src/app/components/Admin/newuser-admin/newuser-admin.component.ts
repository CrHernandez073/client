import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'newuser-admin',
  templateUrl: './newuser-admin.component.html',
  styleUrls: ['./newuser-admin.component.css']
})
export class NewuserAdminComponent implements OnInit {
  //busqueda
  resultado: any;
  //type
  tipo: number = 0;
  //Tabla
  arreglo: any;
  //Formularios
  datos_miembro: any;
  form_config: FormGroup;
  //validacion
  submit_config = false;

  httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json',
			'miembroID': localStorage.getItem('miembroID'),
			'Authorization': localStorage.getItem('Authorization')
		})
	};

  url = "https://api-remota.conveyor.cloud/api/";

  constructor(private http: HttpClient, private formBuilder: FormBuilder) { }

  ngOnInit() {
    //Se rellena los campos al formulario 
    //buscar
    this.form_config = this.formBuilder.group({
      usuarioID: ['', Validators.required],
      miembroID: ['', Validators.required],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['',[Validators.required,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
      puesto: ['', Validators.required],
      tel1: [],
      tel2: [],
      direccion: [],
      fechanacimiento: [],
      nacionalidad: [],
      estado: [],
      status: [true],
      sede: [localStorage.getItem('sede')],
    })
    this.obtener_ultimo_miembro();

  }

  heiden_pass() {
    var pass = document.getElementById("pass");
    if (this.tipo === 0) {
      pass.setAttribute("type", "text");
      this.tipo = 1;
    } else {
      pass.setAttribute("type", "password");
      this.tipo = 0;
    }
  }

  //controls Buscar
  get f_A() {
    return this.form_config.controls;
  }

  //Obtiene el último miembroID de la tabla miembros
  obtener_ultimo_miembro() {
    var response = this.http.get(this.url + "ultimoMiembro",this.httpOptions);
    response.subscribe((resultado: number) => {
      this.form_config.get('usuarioID').setValue(resultado + 1);
      this.form_config.get('miembroID').setValue(resultado + 1);
    },
      error => {
        console.log("Error al obtener el último miembroID", error)
      });
  }

  //registrar usuario
  agregar_miembro() {
    this.submit_config = false;
    var orig = this.form_config.value.contrasena;
    this.form_config.get('contrasena').setValue(orig.trim());
    orig = this.form_config.value.contrasena;
    //verifica formularío
    if (this.form_config.invalid || orig.length <= 3 ) {
      alert("Favor de llenar los campos requeridos y ingresar una contraseña de minimo 3 letras.");
      this.submit_config = true;
      return;
    }
    var spinner = document.getElementById("spinner");
    spinner.removeAttribute("hidden");
    this.obtener_ultimo_miembro();
    this.datos_miembro = {
      miembroID: this.form_config.value.miembroID,
      estado: this.form_config.value.status,
      tipo: "Usuario",
      sede: this.form_config.value.sede
    }
    this.http.post(this.url + 'miembro', this.datos_miembro,this.httpOptions).subscribe(data => {
      this.agregar_usuario();
      spinner.setAttribute("hidden", "true");
    },
      error => {
        console.log("Error", error);
      });
  }

  agregar_usuario() {
    this.http.post(this.url + 'Usuarios', this.form_config.value,this.httpOptions).subscribe(data => {
      alert('Se a guardado el usuario correctamente. ID: ' + this.form_config.value.usuarioID);
      this.form_config.reset();
      this.obtener_ultimo_miembro();
      this.form_config.get('status').setValue(true);
    },
      error => {
        console.log("Error", error);
      });
  }
}
