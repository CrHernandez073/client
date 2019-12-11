import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'contacto-donante',
  templateUrl: './contacto-donante.component.html',
  styleUrls: ['./contacto-donante.component.css'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class ContactoDonanteComponent implements OnInit, OnChanges {
  @Input('gl_donante') gl_donante: any;
  @Input() prop!: number;
  
  ngOnChanges(changes: SimpleChanges) {
    if (this.form_buscar !== undefined) {
      this.form_buscar.get('buscarID').setValue(this.gl_donante);
      this.buscar_contacto();
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

  constructor(private http: HttpClient, private formBuilder: FormBuilder,private router: Router) { }

  ngOnInit() {
    //Se rellena los campos al formulario 
    //buscar
    this.form_buscar = this.formBuilder.group({
      buscarID: ['', Validators.required],
    })

    //agregar
    this.form_agregar = this.formBuilder.group({
      contactoID: ['', Validators.required],
      donacionID: ['', Validators.required],
      nombre1: ['', Validators.required],
      paterno1: ['', Validators.required],
      materno1: [''],
      relacion1: ['', Validators.required],
      calle1: [''],
      colonia1: [''],
      noexterior1: [''],
      nointerior1: [''],
      cp1: [''],
      pais1: ['', Validators.required],
      estado1: ['', Validators.required],
      municipio1: ['', Validators.required],
      email1: ['',[Validators.required,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
      fechanacimiento1: [''],
      telefono1: ['',],
      lada1: [''],
      observacion1: [''],
      nombre2: [''],
      paterno2: [''],
      materno2: [''],
      relacion2: [''],
      calle2: [''],
      colonia2: [''],
      noexterior2: [''],
      nointerior2: [''],
      cp2: [''],
      pais2: [''],
      estado2: [''],
      municipio2: [''],
      email2: ['',[Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
      fechanacimiento2: [''],
      telefono2: [''],
      lada2: [''],
      observacion2: [''],
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
  
  buscar_contacto() {
    //spinner
    var spinner_buscar_contacto = document.getElementById("spinner_buscar_contacto");
    this.submit_buscar = true;
      spinner_buscar_contacto.removeAttribute("hidden");
      //select mediante el id
      var response = this.http.get(this.url + "Contacto/" + this.form_buscar.value.buscarID,this.httpOptions);
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
      response.subscribe((data: any[]) => {
        this.resultado = data;
        if (this.resultado == "Sesión invalida") {          
          this.router.navigate(['/login']);
          return;
         }
        //transformar fecha formato
        var datePipe = new DatePipe("en-US");
        this.resultado.fechanacimiento1 = datePipe.transform(this.resultado.fechanacimiento1, 'yyyy-MM-dd');
        this.resultado.fechanacimiento2 = datePipe.transform(this.resultado.fechanacimiento2, 'yyyy-MM-dd');
        this.form_agregar.get('contactoID').setValue(this.resultado.contactoID);
        this.form_agregar.get('donacionID').setValue(this.resultado.donacionID);
        this.form_agregar.get('nombre1').setValue(this.resultado.nombre1);
        this.form_agregar.get('paterno1').setValue(this.resultado.paterno1);
        this.form_agregar.get('materno1').setValue(this.resultado.materno1);
        this.form_agregar.get('relacion1').setValue(this.resultado.relacion1);
        this.form_agregar.get('calle1').setValue(this.resultado.calle1);
        this.form_agregar.get('colonia1').setValue(this.resultado.colonia1);
        this.form_agregar.get('noexterior1').setValue(this.resultado.noexterior1);
        this.form_agregar.get('nointerior1').setValue(this.resultado.nointerior1);
        this.form_agregar.get('cp1').setValue(this.resultado.cp1);
        this.form_agregar.get('pais1').setValue(this.resultado.pais1);
        this.form_agregar.get('estado1').setValue(this.resultado.estado1);
        this.form_agregar.get('municipio1').setValue(this.resultado.municipio1);
        this.form_agregar.get('email1').setValue(this.resultado.email1);
        this.form_agregar.get('fechanacimiento1').setValue(this.resultado.fechanacimiento1);
        this.form_agregar.get('telefono1').setValue(this.resultado.telefono1);
        this.form_agregar.get('lada1').setValue(this.resultado.lada1);
        this.form_agregar.get('observacion1').setValue(this.resultado.observacion1);
        this.form_agregar.get('nombre2').setValue(this.resultado.nombre2);
        this.form_agregar.get('paterno2').setValue(this.resultado.paterno2);
        this.form_agregar.get('materno2').setValue(this.resultado.materno2);
        this.form_agregar.get('relacion2').setValue(this.resultado.relacion2);
        this.form_agregar.get('calle2').setValue(this.resultado.calle2);
        this.form_agregar.get('colonia2').setValue(this.resultado.colonia2);
        this.form_agregar.get('noexterior2').setValue(this.resultado.noexterior2);
        this.form_agregar.get('nointerior2').setValue(this.resultado.nointerior2);
        this.form_agregar.get('cp2').setValue(this.resultado.cp2);
        this.form_agregar.get('pais2').setValue(this.resultado.pais2);
        this.form_agregar.get('estado2').setValue(this.resultado.estado2);
        this.form_agregar.get('municipio2').setValue(this.resultado.municipio2);
        this.form_agregar.get('email2').setValue(this.resultado.email2);
        this.form_agregar.get('fechanacimiento2').setValue(this.resultado.fechanacimiento2);
        this.form_agregar.get('telefono2').setValue(this.resultado.telefono2);
        this.form_agregar.get('lada2').setValue(this.resultado.lada2);
        this.form_agregar.get('observacion2').setValue(this.resultado.observacion2);
        spinner_buscar_contacto.setAttribute("hidden", "true");
        this.mostrar_alert("Busqueda existosa.", 'primary', 5000, null);
      },
        error => {
        this.mostrar_alert("Ocurrió un error, Favor de llenar los campos correctamente.", 'danger', 5000, null);
          spinner_buscar_contacto.setAttribute("hidden", "true");
          console.log("Error", error)
        });
   
  }

  modificar_evento() {
    this.submit_agregar = false;
    if (this.form_agregar.invalid) {
      this.submit_agregar = true;
      this.mostrar_alert("Ocurrió un error, Favor de llenar los campos requeridos.", 'danger', 5000, null);
      return;
    }
    var spinner_agregar_fdonante = document.getElementById("spinner_agregar_fdonante");
    spinner_agregar_fdonante.removeAttribute("hidden");
    //Update mediante el id y los campos de agregar
    this.http.put(this.url + "Contacto/" + this.form_agregar.value.donacionID, this.form_agregar.value,this.httpOptions).subscribe(data => {
      this.resultado=data;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
      spinner_agregar_fdonante.setAttribute("hidden", "true");
      
        this.mostrar_alert("Contacto modificado.", 'primary', 5000, null);
    },
      error => {
        spinner_agregar_fdonante.setAttribute("hidden", "true");
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

