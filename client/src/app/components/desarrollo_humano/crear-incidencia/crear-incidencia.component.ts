import { Component, OnInit, Input, Output, EventEmitter,ViewChild,OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient , HttpHeaders, HttpResponse} from '@angular/common/http';
import { DatePipe } from '@angular/common';
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
<<<<<<< HEAD


=======
	httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json',
			'miembroID': "139",
			'Authorization': '996c7324-9087-47b9-a9cc-fb0da458f89f'
		})
	};
>>>>>>> 5f43ecfa3ad5f553b899e547c8d1fcbb21673b83
	constructor(
		private http : HttpClient,
		private formBuilder: FormBuilder
		){}

	ngOnInit() {
		var hoy = new Date();
		var fech = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate();

		this.form_buscar = this.formBuilder.group({
			miembroID: ['', Validators.required]
		})

		this.form_guardar = this.formBuilder.group({
			no_incidencia:['', ],
			area_actividad : [''],
			miembroID : ['', Validators.required], //del niño
			fecha_incidencia : [fech, Validators.required],
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
	}

	get f2(){ return this.form_guardar.controls;}
	
	limpiar_form_guardar(){
		this.form_guardar.reset();
	}

	obtener_datos(miembroID: string, controlador : string): void {
		if (miembroID == "") 
			return;

<<<<<<< HEAD
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
				'miembroID': "139",
				'Authorization': '996c7324-90817-47b9-a9cc-fb0da458f89f'
			})
		};

		var response = this.http.get(this.url + controlador+ "?id=" + miembroID, httpOptions );
=======
		var response = this.http.get(this.url + controlador+ "?id=" + miembroID, this.httpOptions );
>>>>>>> 5f43ecfa3ad5f553b899e547c8d1fcbb21673b83
		response.subscribe((resultado : any)=> {
			this.form_guardar.patchValue(resultado);
			console.log(this.url + controlador+ "?id=" + miembroID);
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
				var response = this.http.get(this.url + "ultimaincidencia");
				response.subscribe((resultado : number)=> {
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

		this.http.post(this.url + 'Incidencia1',this.form_guardar.value).subscribe(data  => {
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
