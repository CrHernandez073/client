import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { DatePipe } from '@angular/common';

import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { DomSanitizer } from '@angular/platform-browser'

import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import { analyzeAndValidateNgModules } from '@angular/compiler';

@Component({ selector: 'datos-generales', templateUrl: './datos-generales.component.html', styleUrls: ['./datos-generales.component.css']})

export class DatosGeneralesComponent  implements OnInit, OnChanges {
	@Input('global') global: any; 
	@Input() prop!:any;

	@Input('agregar_o_modificar') agregar_o_modificar: any; 
	@Input() prop2!:any;

	url = "https://api-remota.conveyor.cloud/api/";
	miembros : any; datos_miembro : any; aux_datos : any;
	foto : any;

	//form guardar
	form_guardar : FormGroup
	submitted2 = false;

	constructor(
		private http : HttpClient, 
		private sanitazor: DomSanitizer,
		private formBuilder: FormBuilder
		) { }

	ngOnInit(){
		this.form_guardar = this.formBuilder.group({
			sede: ['', Validators.required],
			foto : [''],
			estado : [true, Validators.required],
			visa : [false],
			religion : [''],
			tallacamisa : [''],
			fechainscripcion : [''],
			idNinosDG : ['',],
			miembroID : [''],
			nombres : ['', Validators.required],
			appaterno : ['', Validators.required],
			apmaterno : ['', Validators.required],
			fechanacimiento : [''],
			edad : ['',(Validators.required, Validators.min(6), Validators.max(16))],
			lugarnacimiento : [''],
			nacionalidad : [''],
			sexo : ['',],
			derechohabiencia : [''],
			otroseguro : [''],
			vivecon : [''],
			telefono : [''],
			domcalle : [''],
			domcolonia : [''],
			domcodpost : [''],
			domdelegacion : [''],
			dommunicipio : [''],
			escuela : [''],
			escuelaturno : [''],
			recoge1nino : ['', Validators.required],
			parentrecoge1 : ['', Validators.required],
			emergencia1 : [''],
			parentemergencia1 : [''],
			telefonoemergencia1 : [''],
			emergencia2 : [''],
			parentemergencia2 : [''],
			telefonoemergencia2 : [''],
			emergencia3 : [''],
			parentemergencia3 : [''],
			telefonoemergencia3 : [''],

		});

		WebcamUtil.getAvailableVideoInputs()
		.then((mediaDevices: MediaDeviceInfo[]) => {
			this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
		});
	}

	ngOnChanges(changes: SimpleChanges){
		if (this.global != undefined) {
			this.form_guardar.patchValue(this.global["Nino_DG"][0]);
			this.form_guardar.patchValue(this.global);
			
			this.foto =  this.sanitazor.bypassSecurityTrustUrl("data:image/png;base64," + this.global["Nino_DG"][0]['foto']);
		}else if(this.global == null && this.form_guardar != undefined){
			this.limpiar_form_guardar();
			this.foto = "";
		}

		if(this.agregar_o_modificar == "nuevo")
			this.get_nuevo_miembro();
	}

	get f2(){ return this.form_guardar.controls;}

	limpiar_form_guardar(){
		this.submitted2 =false;
		this.form_guardar.reset();
	}

	guardar_DG(){
		this.submitted2 = true;
		var spinner = document.getElementById("spinner");

		if (this.form_guardar.invalid) {
			console.log("Formato incorrecto del formulario");
			console.log(this.form_guardar.value);
			spinner.setAttribute("hidden", "true");
			return;
		}
		else{

			var r = confirm("Estas seguro que deseas completar esta acción");
			if (r== false) {
				return;
			}
			
			spinner.removeAttribute("hidden");

			if (this.agregar_o_modificar == "nuevo"){
				console.log("Creando ...");
				this.nuevo();
			}
			else if (this.agregar_o_modificar == "modificar"){
				console.log("Modificando ...");
				this.modificar();
			}
			else{
				console.log("se fue a ninguno")
			}
		}
	}

	//Obtener nuevo miembro MÉTODO AUXILIAR
	get_nuevo_miembro(){
		var response = this.http.get(this.url + "ultimoMiembro");
		response.subscribe((resultado : number)=> {
			this.form_guardar.get('estado').setValue(true);
			this.form_guardar.get('visa').setValue(false);
			this.form_guardar.get('idNinosDG').setValue(resultado + 1);
			this.form_guardar.get('miembroID').setValue(resultado + 1);

			console.log(resultado + 1);
		},
		error =>{
			console.log("Error", error)
		});
	}

	nuevo(){
		this.form_guardar.disable();
		var spinner = document.getElementById("spinner");
		//1. Recalcula el número de miembro, en dado caso que ya hayan registrado uno mientras estaba en proceso
		this.get_nuevo_miembro()
		
		//2. Guardamos al niño en la tabla miembros
		this.datos_miembro = {
			miembroID : this.form_guardar.value.miembroID,
			estado : this.form_guardar.value.estado,
			tipo : "niño",
			sede: this.form_guardar.value.sede
		}

		this.http.post(this.url + 'miembroes', this.datos_miembro).subscribe(data  => {
			alert(this.form_guardar.value.nombres + " se agregó correctamente. Su No. Miembro es: " + this.form_guardar.value.miembroID);
		},
		error  => {
			console.log("Error al guardar en la tabla miembro", error);
		});

		if (this.webcamImage != null) {
			this.form_guardar.get("foto").setValue(this.webcamImage.imageAsBase64);
		}
		
		this.http.post(this.url + "Nino_DG1", this.form_guardar.value).subscribe(data  => {
			alert(this.form_guardar.value.nombres + " se han guardado sus datos generales");

			this.guardar_miembro_en_tabla("Nino_NF", "idNinosNF", this.form_guardar.value.idNinosDG); //Nucleo familiar
			this.guardar_miembro_en_tabla("Nino_ES", "idNinosES", this.form_guardar.value.idNinosDG); //Socioeconomico
			this.guardar_miembro_en_tabla("Nino_DM", "idNinosDM", this.form_guardar.value.idNinosDG); //Medicos
			this.guardar_miembro_en_tabla("Nino_ED", "idNinosED", this.form_guardar.value.idNinosDG); //educación
			this.guardar_miembro_en_tabla("Nino_Dep", "idNinosDep", this.form_guardar.value.idNinosDG); //deporte
			this.guardar_miembro_en_tabla("Nino_Art", "idNinosArt", this.form_guardar.value.idNinosDG); //arte
			this.guardar_miembro_en_tabla("Nino_DH", "idNinosDH", this.form_guardar.value.idNinosDG); //desarrollo humano

			spinner.setAttribute("hidden", "true");
			this.form_guardar.enable();
		},
		error  => {
			console.log("Error al guardar datos generales.", error);
			spinner.setAttribute("hidden", "true");
			this.form_guardar.enable();
		});
	}

	modificar(){
		this.form_guardar.disable();
		//GUARDAR DATOS GENERALES MIEMBRO
		var spinner = document.getElementById("spinner");

		if (this.webcamImage != null) {
			this.form_guardar.get("foto").setValue(this.webcamImage.imageAsBase64);
		}
		
		this.http.put(this.url + "Nino_DG1/" + this.form_guardar.value.miembroID, this.form_guardar.value).subscribe(data  => {
			alert("Se han guardado las modificaciones correctamente");

			spinner.setAttribute("hidden", "true");
			this.form_guardar.enable();
		},
		error  => {
			console.log(error);
			spinner.setAttribute("hidden", "true");
			this.form_guardar.enable();
		});
	}
	guardar_miembro_en_tabla(tabla : string, columnaID : string, valorID : number){
		
		var datos_aux = JSON.parse('{"'+columnaID+'":'+valorID+', "miembroID":'+valorID+'}');

		this.http.post(this.url + tabla, datos_aux).subscribe(data  => {
			console.log("Se han guardado: " + tabla);
		},
		error  => {
			console.log("Error al guardar en la tabla: " + tabla, error);
		});
	}


	// toggle webcam on/off
	public showWebcam = false;
	public allowCameraSwitch = true;
	public multipleWebcamsAvailable = false;
	public deviceId: string;
	public videoOptions: MediaTrackConstraints = {};
	public errors: WebcamInitError[] = [];
	public webcamImage: WebcamImage = null;

	private trigger: Subject<void> = new Subject<void>();
	private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

	public tomar_foto(): void {
		this.trigger.next();
		this.toggleWebcam();
		this.foto ="" + this.webcamImage.imageAsDataUrl;
	}

	public toggleWebcam(): void {
		this.showWebcam = !this.showWebcam;
	}

	public handleInitError(error: WebcamInitError): void {
		this.errors.push(error);
	}

	public handleImage(webcamImage: WebcamImage): void {
		this.webcamImage = webcamImage;
	}

	public cameraWasSwitched(deviceId: string): void {
		this.deviceId = deviceId;
	}

	public get triggerObservable(): Observable<void> {
		return this.trigger.asObservable();
	}

	public get nextWebcamObservable(): Observable<boolean|string> {
		return this.nextWebcam.asObservable();
	}
}