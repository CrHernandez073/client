import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-config-donacion',
  templateUrl: './config-donacion.component.html',
  styleUrls: ['./config-donacion.component.css']
})
export class ConfigDonacionComponent implements OnInit {
//busqueda
resultado: any;
tipo: number=0;
  //Formularios
  form_config : FormGroup;
  
  //validacion
	submit_config= false;

  httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json',
			'miembroID': localStorage.getItem('miembroID'),
			'Authorization': localStorage.getItem('Authorization')
		})
	};

  url = "https://api-remota.conveyor.cloud/api/";

  constructor(private http: HttpClient,private formBuilder: FormBuilder,private router: Router ) { 
        
  }

  ngOnInit() {
    //Se rellena los campos al formulario 
    //buscar
		this.form_config = this.formBuilder.group({
      usuarioID: [],
      miembroID: [localStorage.getItem("miembroID")],
      nombre: ['',Validators.required],
      apellidos: ['',Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['',[Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
      puesto: [],
      tel1: [],
      tel2: [],
      direccion: [],
      fechanacimiento: [],
      nacionalidad: [],
      estado: [],
    })
    this.buscar_usuario()

  }

  //controls Agregar
  get f_A() { 
    return this.form_config.controls;
  }
  heiden_pass() {
    var pass = document.getElementById("pass");
    if (this.tipo === 0) {
      pass.setAttribute("type", "text");
      this.tipo=1;
    } else {
      pass.setAttribute("type", "password");
      this.tipo=0;
    }
  }  

	buscar_usuario(){
	  this.submit_config = true;  
     //select mediante el id
      var response = this.http.get(this.url + "Usuario/id?id=" + this.form_config.value.miembroID,this.httpOptions);
     response.subscribe((data: any[]) => {
       this.resultado = data;
       if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
       //transformar fecha formato
       var datePipe = new DatePipe("en-US");
       this.resultado[0].fechanacimiento = datePipe.transform(this.resultado[0].fechanacimiento, 'yyyy-MM-dd');

       this.form_config.get('usuarioID').setValue(this.resultado[0].usuarioID);
       this.form_config.get('miembroID').setValue(this.resultado[0].miembroID);
       this.form_config.get('nombre').setValue(this.resultado[0].nombre);
       this.form_config.get('apellidos').setValue(this.resultado[0].apellidos);
       this.form_config.get('contrasena').setValue(this.resultado[0].contrasena);
       this.form_config.get('correo').setValue(this.resultado[0].correo);
       this.form_config.get('puesto').setValue(this.resultado[0].puesto);
       this.form_config.get('tel1').setValue(this.resultado[0].tel1);
       this.form_config.get('tel2').setValue(this.resultado[0].tel2);
       this.form_config.get('direccion').setValue(this.resultado[0].direccion);
       this.form_config.get('fechanacimiento').setValue(this.resultado[0].fechanacimiento);
       this.form_config.get('nacionalidad').setValue(this.resultado[0].nacionalidad);
       this.form_config.get('estado').setValue(this.resultado[0].estado);
     },
       error => {
         console.log("Error", error)
       });
   
  }
  
  configuracion() {
    var orig = this.form_config.value.contrasena;
    this.form_config.get('contrasena').setValue(orig.trim());
    orig = this.form_config.value.contrasena;
    //verifica formularío
    if (this.form_config.invalid && orig.length <= 3 ) {
      alert("Favor de llenar los campos requeridos e ingresar una contraseña de minimo 3 letras.");
      this.submit_config = true;
      return;
    }
    var spinner_config = document.getElementById("spinner_config");
    spinner_config.removeAttribute("hidden");

    //Update mediante el id y los campos de agregar
    this.http.put(this.url + "Usuarios/" + localStorage.getItem("miembroID"), this.form_config.value,this.httpOptions).subscribe(data => {
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
      spinner_config.setAttribute("hidden", "true");
      alert("Usuario Modificado Correctamente.");
    },
      error => {
        spinner_config.setAttribute("hidden", "true");
        console.log("Error", error);
      });
  }
 
}
