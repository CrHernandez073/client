import { Component, OnInit,Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
	selector: 'contenedor-ninos',
	templateUrl: './contenedor-ninos.component.html',
	styleUrls: ['./contenedor-ninos.component.css']
})
export class ContenedorNinosComponent implements OnInit {
	url = "https://api-remota.conveyor.cloud/api/";

	//Variables globales
	global: any = undefined;
	agregar_o_modificar: string = 'nuevo';
	
	//form buscar
	form_buscar : FormGroup;
	submitted = false;

	//Todo para el progressbar
	buscando : boolean = false;
	porcentaje_actual = 0;
	tipo_progress = "info";

	//Todo para el alert
	visible : boolean = false;
	tipo : string = null;
	mensaje : string = null;

	puesto: any;

	constructor(
		private http : HttpClient, 
		private formBuilder: FormBuilder,
		private router: Router
		) { 
			
		}

	ngOnInit(){
		//Se rellena los campos al formulario 
		this.form_buscar = this.formBuilder.group({
			miembroID: ['', Validators.required]
		})
		this.puesto=localStorage.getItem('puesto');
	}

	redireccion_menu(){
		this.router.navigate(['']);
	}

	asig_hijo_a_padre($event){
		this.agregar_o_modificar = "modificar";
		this.form_buscar.get('miembroID').setValue($event);
		this.busq_Form();
	}

	radioChange(event: any){

		this.agregar_o_modificar = event.target.value;

		var eleccion = document.getElementById("btn_buscar");
		var caja_modificar_miembroID =  document.getElementById("miembroID");

		if (this.agregar_o_modificar == "nuevo"){
			this.limpiar_form_buscar();
			this.global = null;

			eleccion.setAttribute("disabled", "true");
			caja_modificar_miembroID.setAttribute("disabled", "true");
		}
		else if(this.agregar_o_modificar == "modificar"){
			eleccion.removeAttribute("disabled");
			eleccion.setAttribute("enable", "true");
			caja_modificar_miembroID.removeAttribute("disabled");
			caja_modificar_miembroID.setAttribute("enable", "true");

			this.limpiar_form_buscar();
			this.global = null;
		}
	}

	get f(){ return this.form_buscar.controls;}

	busq_Form(){
		if (this.buscando == true){
			return;
		} 

		var spinner_buscar = document.getElementById("spinner_buscar");

		spinner_buscar.removeAttribute("hidden");

		this.submitted = true;

		if (this.form_buscar.invalid) {
			spinner_buscar.setAttribute("hidden", "true");
			return;
		}
		else{
			this.form_buscar.disable();
			this.global = undefined;
			this.buscando = true;

			var response = this.http.get(this.url + "Miembro/" + this.form_buscar.value.miembroID);
			response.subscribe((resultado : any[])=> {
				this.global = resultado;
				
				spinner_buscar.setAttribute("hidden", "true");

				this.form_buscar.enable();
				this.porcentaje_actual = 100;
				
				this.cerrar_progress();
			},
			error =>{
				this.global = null;
				this.buscando = false;
				
				spinner_buscar.setAttribute("hidden", "true");
				this.form_buscar.enable();

				this.mostrar_alert("No se encontraron resultados", "danger", 3000, null);
				console.log("Error", error);
			});
		}
	}

	limpiar_form_buscar(){
		this.submitted =false;
		this.form_buscar.reset();
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
	}
	cerrar_progress(){
		setTimeout(() => {
			//Todo para el progressbar
			this.buscando  = false;
			this.porcentaje_actual = 0;
			this.tipo_progress = "info";
		}, 1500
		);
	}
}
