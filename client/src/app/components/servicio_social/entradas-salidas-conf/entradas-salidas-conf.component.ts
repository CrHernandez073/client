import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient , HttpHeaders, HttpResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'entradas-salidas-conf',
	templateUrl: './entradas-salidas-conf.component.html',
	styleUrls: ['./entradas-salidas-conf.component.css']
})
export class EntradasSalidasConfComponent implements OnInit {
	historial : any;

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
	duracion: number = 1000; //1000 es 1 SEG

	horas_acumuladas : any = 0;

	@ViewChild('id', {static: false})id: number;

	datos_check : any;
	submited : boolean = true;

	constructor(
		private http : HttpClient,
		private router: Router
		){}

	ngOnInit() {
	}

	limpiar(){
		var miembroID = (<HTMLInputElement>document.getElementById("miembroID"));
		miembroID.value="";
		this.historial = null;
		this.horas_acumuladas = 0;
		
		miembroID.focus();
	}

	mi_historial(){
		var miembroID = (<HTMLInputElement>document.getElementById("miembroID"));
		if(miembroID.value==""){
			this.limpiar();
			return;
		}

		var spinner_historial = document.getElementById("spinner_historial");
		spinner_historial.removeAttribute("hidden");

		var response = this.http.get(this.url + "RegistroEntradaSalidaStaff?id=" + miembroID.value, this.httpOptions);
		response.subscribe((resultado : any)=> {
			if(resultado == "Sesión invalida") this.router.navigate(['/login'])
				spinner_historial.setAttribute("hidden", "true");
			resultado.length > 0 ?  this.calcular_num_horas(resultado.reverse()) : alert("No hay nada que mostrar");
		},
		error =>{
			spinner_historial.setAttribute("hidden", "true");
			alert("Error al consultar, intentalo mas tarde.");
		});
	}

	calcular_num_horas(historial : any){
		this.horas_acumuladas = 0;
		this.historial = historial;

		for(let i = 0; i < historial.length; i++){
			if (historial[i].fechasalida != null){
				var milisegundos = Date.parse(historial[i].fechasalida) - Date.parse(historial[i].fechaentrada);
				var horas = milisegundos / 1000 / 60 / 60;

				this.horas_acumuladas += horas;
			}
		}

		this.horas_acumuladas = this.horas_acumuladas.toFixed(2)
	}

	abrir_modal(valores : any){
		this.datos_check = valores;
		
		var datepipe  = new DatePipe("en-US");
		var fechaentrada = (<HTMLInputElement>document.getElementById("fechaentrada"));
		var horaentrada = (<HTMLInputElement>document.getElementById("horaentrada"));
		var fechasalida = (<HTMLInputElement>document.getElementById("fechasalida"));
		var horasalida = (<HTMLInputElement>document.getElementById("horasalida"));

		fechaentrada.value = datepipe.transform(valores.fechaentrada, 'yyyy-MM-dd');
		horaentrada.value = datepipe.transform(valores.fechaentrada, 'HH:mm:ss');
		fechasalida.value =  datepipe.transform(valores.fechaentrada, 'yyyy-MM-dd'); //Se pone la entrada para evitar que pueda tener mas de 24 hrs
		horasalida.value = datepipe.transform(valores.fechasalida, 'HH:mm');
	}

	//Sólo podrá modificar la salida
	modificar_salida(){
		var horaentrada = (<HTMLInputElement>document.getElementById("horaentrada"));
		var horasalida = (<HTMLInputElement>document.getElementById("horasalida"));

		if(horaentrada.value >= horasalida.value || horasalida.value == null)
		{
			alert("Ingresa una hora de salida válida");
			return;
		}
		

		var datepipe  = new DatePipe("en-US");
		this.datos_check.fechasalida = datepipe.transform(this.datos_check.fechaentrada, 'yyyy-MM-dd') + " " + horasalida.value;

		this.http.put(this.url + "RegistroEntradasStaffs/" + this.datos_check.idRegistroentrada, this.datos_check, this.httpOptions).subscribe(data  => {
			if(data == "Sesión invalida") {
				document.getElementById("cerrar_modal").click();
				this.router.navigate(['/login'])
				return;
			}
			this.mostrar_alert("Se ha guardado la salida", "success")
			this.calcular_num_horas(this.historial);

			setTimeout(() => { 
				document.getElementById("cerrar_modal").click();
			}, this.duracion
			);
			
		},
		error  => {
			this.mostrar_alert("Error guardar la salida", "danger")	
			console.log(error);
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
		this.visible = false;
		this.mensaje = null;
		this.tipo = null;
	}
}
