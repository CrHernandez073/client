import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient , HttpHeaders, HttpResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { DatePipe } from '@angular/common';

@Component({
	selector: 'historial-incidencias',
	templateUrl: './historial-incidencias.component.html',
	styleUrls: ['./historial-incidencias.component.css']
})
export class HistorialIncidenciasComponent implements OnInit {
	url = "https://api-remota.conveyor.cloud/api/";

	httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json',
			'miembroID': localStorage.getItem("miembroID"),
			'Authorization': localStorage.getItem("Authorization")
		})
	};

	//Todo para el alert
	visible : boolean = false;
	tipo : string = "";
	mensaje : string = "";
	duracion: number = 1500; //1000 es 1 SEG

	//Resultado
	historial : any;

	//form guardar
	form_guardar : FormGroup
	guardando : boolean = false;
	submitted2 = false;

	@ViewChild('closeAddExpenseModal', {static: false} ) closeAddExpenseModal: ElementRef;

	constructor(
		private http : HttpClient,
		private formBuilder: FormBuilder,
		private router: Router
		){}

	ngOnInit() {
		this.obtener_historial();
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
		})
	}

	get f2(){ return this.form_guardar.controls;}

	obtener_historial(){
		var response = this.http.get(this.url + "historial_incidencias", this.httpOptions);
		response.subscribe((resultado : any)=> {
			if(resultado == "Sesión invalida"){
				document.getElementById("cerrar_modal").click();	
				this.router.navigate(['/login'])
			} 
			
			resultado.length > 0 ?  this.historial = resultado : this.mostrar_alert("No hay nada que mostrar", "info");
		},
		error =>{
			this.mostrar_alert("Error al consultar, intentalo mas tarde.", "warning");
		});
	}

	mostrar_alert(msg : string, tipo : string){
		if (tipo=="info")
			this.historial = null

		this.visible = true;
		this.mensaje = msg;
		this.tipo = tipo;
		
		setTimeout(() => { 
			if (tipo=="success") {
				this.closeAddExpenseModal.nativeElement.click();
				this.obtener_historial();
			}
			this.cerrar_alert();
		}, this.duracion
		);
	}
	cerrar_alert(){
		this.visible = false;
		this.mensaje = null;
		this.tipo = null;
	}

	abrir_modal(valores : any){
		var datepipe  = new DatePipe("en-US");
		this.form_guardar.patchValue(valores);
		this.form_guardar.patchValue(valores.alumno);
		this.form_guardar.get("fecha_incidencia").setValue(datepipe.transform(valores.fecha_incidencia, 'yyyy-MM-dd'));
	}

	cancelar(){
		this.form_guardar.reset();
	}

	obtener_datos(miembroID: string, controlador : string): void {
		if (miembroID == "") 
			return;

		var response = this.http.get(this.url + controlador+ "?id=" + miembroID, this.httpOptions);
		response.subscribe((resultado : any)=> {
			if(resultado == "Sesión invalida"){
				document.getElementById("cerrar_modal").click();	
				this.router.navigate(['/login'])
			} 

			this.form_guardar.patchValue(resultado);
		},
		error =>{
			this.form_guardar.reset();
		});
	}

	modificar(){
		if (this.form_guardar.invalid || this.guardando == true) {
			this.submitted2 = true;
			return;
		}
		else {
			var resp = confirm("¿Deseas continuar?");
			if (resp) {
				this.http.put(this.url + "Incidencia1/" + this.form_guardar.value.no_incidencia, this.form_guardar.value, this.httpOptions).subscribe(data  => {
					if(data == "Sesión invalida"){
						document.getElementById("cerrar_modal").click();	
						this.router.navigate(['/login'])
					} 
					
					this.form_guardar.enable();
					this.mostrar_alert("Se ha guardado correctamente", "success");
				},
				error  => {
					//spinner.setAttribute("hidden", "true");
					this.form_guardar.enable();
					this.mostrar_alert("Ocurrió un error al modificar los datos, vuelve a intentarlo", "danger");
				});
			}
		}
	}

}
