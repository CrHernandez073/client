import { Component, OnInit, Input, Output, EventEmitter,ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient , HttpHeaders, HttpResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

@Component({
	selector: 'educacion-ninos',
	templateUrl: './educacion-ninos.component.html',
	styleUrls: ['./educacion-ninos.component.css']
})
export class EducacionNinosComponent implements OnInit, OnChanges {
	@Input('global') global: any;
	@Input() prop!:any;

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
	tipo : string = null;
	mensaje : string = null;
	guardando : boolean = false;

	//form guardar
	form_guardar : FormGroup

	submitted2 :boolean = false;

	constructor(
		private http : HttpClient,
		private formBuilder: FormBuilder,
		private router: Router
		){}

	ngOnInit() {
		this.form_guardar = this.formBuilder.group({
			idNinosED : ['', Validators.required],
			miembroID : ['', Validators.required],

			promediogrados : [''],

			cicloeducacion1 : [''],
			cicloeducacion2 : [''],
			cicloeducacion3 : [''],
			escuelaeducacion1 : [''],
			escuelaeducacion2 : [''],
			escuelaeducacion3 : [''],
			gradoeducacion1 : [''],
			gradoeducacion2 : [''],
			gradoeducacion3 : [''],
			promedioinicioeducacion1 : [''],
			promedioinicioeducacion2 : [''],
			promedioinicioeducacion3 : [''],
			promediofinaleducacion1 : [''],
			promediofinaleducacion2 : [''],
			promediofinaleducacion3 : [''],

			mejorasignaturaeducacion1 : [''],
			mejorasignaturaeducacion2 : [''],
			mejorasignaturaeducacion3 : [''],
			mejorpromedioeducacion1 : [''],
			mejorpromedioeducacion2 : [''],
			mejorpromedioeducacion3 : [''],

			menorasignaturaeducacion1 : [''],
			menorasignaturaeducacion2 : [''],
			menorasignaturaeducacion3 : [''],
			menorpromedioeducacion1 : [''],
			menorpromedioeducacion2 : [''],
			menorpromedioeducacion3 : [''],

			leer : [''],
			palabraxminutoInicio : [''],
			nivellecturaInicio : [''],
			palabraxminutoFinal : [''],
			nivellecturaFinal : [''],

			nivelcomprencionInicio : [''],
			nivelcomprencionFinal : [''],

			escribir : [''],
			nivelescrituraFinal : [''],
			nivelescrituraInicio : [''],

			becas : [''],
			nombrebeca : [''],
			datoBecafecha1 : [''],
			datoBecafecha2 : [''],
			datoBecafecha3 : [''],
			datoBecaasignatura1 : [''],
			datoBecaasignatura2 : [''],
			datoBecaasignatura3 : [''],
			datoBecalugar1 : [''],
			datoBecalugar2 : [''],
			datoBecalugar3 : [''],

			espanol : [''],
			matematicas : [''],
			cienciasnaturales : [''],
			cienciassociales : [''],
			fisicomatematicas : [''],
			humanidades : [''],
			administracion : ['']
		})
	}


	ngOnChanges(changes: SimpleChanges){
		var datepipe  = new DatePipe("en-US");
		if (this.global != undefined) {
			this.form_guardar.patchValue(this.global["Nino_ED"][0]);
			this.form_guardar.get("datoBecafecha1").setValue(datepipe.transform(this.global["Nino_ED"][0]['datoBecafecha1'], 'yyyy-MM-dd'));	
			this.form_guardar.get("datoBecafecha2").setValue(datepipe.transform(this.global["Nino_ED"][0]['datoBecafecha2'], 'yyyy-MM-dd'));	
			this.form_guardar.get("datoBecafecha3").setValue(datepipe.transform(this.global["Nino_ED"][0]['datoBecafecha3'], 'yyyy-MM-dd'));	
		}else if(this.global == null && this.form_guardar != undefined){
			this.limpiar_form_guardar();
		}
	}

	get f2(){ return this.form_guardar.controls;}

	limpiar_form_guardar(){
		this.form_guardar.reset();
	}

	guardar_ED(){
		var spinner = document.getElementById("spinner_ED");
		
		if (this.form_guardar.invalid) {
			console.log("Formato incorrecto del formulario");
			spinner.setAttribute("hidden", "true");
			return;
		}
		else{
			if(this.guardando == true)
				return;

			var r = confirm("¿Deseas continuar?");
			if (r== false ) {
				return;
			}else{
				this.form_guardar.disable();
				this.guardando = true;
				spinner.removeAttribute("hidden");

				this.http.put(this.url + "Nino_ED/" + this.form_guardar.value.miembroID, this.form_guardar.value, this.httpOptions).subscribe(data  => {
					if(data == "Sesión invalida") this.router.navigate(['/login'])
					spinner.setAttribute("hidden", "true");
					this.form_guardar.enable();
					window.scroll(0,0);
					this.mostrar_alert("Se guardó correctamente", "success", 5000, null);	
				},
				error  => {
					spinner.setAttribute("hidden", "true");
					this.form_guardar.enable();
					window.scroll(0,0);
					this.mostrar_alert("Ocurrió un error al guardar los datos, vuelve a intentarlo", "danger", 5000, null);
					console.log(error);
				});
			}
		}
	}
	mostrar_alert(msg : string, tipo : string, duracion : number, accion : string){
		this.visible = true;
		this.mensaje = msg;
		this.tipo = tipo;

		setTimeout(() => { 
			this.cerrar_alert();
		}, duracion
		);
	}
	cerrar_alert(){
		this.visible = false;
		this.mensaje = null;
		this.tipo = null;
		this.guardando = false;
	}
}