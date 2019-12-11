import { Component, OnInit, Input, Output, EventEmitter,ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient , HttpHeaders, HttpResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

@Component({
	selector: 'arte-ninos',
	templateUrl: './arte-ninos.component.html',
	styleUrls: ['./arte-ninos.component.css']
})
export class ArteNinosComponent implements OnInit, OnChanges {
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

	@Input('var_global') var_global: any;
	ngOnInit() {
		this.form_guardar = this.formBuilder.group({
			idNinosArt : ['', Validators.required],
			miembroID : ['', Validators.required],
			actividadartistica : [''],
			actividadfecha1 : [''],
			actividadfecha2 : [''],
			actividadfecha3 : [''],
			actividaddiciplina1 : [''],
			actividaddiciplina2 : [''],
			actividaddiciplina3 : [''],
			actividadlugar1 : [''],
			actividadlugar2 : [''],
			actividadlugar3 : [''],

			danza : [''],
			manualidades : [''],
			pintura : [''],
			teatro : [''],
			canto : [''],
			musica : [''],
			otro : [''],
			premioartefecha1 : [''],
			premioartefecha2 : [''],
			premioartefecha3 : [''],
			premioartediciplina1 : [''],
			premioartediciplina2 : [''],
			premioartediciplina3 : [''],
			premioartelugar1 : [''],
			premioartelugar2 : [''],
			premioartelugar3 : [''],
			hanotadoparticipar : [''],
			recibiopremio : ['']
		})
	}

	ngOnChanges(changes: SimpleChanges){
		var datepipe  = new DatePipe("en-US");

		if (this.global != undefined && this.global["Nino_Art"][0] != undefined) {
			this.form_guardar.patchValue(this.global["Nino_Art"][0]);	
			this.form_guardar.get("actividadfecha1").setValue(datepipe.transform(this.global["Nino_Art"][0]['actividadfecha1'], 'yyyy-MM-dd'));
			this.form_guardar.get("actividadfecha2").setValue(datepipe.transform(this.global["Nino_Art"][0]['actividadfecha2'], 'yyyy-MM-dd'));
			this.form_guardar.get("actividadfecha3").setValue(datepipe.transform(this.global["Nino_Art"][0]['actividadfecha3'], 'yyyy-MM-dd'));

			this.form_guardar.get("premioartefecha1").setValue(datepipe.transform(this.global["Nino_Art"][0]['premioartefecha1'], 'yyyy-MM-dd'));
			this.form_guardar.get("premioartefecha2").setValue(datepipe.transform(this.global["Nino_Art"][0]['premioartefecha2'], 'yyyy-MM-dd'));
			this.form_guardar.get("premioartefecha3").setValue(datepipe.transform(this.global["Nino_Art"][0]['premioartefecha3'], 'yyyy-MM-dd'));
			
		}else if(this.global == null && this.form_guardar != undefined){
			this.limpiar_form_guardar();
		}
	}

	get f2(){ return this.form_guardar.controls;}

	limpiar_form_guardar(){
		this.form_guardar.reset();
	}

	guardar_ART(){
		var spinner = document.getElementById("spinner_art");
		
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

				this.http.put(this.url + "Nino_Art/" + this.form_guardar.value.miembroID, this.form_guardar.value, this.httpOptions).subscribe(data  => {
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
