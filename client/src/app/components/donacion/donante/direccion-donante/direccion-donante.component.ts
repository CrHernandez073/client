import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'direccion-donante',
  templateUrl: './direccion-donante.component.html',
  styleUrls: ['./direccion-donante.component.css']
})
export class DireccionDonanteComponent implements OnInit, OnChanges {
  @Input('gl_donante') gl_donante: any;
  @Input() prop!: number;
  
  ngOnChanges(changes: SimpleChanges) {
    if (this.form_buscar !== undefined) {
      this.form_buscar.get('buscarID').setValue(this.gl_donante);
      this.buscar_direccion();
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
    direcciondonanteID: ['', Validators.required],
    donacionID: ['', Validators.required],
    tipodireccion1 :['', Validators.required],	
    calle1	:['', Validators.required],		
    noexterior1 :[''],	
    nointerior1 :[''],	
    colonia1:['', Validators.required], 		
    cp1 :['', Validators.required],			
    pais1 :['', Validators.required],			
    estado1 :['', Validators.required],		
    municipio1:['', Validators.required], 	
    tipodireccion2 :[''],	
    calle2	:[''],		
    noexterior2 :[''],	
    nointerior2 :[''],	
    colonia2 	:[''],	
    cp2 :[''],			
    pais2 :[''],			
    estado2 :[''],		
    municipio2:[''],
    tipodireccion3 :[''],	
    calle3	:[''],		
    noexterior3:[''], 	
    nointerior3 :[''],	
    colonia3 :[''],		
    cp3 :[''],			
    pais3 :[''],			
    estado3 :[''],		
    municipio3:[''],	
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

buscar_direccion() {
  //spinner
  var spinner_buscar_direccion = document.getElementById("spinner_buscar_direccion");
  this.submit_buscar = true;

  if (this.form_buscar.invalid) {
    return;
  }
  else {
    spinner_buscar_direccion.removeAttribute("hidden");
    //select mediante el id
    var response = this.http.get(this.url + "DireccionDonante/" + this.form_buscar.value.buscarID,this.httpOptions);
    response.subscribe((data: any[]) => {
      this.resultado = data;

      this.form_agregar.get('direcciondonanteID').setValue(this.resultado.direcciondonanteID);
      this.form_agregar.get('donacionID').setValue(this.resultado.donacionID);
      this.form_agregar.get('tipodireccion1').setValue(this.resultado.tipodireccion1);
      this.form_agregar.get('calle1').setValue(this.resultado.calle1);
      this.form_agregar.get('noexterior1').setValue(this.resultado.noexterior1);
      this.form_agregar.get('nointerior1').setValue(this.resultado.nointerior1);
      this.form_agregar.get('colonia1').setValue(this.resultado.colonia1);
      this.form_agregar.get('cp1').setValue(this.resultado.cp1);
      this.form_agregar.get('pais1').setValue(this.resultado.pais1);
      this.form_agregar.get('estado1').setValue(this.resultado.estado1);
      this.form_agregar.get('municipio1').setValue(this.resultado.municipio1);
      this.form_agregar.get('tipodireccion2').setValue(this.resultado.tipodireccion2);
      this.form_agregar.get('calle2').setValue(this.resultado.calle2);
      this.form_agregar.get('noexterior2').setValue(this.resultado.noexterior2);
      this.form_agregar.get('nointerior2').setValue(this.resultado.nointerior2);
      this.form_agregar.get('colonia2').setValue(this.resultado.colonia2);
      this.form_agregar.get('cp2').setValue(this.resultado.cp2);
      this.form_agregar.get('pais2').setValue(this.resultado.pais2);
      this.form_agregar.get('estado2').setValue(this.resultado.estado2);
      this.form_agregar.get('municipio2').setValue(this.resultado.municipio2);
      this.form_agregar.get('tipodireccion3').setValue(this.resultado.tipodireccion3);
      this.form_agregar.get('calle3').setValue(this.resultado.calle3);
      this.form_agregar.get('noexterior3').setValue(this.resultado.noexterior3);
      this.form_agregar.get('nointerior3').setValue(this.resultado.nointerior3);
      this.form_agregar.get('colonia3').setValue(this.resultado.colonia3);
      this.form_agregar.get('cp3').setValue(this.resultado.cp3);
      this.form_agregar.get('pais3').setValue(this.resultado.pais3);
      this.form_agregar.get('estado3').setValue(this.resultado.estado3);
      this.form_agregar.get('municipio3').setValue(this.resultado.municipio3);
      spinner_buscar_direccion.setAttribute("hidden", "true");
      this.mostrar_alert("Busqueda existosa.", 'primary', 5000, null);
    },
      error => {
        spinner_buscar_direccion.setAttribute("hidden", "true");
        this.mostrar_alert("Ocurrió un error, Favor de llenar los campos correctamente.", 'danger', 5000, null);
        console.log("Error", error)
      });
  }
}

modificar_direccion() {
  this.submit_agregar = false;
  if (this.form_agregar.invalid) {
    this.submit_agregar = true;
    this.mostrar_alert("Ocurrió un error, Favor de llenar los campos requeridos.", 'danger', 5000, null);
    return;
  }
  var spinner_agregar_direccion = document.getElementById("spinner_agregar_direccion");
  spinner_agregar_direccion.removeAttribute("hidden");

  //Update mediante el id y los campos de agregar
  this.http.put(this.url + "DireccionDonante/" + this.form_buscar.value.buscarID, this.form_agregar.value,this.httpOptions).subscribe(data => {
    spinner_agregar_direccion.setAttribute("hidden", "true");
    
    this.mostrar_alert("Direccion modificada.", 'primary', 5000, null);
  },
    error => {
      spinner_agregar_direccion.setAttribute("hidden", "true");
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

