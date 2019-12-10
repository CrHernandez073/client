import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'dfiscales-donante',
  templateUrl: './dfiscales-donante.component.html',
  styleUrls: ['./dfiscales-donante.component.css']
})
export class DFiscalesDonanteComponent implements OnInit, OnChanges {
  @Input('gl_donante') gl_donante: any;
  @Input() prop!: number;
  
  ngOnChanges(changes: SimpleChanges) {
    if (this.form_buscar !== undefined) {
      this.form_buscar.get('buscarID').setValue(this.gl_donante);
      this.buscar_dfiscales();      
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

constructor(private http: HttpClient, private formBuilder: FormBuilder) { }

ngOnInit() {
  //Se rellena los campos al formulario 
  //buscar
  this.form_buscar = this.formBuilder.group({
    buscarID: ['', Validators.required],
  })

  //agregar
  this.form_agregar = this.formBuilder.group({
    datosfiscalesID:['', Validators.required],
    donacionID: ['', Validators.required],
    rfc :['', Validators.required],
    nombre :['', Validators.required],
    calle	:[''],
    noexterior:[''],
    nointerior:[''],
    colonia	:[''],
    cp :[''],
    pais 	:['', Validators.required],
    estado:['', Validators.required],
    municipio	:['', Validators.required],
    email1:['',[Validators.required,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    email2 :['',[Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
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

traer_donante(){
  var response = this.http.get(this.url + "get/nombre?RDonID=" + this.form_buscar.value.buscarID,this.httpOptions);
    response.subscribe((data: any[]) => {
      this.resultado = data;
      this.form_agregar.get('nombre_Fiscal').setValue(this.resultado[0].nombrefiscal);
      this.form_agregar.get('nombre_donante').setValue(this.resultado[0].nombres);
    },
    error => {
      console.log("Error", error)
    });
}
buscar_dfiscales() {
  //spinner
  var spinner_buscar_dfiscales = document.getElementById("spinner_buscar_dfiscales");
  this.submit_buscar = true;

  if (this.form_buscar.invalid) {
    return;
  }
  else {
    spinner_buscar_dfiscales.removeAttribute("hidden");
    //select mediante el id
    var response = this.http.get(this.url + "DFiscal/" + this.form_buscar.value.buscarID,this.httpOptions);
    response.subscribe((data: any[]) => {
      this.resultado = data;

      this.form_agregar.get('datosfiscalesID').setValue(this.resultado.datosfiscalesID);
      this.form_agregar.get('donacionID').setValue(this.resultado.donacionID);

      this.form_agregar.get('rfc').setValue(this.resultado.rfc);
      this.form_agregar.get('nombre').setValue(this.resultado.nombre);
      this.form_agregar.get('calle').setValue(this.resultado.calle);
      this.form_agregar.get('noexterior').setValue(this.resultado.noexterior);
      this.form_agregar.get('nointerior').setValue(this.resultado.nointerior);
      this.form_agregar.get('colonia').setValue(this.resultado.colonia);
      this.form_agregar.get('cp').setValue(this.resultado.cp);
      this.form_agregar.get('pais').setValue(this.resultado.pais);
      this.form_agregar.get('estado').setValue(this.resultado.estado);
      this.form_agregar.get('municipio').setValue(this.resultado.municipio);
      this.form_agregar.get('email1').setValue(this.resultado.email1);
      this.form_agregar.get('email2').setValue(this.resultado.email2);
      spinner_buscar_dfiscales.setAttribute("hidden", "true");
      this.mostrar_alert("Busqueda existosa.", 'primary', 5000, null);
    },
      error => {
        spinner_buscar_dfiscales.setAttribute("hidden", "true");
        this.mostrar_alert("Ocurrió un error, Favor de llenar los campos correctamente.", 'danger', 5000, null);
        console.log("Error", error)
      });
  }
}

modificar_dfiscales() {
  this.submit_agregar = false;
  if (this.form_agregar.invalid) {
    this.submit_agregar = true;
    this.mostrar_alert("Ocurrió un error, Favor de llenar los campos requeridos.", 'danger', 5000, null);
    return;
  }
  var spinner_agregar_dfiscales = document.getElementById("spinner_agregar_dfiscales");
  spinner_agregar_dfiscales.removeAttribute("hidden");

  //Update mediante el id y los campos de agregar
  this.http.put(this.url + "DFiscal/" + this.form_buscar.value.buscarID, this.form_agregar.value,this.httpOptions).subscribe(data => {
    spinner_agregar_dfiscales.setAttribute("hidden", "true");
    
    this.mostrar_alert("Datos Fiscales modificados.", 'primary', 5000, null);
  },
    error => {
      spinner_agregar_dfiscales.setAttribute("hidden", "true");
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

