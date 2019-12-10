import { Component, OnInit, Input, Output, EventEmitter,ViewChild,OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

@Component({
	selector: 'agregar-miembro',
	templateUrl: './agregar-miembro.component.html',
	styleUrls: ['./agregar-miembro.component.css']
})
export class AgregarMiembroComponent implements OnInit {
	url = "https://api-remota.conveyor.cloud/api/";

	//Todo para el alert
	visible : boolean = false;
	tipo : string = null;
	mensaje : string = null;
	guardando : boolean = false;

	datos_miembro : any;

	//form guardar
	form_guardar : FormGroup
	submitted2 = false;

	//form buscar
	form_buscar : FormGroup;
	submitted = false;

	duracion : number = 10000;

	constructor(
		private http : HttpClient,
		private formBuilder: FormBuilder
		){}

	ngOnInit() {
		this.form_buscar = this.formBuilder.group({
			miembroID: ['', Validators.required]
		})

		this.form_guardar = this.formBuilder.group({
			sede: [null, Validators.required],
			estado : [true, Validators.required],
			idStaff : [null, Validators.required],
			miembroID : [null, Validators.required],
			nombre : [null, Validators.required],
			apellido_paterno : ['', Validators.required],
			apellido_materno : ['', ],
			fecha_nacimiento : ['', Validators.required],
			telefono_particular : ['', ],
			celular : ['', ],
			correo : ['',[ Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
			domcalle : ['', Validators.required],
			domcolonia : ['', Validators.required],
			domcodpost : ['', Validators.required],
			domdelegacion : ['', Validators.required],
			dommunicipio : ['', Validators.required],
			escuela : ['', Validators.required],
			semestre : ['', Validators.required],
			tipo : ['', Validators.required],
			otro_estudio : ['', ],
			idiomas : ['', ],
			padece_enfermedad : [''],
			cual_enfermedad : ['', Validators.required],
			alergias : ['', ],
			comunicarnos_con : ['', Validators.required],
			telefono_emergencia : ['', Validators.required],
			parentesco_emergencia : ['', Validators.required],
			experiencia_voluntario : ['', ],
			donde_experiencia : ['', ],
			tratado_ninos : ['', ],
			lunes : ['', ],
			horas_lunes : ['', ],
			martes : ['', ],
			horas_martes : ['', ],
			miercoles : ['', ],
			horas_miercoles : ['', ],
			jueves : ['', ],
			horas_jueves : ['', ],
			viernes : ['', ],
			horas_viernes : ['', ],

		});
	}

	get f2(){ return this.form_guardar.controls;}
	
	limpiar_form_guardar(){
		this.form_guardar.reset();
	}

	//Obtener nuevo miembro MÉTODO AUXILIAR
	obtener_ultimo_miembro(){
		var response = this.http.get(this.url + "ultimoMiembro");
		response.subscribe((resultado : number)=> {
			this.form_guardar.get('idStaff').setValue(resultado + 1);
			this.form_guardar.get('miembroID').setValue(resultado + 1);

			window.scroll(0,0);

			if(this.form_guardar.invalid){
				console.log("formulario invalido");
				this.submitted2 = true;
				return;
			}
			this.guardar_miembro();
		},
		error =>{
			console.log("Error", error)
		});
	}

	guardar_miembro(){
		this.datos_miembro = {
			miembroID : this.form_guardar.value.miembroID,
			estado : this.form_guardar.value.estado,
			tipo : "servicio social",
			sede: this.form_guardar.value.sede
		}

		this.http.post(this.url + 'miembro', this.datos_miembro).subscribe(data  => {
			console.log("Se ha guardado el miembro")
			this.guardar_en_staff()
		},
		error  => {
			this.mostrar_alert("Ocurrió un error, inténtalo mas tarde", 'danger');
			//spinner.setAttribute("hidden", "true");
			this.form_guardar.enable();
			console.log("Error al guardar en la tabla miembro", error);
		});
	}

	guardar_en_staff(){
		window.scroll(0,0);
		this.http.post(this.url + 'staff', this.form_guardar.value).subscribe(data  => {
			this.mostrar_alert("Se ha guardado " + this.form_guardar.value.nombre + ", su número de miembro es: " + this.form_guardar.value.miembroID, 'success');
		},
		error  => {
			this.mostrar_alert("Ocurrió un error, inténtalo mas tarde", 'danger');
			//spinner.setAttribute("hidden", "true");
			this.form_guardar.enable();
			console.log("Error al guardar en la tabla staff", error);
		});
	}

	mostrar_alert(msg : string, tipo : string){
		window.scroll(0,0);
		this.visible = true;
		this.mensaje = msg;
		this.tipo = tipo;

		setTimeout(() => { 
			this.cerrar_alert();
		}, this.duracion
		);
	}
	cerrar_alert(){
		this.limpiar_form_guardar();
		this.visible = false;
		this.mensaje = null;
		this.tipo = null;
		this.guardando = false;
		this.submitted2 = false;
	}

	login(){
		this.http.post(this.url + 'Usuarios?miembroID=139&contrasena=1234', null).subscribe(data  => {
			console.log(data)
		},
		error  => {
			this.mostrar_alert("Ocurrió un error, inténtalo mas tarde", 'danger');
			//spinner.setAttribute("hidden", "true");
			this.form_guardar.enable();
			console.log("Error al guardar en la tabla miembro", error);
		});
	}
}


