import { Component, OnInit } from '@angular/core';
import { HttpClient , HttpHeaders, HttpResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms' 

@Component({
	selector: 'historial',
	templateUrl: './historial.component.html',
	styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
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

	//form buscar
	form_buscar : FormGroup
	submited : boolean = true;
	hora : any;

	//Resultado
	historial : any;

	guardando :boolean = false;

	constructor(
		private http : HttpClient, 
		private formBuilder: FormBuilder,
		private router: Router
		) { }

	ngOnInit() {
		this.form_buscar = this.formBuilder.group({
			miembroID: ['', Validators.required]
		});
	}

	get f2(){ return this.form_buscar.controls;}

	obtener_historial(){
		this.limpiar(false);

		var response = this.http.get(this.url + "historial?id=" + this.form_buscar.value.miembroID, this.httpOptions);
		response.subscribe((resultado : any)=> {
			if(resultado == "Sesión invalida") this.router.navigate(['/login'])

			resultado.length > 0 ?  this.historial = resultado : this.mostrar_alert("No hay nada que mostrar", "info");
		},
		error =>{
			this.mostrar_alert("Verifica el número de miembro", "warning");
		});
	}

	mostrar_alert(msg : string, tipo : string){
		this.visible = true;
		this.mensaje = msg;
		this.tipo = tipo;
		
		setTimeout(() => { 
			var input = document.getElementById("miembroID");
			input.focus();
			this.cerrar_alert();
			this.form_buscar.reset();
		}, this.duracion
		);
	}
	cerrar_alert(){
		this.visible = false;
		this.mensaje = null;
		this.tipo = null;
		this.submited = false;

		var input = document.getElementById("miembroID");
		input.focus();
		this.form_buscar.reset();
	}

	limpiar(reset : boolean){
		this.historial = null;
		if (reset) {
			this.form_buscar.reset();
		}
		var input = document.getElementById("miembroID");
		input.focus();
	}
}
