import { Component, OnInit, Input, Output, EventEmitter,ViewChild,OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient , HttpHeaders, HttpResponse} from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

@Component({
	selector: 'crear-incidencia',
	templateUrl: './crear-incidencia.component.html',
	styleUrls: ['./crear-incidencia.component.css']
})
export class CrearIncidenciaComponent implements OnInit {
	url = "https://api-remota.conveyor.cloud/api/";

	//Todo para el alert
	visible : boolean = false;
	tipo : string = null;
	mensaje : string = null;
	guardando : boolean = false;

	//form guardar
	form_guardar : FormGroup
	submitted2 = false;

	//form buscar
	form_buscar : FormGroup;
	submitted = false;

	duracion : number = 3000;

	httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json',
			'miembroID': localStorage.getItem("miembroID"),
			'Authorization': localStorage.getItem("Authorization")
		})
	};

	constructor(
		private http : HttpClient,
		private formBuilder: FormBuilder,
		private router: Router
		){}

	ngOnInit() {
		this.form_buscar = this.formBuilder.group({
			miembroID: ['', Validators.required]
		})

		this.form_guardar = this.formBuilder.group({
			no_incidencia:['', ],
			area_actividad : [''],
			miembroID : ['', Validators.required], //del niño
			fecha_incidencia : ['', Validators.required],
			grupo : [''],
			con_hermanos_primos : [''],
			conducta_problema : ['', Validators.required],
			descripcion : ['', Validators.required],
			canaliza : [''],
			solucion : [''],
			nombres: ['', Validators.required],
			appaterno: [''],
			apmaterno: [''],
			nombre_instructor: ['', Validators.required], //nombre del instructor
			apellido_pat_instructor: [''], // apellido p del instructor
			apellido_mat_instructor: [''] // apellido m del instructor
		});

		this.fecha_actual();
	}

	get f2(){ return this.form_guardar.controls;}

	fecha_actual(){
		var hoy = new Date();
		var fech = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate();

		this.form_guardar.get("fecha_incidencia").setValue(fech);
	}
	
	limpiar_form_guardar(){
		this.form_guardar.reset();
	}

	obtener_datos(miembroID: string, controlador : string): void {
		if (miembroID == "") 
			return;
		var response = this.http.get(this.url + controlador+ "?id=" + miembroID, this.httpOptions );
		response.subscribe((resultado : any)=> {
			if(resultado == "Sesión invalida") this.router.navigate(['/login'])
			this.form_guardar.patchValue(resultado);
		},
		error =>{
			this.form_guardar.reset();
		});
	}

	limpiar_form_buscar(){
		this.submitted = false;
		this.form_buscar.reset();
	}

	//Obtener nueva incidencia MÉTODO AUXILIAR
	obtener_ultima_incidencia(){
		if (this.form_guardar.invalid || this.guardando == true) {
			this.submitted2 = true;
			return;
		}
		else {
			var resp = confirm("¿Deseas continuar?");
			if (resp) {
				var response = this.http.get(this.url + "ultimaincidencia", this.httpOptions);
				response.subscribe((resultado : any)=> {
					if(resultado == "Sesión invalida") this.router.navigate(['/login'])

					//Obtiene el último ID y incrementa el nuevo.
					this.form_guardar.get('no_incidencia').setValue(resultado + 1);

					//Registrará la nueva incidencia
					this.guardar_incidencia();
					this.submitted2 = false;
				},
				error =>{
					console.log("Error", error)
					this.submitted2 = false;
				});
			}
		}
	}

	guardar_incidencia(){
		this.form_guardar.disable();
		this.guardando = true;

		this.http.post(this.url + 'Incidencia1',this.form_guardar.value, this.httpOptions).subscribe(data  => {
			if(data == "Sesión invalida") this.router.navigate(['/login'])

			this.form_guardar.enable();
			this.mostrar_alert("Se ha guardado correctamente", "success");
		},
		error  => {
			this.form_guardar.enable();
			this.mostrar_alert("No se pudo guardar, intentalo mas tarde", "danger");
		});
		this.form_guardar.reset();
		this.guardando = false;
	}

	mostrar_alert(msg : string, tipo : string){
		this.visible = true;
		this.mensaje = msg;
		this.tipo = tipo;
		
		setTimeout(() => { 
			var input = document.getElementById("miembroID");
			input.focus();
			this.cerrar_alert();
		}, this.duracion
		);
	}
	cerrar_alert(){
		this.visible = false;
		this.mensaje = null;
		this.tipo = null;

		var input = document.getElementById("miembroID");
		input.focus();
		this.fecha_actual();
	}
}
