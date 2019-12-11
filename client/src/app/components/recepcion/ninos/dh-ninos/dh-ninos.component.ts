import { Component, OnInit, Input, Output, EventEmitter,ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient , HttpHeaders, HttpResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

@Component({
	selector: 'dh-ninos',
	templateUrl: './dh-ninos.component.html',
	styleUrls: ['./dh-ninos.component.css']
})
export class DHNinosComponent implements OnInit, OnChanges {
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

	submitted2  :boolean = false;
	constructor(
		private http : HttpClient,
		private formBuilder: FormBuilder,
		private router: Router
		){}

	ngOnInit() {
		this.form_guardar = this.formBuilder.group({
			idNinosDH : ['', Validators.required],
			miembroID : ['', Validators.required],
			
			alegre : [''],
			amigable : [''],
			callado     : [''],
			cooperador : [''],
			curioso : [''],
			comparte : [''],
			berrinches : [''],
			independiente : [''],
			imaginativo : [''],
			irritable : [''],
			miedo : [''],
			mojacama : [''],
			tolerante : [''],
			sociable : [''],
			responsable : [''],
			ordendo : [''],
			chupadedo : [''],
			golpea : [''],
			persistente : [''],
			timido : [''],
			hacetarea : [''],
			sustanciatoxica : [''],
			salirsalon : [''],
			intpadre : [''],
			intemadre : [''],
			intehermano : [''],
			intevecino : [''],
			inteabuelospat : [''],
			inteabuelosmat : [''],
			intemaestro : [''],
			problemaley : [''],
			intetio : [''],
			inteprimo : [''],
			inteamigoedad : [''],
			inteamigomayor : [''],
			adaptsituacion : [''],
			otro : [''],
			terapia : [''],
			motivoterapia : [''],
			tic : [''],
			pasatiempo : [''],
			obedece : [''],
			materialpeligroso : [''],
			reaccionobscuridad : [''],
			fobias : [''],
			duerme : [''],
			horassiesta : [''],
			horasduerme : [''],
			pesadilla : [''],
			insomnio : [''],
			rechinardiente : [''],
			suenointranquilo : [''],
			habla : [''],
			suenocorto : [''],
			otroproblema : [''],
			horastv : [''],
			minutostv : [''],
			companiatv : [''],
			horasPC : [''],
			minutosPC : [''],
			caricatura : [''],
			telenovelas : [''],
			videomusical : [''],
			documental : [''],
			concurso : [''],
			politica : [''],
			terror : [''],
			otroprograma : [''],
			visitafamiliar : [''],
			cine : [''],
			parquedivertido : [''],
			concierto : [''],
			salidaEU : [''],
			deporte : [''],
			redsocial : [''],
			otraactividad : [''],
			comesolo : [''],
			vistesolo : [''],
			lavadientesregular : [''],
			aseadespuesbano : [''],
			peinasolo : [''],
			lavamanosregular : [''],
		})
	}

	ngOnChanges(changes: SimpleChanges){
		if (this.global != undefined && this.global["Nino_DH"][0] != undefined) {
			this.form_guardar.patchValue(this.global["Nino_DH"][0]);	
		}else if(this.global == null && this.form_guardar != undefined){
			this.limpiar_form_guardar();
		}
	}

	get f2(){ return this.form_guardar.controls;}


	limpiar_form_guardar(){
		this.form_guardar.reset();
	}

	guardar_DH(){
		var spinner = document.getElementById("spinner_dh");
		
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

				this.http.put(this.url + "Nino_DH/" + this.form_guardar.value.miembroID, this.form_guardar.value, this.httpOptions).subscribe(data  => {
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
