import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient , HttpHeaders, HttpResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-buscar-servicio',
	templateUrl: './buscar-servicio.component.html',
	styleUrls: ['./buscar-servicio.component.css']
})
export class BuscarServicioComponent implements OnInit {
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

	datos_miembro : any;

	@ViewChild('closeAddExpenseModal', {static: false} ) closeAddExpenseModal: ElementRef;

	busq_nombre : string = "";

	constructor(
		private http : HttpClient,
		private formBuilder: FormBuilder,
		private router: Router
		){}

	ngOnInit() {
		this.obtener_historial();
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

	obtener_historial(){
		var sede = (<HTMLInputElement>document.getElementById("busq_sede"));
		var nombre = (<HTMLInputElement>document.getElementById("busq_nombre"));

		var response = this.http.get(this.url + "historial_staff?sede="+sede.value+"&nombre="+nombre.value, this.httpOptions);
		response.subscribe((resultado : any)=> {
			if(resultado == "Sesión invalida") this.router.navigate(['/login'])
				resultado.length > 0 ? this.comparar_nombre(resultado, nombre.value) : this.mostrar_alert("No hay nada que mostrar", "info");
		},
		error =>{
			this.mostrar_alert("Error al consultar, intentalo mas tarde.", "warning");
		});
	}

	comparar_nombre(resultado : any, nombre : string): void {

		if(nombre != ""){
			const aux = [];
			for (var i = 0; i < resultado.length; i++){
				if(resultado[i].nombre.toLowerCase().includes(nombre.toLowerCase()))
					aux.push(resultado[i]);
			}
			this.historial = aux;
		}
		else{
			this.historial = resultado;	
		}
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
		this.form_guardar.get("fecha_nacimiento").setValue(datepipe.transform(valores.fecha_nacimiento, 'yyyy-MM-dd'));
	}

	cancelar(){
		this.form_guardar.reset();
	}

	obtener_datos(miembroID: string, controlador : string): void {
		if (miembroID == "") 
			return;

		var response = this.http.get(this.url + controlador+ "?id=" + miembroID);
		response.subscribe((resultado : any)=> {
			this.form_guardar.patchValue(resultado);
		},
		error =>{
			this.form_guardar.reset();
		});
	}

	modificar(){
		window.scroll(0,0);
		if (this.form_guardar.invalid || this.guardando == true) {
			this.submitted2 = true;
			return;
		}
		else {
			var resp = confirm("¿Deseas continuar?");
			if (resp) {

				this.datos_miembro = {
					miembroID : this.form_guardar.value.miembroID,
					estado : this.form_guardar.value.estado,
					tipo : "servicio social",
					sede: this.form_guardar.value.sede
				}

				this.http.put(this.url + "miembro/" + this.form_guardar.value.miembroID, this.datos_miembro, this.httpOptions).subscribe(data  => {
					if(data == "Sesión invalida"){
						this.router.navigate(['/login'])
						document.getElementById("cerrar_modal").click();	
						return;	
					} 
					this.form_guardar.enable();
					this.mostrar_alert("Se ha guardado correctamente", "success");

				},
				error  => {
					//spinner.setAttribute("hidden", "true");
					this.form_guardar.enable();
					this.mostrar_alert("Ocurrió un error al modificar los datos, vuelve a intentarlo", "danger");
				});

				this.http.put(this.url + "staff/" + this.form_guardar.value.idStaff, this.form_guardar.value, this.httpOptions).subscribe(data  => {
					if(data == "Sesión invalida"){ 
						this.router.navigate(['/login'])
						return;
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
