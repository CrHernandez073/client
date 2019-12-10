import { Component, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';


@Component({ 
  selector: 'telefono-donante',
  templateUrl: './telefono-donante.component.html',
  styleUrls: ['./telefono-donante.component.css'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class TelefonoDonanteComponent implements OnInit , OnChanges {
  @Input('gl_donante') gl_donante: any;
  @Input() prop!: number;
  
  ngOnChanges(changes: SimpleChanges) {
    if (this.form_buscar !== undefined) {
      this.form_buscar.get('buscarID').setValue(this.gl_donante);
      this.buscar_telefono();
      this.traer_donante();
    }
  }
  
  @Output() donante_variable= new EventEmitter<number>();
  
//Cambio a padre
cambiar_valor_Padre(){
  this.donante_variable.emit(this.form_buscar.value.buscarID);
}

  //busqueda
  resultado: any;
  //fechas
  fecha1: any;
  fecha2: any;
  //Tabla
  arreglo: any;

  //radio Option
  agregar_o_modificar: string = 'nuevo';

  //Formularios
  form_buscar: FormGroup;
  form_agregar: FormGroup;

  //validacion
  submit_buscar = false;
  submit_agregar = false;
  //alert
  visible: boolean=false;
  mensaje: string;
  tipo:any;

  httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json',
			'miembroID': localStorage.getItem('miembroID'),
			'Authorization': localStorage.getItem('Authorization')
		})
	};

  url = "https://api-remota.conveyor.cloud/api/";

  constructor(private http: HttpClient, private formBuilder: FormBuilder, private router: Router) { }

  ngOnInit() {
    //Se rellena los campos al formulario 
    //buscar
    this.form_buscar = this.formBuilder.group({
      buscarID: ['', Validators.required],
    })

    //agregar
    this.form_agregar = this.formBuilder.group({
      telefonoID:['', Validators.required],
      donacionID: ['', Validators.required],
      tipo1: ['', Validators.required],
      telefono1: ['', Validators.required],
      lada1: [''],
      extension1: [''],
      observacion1: [''],
      tipo2: [''],
      telefono2: [''],
      lada2: [''],
      extension2: [''],
      observacion2: [''],
      tipo3: [''],
      telefono3: [''],
      lada3: [''],
      extension3: [''],
      observacion3: [''],
      nombre_donante:[''],
      nombre_Fiscal:[''],

    })
  }

  //controls Buscar
  get f_B() {
    return this.form_buscar.controls;
  }

  //controls Agregar
  get f_A() {
    return this.form_agregar.controls;
  }

  traer_donante(){
    var response = this.http.get(this.url + "get/nombre?RDonID=" + this.form_buscar.value.buscarID,this.httpOptions);
      response.subscribe((data: any[]) => {
        this.resultado = data;
        if (this.resultado == "Sesión invalida") {          
          this.router.navigate(['/login']);
          return;
         }
  
        this.form_agregar.get('nombre_Fiscal').setValue(this.resultado[0].nombrefiscal);
        this.form_agregar.get('nombre_donante').setValue(this.resultado[0].nombres);
      },
      error => {
        console.log("Error", error)
      });
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
  

  buscar_telefono() {
    var spinner_buscar_telefono = document.getElementById("spinner_buscar_telefono");
    this.submit_buscar = true;
    if (this.form_buscar.invalid) {
      return;
    }
    else {
      spinner_buscar_telefono.removeAttribute("hidden");
      //select mediante el id
      var response = this.http.get(this.url + "Telefonodonante/" + this.form_buscar.value.buscarID,this.httpOptions);
      response.subscribe((data: any[]) => {
        this.resultado = data;
        if (this.resultado == "Sesión invalida") {          
          this.router.navigate(['/login']);
          return;
         }
  
        this.form_agregar.get('telefonoID').setValue(this.resultado.telefonoID);
        this.form_agregar.get('donacionID').setValue(this.resultado.donacionID);
        this.form_agregar.get('tipo1').setValue(this.resultado.tipo1);
        this.form_agregar.get('telefono1').setValue(this.resultado.telefono1);
        this.form_agregar.get('lada1').setValue(this.resultado.lada1);
        this.form_agregar.get('extension1').setValue(this.resultado.extension1);
        this.form_agregar.get('observacion1').setValue(this.resultado.observacion1);
        this.form_agregar.get('tipo2').setValue(this.resultado.tipo2);
        this.form_agregar.get('telefono2').setValue(this.resultado.telefono2);
        this.form_agregar.get('lada2').setValue(this.resultado.lada2);
        this.form_agregar.get('extension2').setValue(this.resultado.extension2);
        this.form_agregar.get('observacion2').setValue(this.resultado.observacion2);
        this.form_agregar.get('tipo3').setValue(this.resultado.tipo3);
        this.form_agregar.get('telefono3').setValue(this.resultado.telefono3);
        this.form_agregar.get('lada3').setValue(this.resultado.lada3);
        this.form_agregar.get('extension3').setValue(this.resultado.extension3);
        this.form_agregar.get('observacion3').setValue(this.resultado.observacion3);
        
        spinner_buscar_telefono.setAttribute("hidden", "true");
        this.mostrar_alert("Busqueda existosa.", 'primary', 5000, null);
      },
        error => {
          spinner_buscar_telefono.setAttribute("hidden", "true");
          this.mostrar_alert("Ocurrió un error, Favor de llenar los campos correctamente.", 'danger', 5000, null);
          console.log("Error", error)
        });
    }
  }

  modificar_telefono() {
    this.submit_agregar = true;
  if (this.form_agregar.invalid) {   
    this.mostrar_alert("Favor de llenar los campos correctamente.", 'danger', 5000, null);
    return;
  }    
    var spinner_agregar_telefono = document.getElementById("spinner_agregar_telefono");
    spinner_agregar_telefono.removeAttribute("hidden");

    //Update mediante el id y los campos de agregar
    this.http.put(this.url + "Telefonodonante/" + this.form_buscar.value.buscarID, this.form_agregar.value,this.httpOptions).subscribe(data => {
      this.resultado=data;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }

      spinner_agregar_telefono.setAttribute("hidden", "true");
      
      this.mostrar_alert("Telefono Moficado.", 'primary', 5000, null);
    },
      error => {
        spinner_agregar_telefono.setAttribute("hidden", "true");
        this.mostrar_alert("Ocurrió un error, Favor de llenar los campos correctamente.", 'danger', 5000, null);
        console.log("Error", error);
      });
  }

  //reset buscar
  clean_Buscar() {
    this.submit_buscar = false;
    this.form_buscar.reset();
  }

  //reset agregar
  clean_Agregar() {
    this.submit_agregar = false;
    this.form_agregar.reset();
  }

}


