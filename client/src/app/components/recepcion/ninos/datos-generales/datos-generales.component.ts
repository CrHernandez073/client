import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient , HttpHeaders, HttpResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subject, Observable } from 'rxjs';

import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { DomSanitizer } from '@angular/platform-browser'

import {FormBuilder, FormGroup, Validators} from '@angular/forms' 

import { analyzeAndValidateNgModules } from '@angular/compiler';

declare var $: any;

@Component({ selector: 'datos-generales', templateUrl: './datos-generales.component.html', styleUrls: ['./datos-generales.component.css']})

export class DatosGeneralesComponent  implements OnInit, OnChanges {
	//Todo para las variables globales
	@Output('padre_var') padre_var = new EventEmitter<any>();
	@Input('global') global: any; 
	@Input() prop!:any;
	@Input('agregar_o_modificar') agregar_o_modificar: any; 
	@Input() prop2!:any;

	$ : any;

	url = "https://api-remota.conveyor.cloud/api/";
	httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json',
			'miembroID': localStorage.getItem("miembroID"),
			'Authorization': localStorage.getItem("Authorization")
		})
	};

	miembros : any; datos_miembro : any; aux_datos : any;
	foto : any;

	//Todo para el progressbar
	mostrar_progress : boolean = false;
	porcentaje_sumar = 0;
	porcentaje_actual = 0;
	tipo_progress = "success";
	form_invalid : boolean = false;

	//Todo para el alert
	visible : boolean = false;
	tipo : string = null;
	mensaje : string = null;

	//form guardar
	form_guardar : FormGroup
	fecha: number = Date.now();

	constructor(
		private http : HttpClient, 
		private sanitazor: DomSanitizer,
		private formBuilder: FormBuilder,
		private router: Router
		) { 
	}

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
			curp : ['', Validators.required],
			nombres : ['', Validators.required],
			appaterno : ['', Validators.required],
			apmaterno : ['', Validators.required],
			fechanacimiento : ['', Validators.required],
			edad : [null,Validators.required],
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
			turno_asiste : ['', Validators.required],
		});

		WebcamUtil.getAvailableVideoInputs()
		.then((mediaDevices: MediaDeviceInfo[]) => {
			this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
		});
		this.fecha_actual();
	}

	ngOnChanges(changes: SimpleChanges){
		var datepipe  = new DatePipe("en-US");

		if (this.global != undefined) {
			this.form_guardar.patchValue(this.global["Nino_DG"][0]);
			this.form_guardar.patchValue(this.global);
			
			this.form_guardar.get("fechanacimiento").setValue(datepipe.transform(this.global["Nino_DG"][0]['fechanacimiento'], 'yyyy-MM-dd'));
			this.form_guardar.get("fechainscripcion").setValue(datepipe.transform(this.global["Nino_DG"][0]['fechainscripcion'], 'yyyy-MM-dd'));
			
			this.foto =  this.sanitazor.bypassSecurityTrustUrl("data:image/png;base64," + this.global["Nino_DG"][0]['foto']);
		}else if(this.global == null && this.form_guardar != undefined){
			this.limpiar_form_guardar();
			this.foto = "";
			this.cerrar_alert();
		}

		if(this.agregar_o_modificar == "nuevo" && this.form_guardar != undefined){
			document.getElementById("btn_modal_info").click();
			this.form_guardar.get("estado").setValue(true);
			this.fecha_actual();
		}
	}

	fecha_actual(){
		var hoy = new Date();
		var fech = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate();

		this.form_guardar.get("fechainscripcion").setValue(fech);
	}

	get f2(){ return this.form_guardar.controls;}

	press_guardar(){
		var spinner = document.getElementById("spinner");


		//1. verifica si el formularío no es invalido
		if (this.form_guardar.invalid) {
			console.log("Formato incorrecto del formulario");
			
			this.mostrar_progress = false;
			this.form_invalid = true;

			spinner.setAttribute("hidden", "true"); //oculta el spinner 
			return;
		}
		//2. El formulario no es invalido
		else{
			//2.1 Te sacará si ya estás guardando datos
			if(this.mostrar_progress == true)
				return;

			//2.2 Te preuntará si deseas continuar
			if (confirm("¿Deseas continuar?")== false) 
				return;

			//3. elegiste continuar
			spinner.removeAttribute("hidden");

			//4. Verificará que opción tienes seleccionada
			//5 Va a crear uno nuevo
			if (this.agregar_o_modificar == "nuevo"){
				//5.1 Obtendrá el último miembroID para crear el siguiente
				this.obtener_ultimo_miembro(); //
			}
			//6. Va a modificar
			else if (this.agregar_o_modificar == "modificar"){
				console.log("Va modificar")
				this.modificar();
			}
			else{
				console.log("se fue a ninguno")
			}
			spinner.setAttribute("hidden", "true");
		}
	}

	//Obtiene el último miembroID de la tabla miembros
	obtener_ultimo_miembro(){
		var response = this.http.get(this.url + "ultimoMiembro", this.httpOptions);
		response.subscribe((resultado : any)=> {
			if(resultado == "Sesión invalida"){
				this.router.navigate(['/login'])
				return;
			}
			//Selecciona valores por defecto de estos campos
			this.form_guardar.get('estado').setValue(true);
			this.form_guardar.get('visa').setValue(false);
			this.form_guardar.get('idNinosDG').setValue(resultado + 1);
			this.form_guardar.get('miembroID').setValue(resultado + 1);

			//5.2 Ya tiene el último miembroID ahora creará al nuevo miembro
			this.nuevo_miembro();
		},
		error =>{
			console.log("Error al obtener el último miembroID", error)
		});
	}

	//Guarda nuevo miembro y después internamente guarda los IDs para cada tabla del niño
	nuevo_miembro(){
		this.form_guardar.disable(); //Desactiva el formulario
		this.mostrar_progress = true;

		//5.3 Guardamos al niño en la tabla miembros
		this.datos_miembro = {
			miembroID : this.form_guardar.value.miembroID,
			estado : this.form_guardar.value.estado,
			tipo : "niño",
			sede: this.form_guardar.value.sede
		}

		this.http.post(this.url + 'miembro', this.datos_miembro, this.httpOptions).subscribe(data  => {
			if(data == "Sesión invalida"){
				this.router.navigate(['/login'])
				return;
			}
			this.porcentaje_actual = 20;
			this.porcentaje_sumar = 100/10;

			this.guardar_miembro_en_tabla("Nino_DG", "idNinosDG", this.form_guardar.value.idNinosDG, "Datos generales"); //Datos generales 
			this.guardar_miembro_en_tabla("Nino_NF", "idNinosNF", this.form_guardar.value.idNinosDG, "Núcleo familiar"); //Nucleo familiar
			this.guardar_miembro_en_tabla("Nino_ES", "idNinosES", this.form_guardar.value.idNinosDG, "Datos socioecónomicos"); //Socioeconomico
			this.guardar_miembro_en_tabla("Nino_DM", "idNinosDM", this.form_guardar.value.idNinosDG, "Datos médicos"); //Medicos
			this.guardar_miembro_en_tabla("Nino_ED", "idNinosED", this.form_guardar.value.idNinosDG, "Educación"); //educación
			this.guardar_miembro_en_tabla("Nino_Dep", "idNinosDep", this.form_guardar.value.idNinosDG, "Deporte"); //deporte
			this.guardar_miembro_en_tabla("Nino_Art", "idNinosArt", this.form_guardar.value.idNinosDG, "Arte"); //arte
			this.guardar_miembro_en_tabla("Nino_DH", "idNinosDH", this.form_guardar.value.idNinosDG, "Desarrollo humano"); //desarrollo humano

			window.scroll(0,0);
			this.modificar();
		},
		error  => {
			this.mostrar_alert("Ocurrió un error, inténtalo mas tarde", 'danger', 5000, null);
			this.form_guardar.enable();
			console.log("Error al guardar en la tabla miembro", error);
		});
	}

	//Modifica los valores
	modificar(){
		this.form_guardar.disable();
		this.mostrar_progress = true;

		var spinner = document.getElementById("spinner");
		if (this.webcamImage != null) {
			this.form_guardar.get("foto").setValue(this.webcamImage.imageAsBase64);
		}

		this.datos_miembro = {
			miembroID : this.form_guardar.value.miembroID,
			estado : this.form_guardar.value.estado,
			tipo : "niño",
			sede: this.form_guardar.value.sede
		}

		this.http.put(this.url + "miembro/" + this.form_guardar.value.miembroID, this.datos_miembro, this.httpOptions).subscribe(data  => {
			if(data == "Sesión invalida") this.router.navigate(['/login'])
				console.log("Miembro actualizado, guardando datos generales ...");
		},
		error  => {
			this.mostrar_alert("Ocurrió un error al guardar los datos, vuelve a intentarlo", "danger", 5000, null);
			console.log(error);
		});

		
		this.http.put(this.url + "Nino_DG1/" + this.form_guardar.value.miembroID, this.form_guardar.value, this.httpOptions).subscribe(data  => {
			if(data == "Sesión invalida") this.router.navigate(['/login'])
				spinner.setAttribute("hidden", "true");
			this.porcentaje_actual = 100;
			
			window.scroll(0,0);

			this.form_guardar.enable();
			this.mostrar_alert("Se guardó correctamente", "success", 4000, null);

			if(this.agregar_o_modificar == "nuevo"){
				document.getElementById("btn_modal_miembroID").click();	
			}
		},
		error  => {
			spinner.setAttribute("hidden", "true");
			this.form_guardar.enable();
			window.scroll(0,0);
			this.mostrar_alert("Ocurrió un error al guardar los datos, vuelve a intentarlo", "danger", 5000, null);
			console.log(error);
		});
	}

	//Método auxiliar que guarda para cada tabla sólo el ID y el miembroID
	guardar_miembro_en_tabla(tabla : string, columnaID : string, valorID : number, descripcion : string){
		
		var datos_aux = JSON.parse('{"'+columnaID+'":'+valorID+', "miembroID":'+valorID+'}');

		this.http.post(this.url + tabla, datos_aux, this.httpOptions).subscribe(data  => {
			if(data == "Sesión invalida") this.router.navigate(['/login'])

				console.log("Se han guardado: " + tabla);
			this.porcentaje_actual += this.porcentaje_sumar;;
		},
		error  => {
			console.log(error);
			window.scroll(0,0);
			this.tipo_progress = "warning";
			this.mensaje = "Reintentando guardar en: " + descripcion;
			this.mostrar_alert(this.mensaje, 'warning', 3000, "reintentar");

			setTimeout(() => { 
				this.guardar_miembro_en_tabla(tabla, columnaID, this.form_guardar.value.idNinosDG, descripcion);
			}, 3000
			);
			
		});
	}

	calcular_edad(event){
		var fecha_actual = new Date(Date.now());
		var fecha_nacimiento = new Date(event.srcElement.value)

		var edad =  fecha_actual.getFullYear() - fecha_nacimiento.getFullYear();
		this.form_guardar.get('edad').setValue(edad);

	}

	limpiar_form_guardar(){
		this.form_guardar.reset();
		this.mostrar_progress = false;
		this.porcentaje_actual = 0;
		this.porcentaje_sumar = 0;
	}

	mostrar_alert(msg : string, tipo : string, duracion : number, accion : string){
		this.visible = true;
		this.mensaje = msg;
		this.tipo = tipo;

		setTimeout(() => { 
			this.cerrar_alert();
			if (accion=="compleado") 
				this.limpiar_form_guardar();
		}, duracion
		);
	}
	cerrar_alert(){
		this.visible = false;
		this.mensaje = null;
		this.tipo = null;
		this.mostrar_progress = false;
	}

	// TODO PARA LA CÁMARA
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