import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MyserviceService } from '../../myservice.service'
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  url = "https://api-remota.conveyor.cloud/api/";

  //Todo para el alert
  visible : boolean = false;
  tipo : string = "";
  mensaje : string = "";
  duracion: number = 4000; //1000 es 1 SEG

  //form buscar
  form_enviar_correo : FormGroup
  guardando : boolean = false;
  submitted2 = false;
  form_invalid: boolean = false;

  form: FormGroup;
  successmsg: any;
  errmsg: any;

  resultado: any;

  httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json',
			'miembroID': localStorage.getItem('miembroID'),
			'Authorization': localStorage.getItem('Authorization')
		})
	};

  constructor(private Userservice: MyserviceService, private router: Router, private http: HttpClient, ) {
    this.verificacion_sesion();
   }

  ngOnInit() {
    this.verificacion_sesion();
    this.form = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
      grant_type: new FormControl('password'),
    });

    this.form_enviar_correo = new FormGroup({
      correo: new FormControl('', [Validators.required]),
    });
  }

  limpiar_enviar_correo(){
    this.form_enviar_correo.reset();
  }
  get f2() {
    return this.form.controls;
  }

  verificacion_sesion(){ 
        if (localStorage.getItem('miembroID') == null){
          return;}
          else{
      var response = this.http.get(this.url + "Usuario/id?id=" + localStorage.getItem('miembroID'), this.httpOptions);
      response.subscribe((data: any[]) => {
        this.resultado = data;
        console.log(this.resultado);
        if (this.resultado != "Sesión invalida") {  
         if (localStorage.getItem("puesto") == "Administrador") {
            this.router.navigate(['']);
          } else if (localStorage.getItem("puesto") == "Recepcion") {
            this.router.navigate(['recepcion/entradas-salidas']);
          } else if (localStorage.getItem("puesto") == "Desarrollo Institucional") {
            this.router.navigate(['/donacion/agregar-donante']);
          } else if (localStorage.getItem("puesto") == "Desarrollo Humano") {
            this.router.navigate(['/desarrollo_humano']);
          } else if (localStorage.getItem("puesto") == "Coordinacion Operativa") {
            this.router.navigate(['/coordinacion_operativa']);
          }
        }
        else {
          this.errmsg = 'Favor de iniciar sesión.';
        }
      },
      error => {
        this.errmsg = 'Favor de iniciar sesión.';
        console.log("Error", error)
      });
    }    
  }

  correo_valido() {
    if (this.form_enviar_correo.invalid) {
      this.mostrar_alert("Rellena los campos", "danger")
      return;
    }    
    var spinner_correo = document.getElementById("spinner_correo");
    spinner_correo.removeAttribute("hidden");

    var response = this.http.get(this.url + "correo_valido?correo=" + this.form_enviar_correo.value.correo);
    response.subscribe((resultado : any)=> {
      
      this.mostrar_alert("Hemos enviado tus credenciales al correo electronico.", "success")
      spinner_correo.setAttribute("hidden", "true"); 
    },
    error =>{
      this.mostrar_alert("Error al enviar el correo, intentalo mas tarde", "warning")
      spinner_correo.setAttribute("hidden", "true"); 
    });
  }

  mostrar_alert(msg : string, tipo : string){
    this.visible = true;
    this.mensaje = msg;
    this.tipo = tipo;

    setTimeout(() => { 
      this.cerrar_alert();
    }, this.duracion
    );
  }
  cerrar_alert(){
    this.limpiar_enviar_correo();
    this.visible = false;
    this.mensaje = null;
    this.tipo = null;
    this.guardando = false;
  }

  login(){
    this.errmsg = null;
    var spinner_login = document.getElementById("spinner_login");
    spinner_login.removeAttribute("hidden");
    this.remover();
		this.http.post(this.url + 'Usuarios?miembroID='+this.form.value.username+'&contrasena='+this.form.value.password, null).subscribe(data  => {
      this.resultado = data;

      if (this.resultado != null) {
        localStorage.setItem('miembroID', this.resultado.miembroID);
        localStorage.setItem('nombre', this.resultado.nombre);
        localStorage.setItem('correo', this.resultado.correo);
        localStorage.setItem('direccion', this.resultado.direccion);
        localStorage.setItem('fechanacimiento', this.resultado.fechanacimiento);
        localStorage.setItem('puesto', this.resultado.puesto);
        localStorage.setItem('Authorization', this.resultado.token);
        localStorage.setItem('sede', this.resultado.Miembro.sede);
        spinner_login.setAttribute("hidden", "true");

        if (localStorage.getItem("puesto") == "Administrador") {
          this.router.navigate(['']);
        } else if (localStorage.getItem("puesto") == "Recepcion") {
          this.router.navigate(['recepcion/entradas-salidas']);
        } else if (localStorage.getItem("puesto") == "Desarrollo Institucional") {
          this.router.navigate(['/donacion/agregar-donante']);
        } else if (localStorage.getItem("puesto") == "Desarrollo Humano") {
          this.router.navigate(['/desarrollo_humano']);
        } else if (localStorage.getItem("puesto") == "Coordinacion Operativa") {
          this.router.navigate(['/coordinacion_operativa']);
        }
      } else{
        spinner_login.setAttribute("hidden", "true");
        this.errmsg = 'Constraseña o Usuario Incorrecto.';
      }
      
		},
		error  => {      
      spinner_login.setAttribute("hidden", "true");
      this.errmsg = 'Favor de ingresar un numero de miembro correcto y/o verificar la conexion.';
			console.log("Error", error);
		});
	}

  remover() {
    localStorage.clear()
  }
}  