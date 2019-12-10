import { Component, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, Input } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'nota-donante',
  templateUrl: './nota-donante.component.html',
  styleUrls: ['./nota-donante.component.css'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class NotaDonanteComponent implements OnInit, OnChanges {
  @Input('gl_donante') gl_donante: any;
  @Input() prop!: number;
  
  ngOnChanges(changes: SimpleChanges) {
    if (this.form_buscar !== undefined) {
        //Spiner
  var spinner_buscar_nota = document.getElementById("spinner_buscar_nota");
  spinner_buscar_nota.removeAttribute("hidden");
      this.form_buscar.get('buscarID').setValue(this.gl_donante);
      this.form_agregar.get('donacionID').setValue(this.gl_donante);
      this.get_nota();   
      this.traer_donante();
      if (this.focus==true){
        this.focus=false;
        this.agregar_o_modificar='modificar';
      }   
      
    spinner_buscar_nota.setAttribute("hidden", "true");
    }
  }
  
  @Output() donante_variable= new EventEmitter<number>();
  
//Cambio a padre
cambiar_valor_Padre(){
  this.donante_variable.emit(this.form_buscar.value.buscarID);
}
  //busqueda
  resultado: any;
  arraynota: any;
  //Tabla
  arreglo: any;

  //radio Option
  agregar_o_modificar: string = 'modificar';
  focus:boolean=false;

//Formularios
form_buscar : FormGroup;
form_agregar : FormGroup;

//validacion 
submit_buscar = false;
submit_agregar= false;
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

constructor(private http : HttpClient, private formBuilder: FormBuilder) { }

ngOnInit() {
//Se rellena los campos al formulario 
//buscar
this.form_buscar = this.formBuilder.group({
  buscarID: ['', Validators.required],
})

//agregar
this.form_agregar = this.formBuilder.group({
  notaID:['', Validators.required],
  donacionID: ['', Validators.required],
  nota 	:['',Validators.required],	
  statusnota :['',Validators.required],	
  programar :[''],	
  responsable :['',Validators.required],
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
opcion_nota() {
  this.submit_agregar = false;
  if (this.form_agregar.invalid) {
    this.submit_agregar = true;
    this.mostrar_alert("Ocurrió un error, Favor de llenar los campos requeridos.", 'danger', 5000, null);
    return;
  }
  else {
    var r = confirm("¿Esta seguro que desea " + this.agregar_o_modificar + " donacion?");
    if (r == false) {
      return;
    }
    if (this.agregar_o_modificar == "nuevo") {
      console.log("Creando ...");
      this.agregar_nota();
    }
    else if (this.agregar_o_modificar == "modificar") {
      console.log("Modificando ...");
      this.modificar_nota();
    }
    else {
      console.log("se fue a ninguno")
    }
  }
}

buscar_nota(id: any) {
      //select mediante el id
      var response = this.http.get(this.url + "NotasDonantes/" + id,this.httpOptions);
      response.subscribe((data: any[]) => { 
        this.resultado = data;
        //transformar fecha formato
        var datePipe = new DatePipe("en-US");
        this.resultado.programar = datePipe.transform(this.resultado.programar, 'yyyy-MM-dd');
        
        this.form_agregar.get('notaID').setValue(this.resultado.notaID);
        this.form_agregar.get('donacionID').setValue(this.resultado.donacionID);
        this.form_agregar.get('nota').setValue(this.resultado.nota);
        this.form_agregar.get('statusnota').setValue(this.resultado.statusnota);
        this.form_agregar.get('programar').setValue(this.resultado.programar);
        this.form_agregar.get('responsable').setValue(this.resultado.responsable);
        if (this.focus==true){
          this.focus=false;
          this.agregar_o_modificar='modificar';
        } 
      },
        error => {
          
        this.mostrar_alert("Ocurrió un error, Favor de llenar los campos correctamente.", 'danger', 5000, null);
          console.log("Error", error)
        });
}

agregar_nota() {  
  this.get_nuevo_nota();
  //Spiner
  var spinner_agregar_nota = document.getElementById("spinner_agregar_nota");
  spinner_agregar_nota.removeAttribute("hidden");
  //Donacion
  this.http.post(this.url + "NotasDonantes", this.form_agregar.value,this.httpOptions).subscribe(data => {
    alert("Se a registrado la Nota correctamente. ");

    spinner_agregar_nota.setAttribute("hidden", "true");
this.clean_Agregar();
    this.get_nuevo_nota();
    this.get_nota();
    
    this.mostrar_alert("Registro exitoso de Nota.", 'success', 5000, null);
  },
    error => {
      spinner_agregar_nota.setAttribute("hidden", "true");      
      this.mostrar_alert("Ocurrió un error, Favor de llenar los campos correctamente.", 'danger', 5000, null);
      console.log("Error", error);
    });
}

modificar_nota() {
  var spinner_agregar_nota = document.getElementById("spinner_agregar_nota");
  spinner_agregar_nota.removeAttribute("hidden");

  this.http.put(this.url + "NotasDonantes/" + this.form_agregar.value.notaID, this.form_agregar.value,this.httpOptions).subscribe(data => {
    spinner_agregar_nota.setAttribute("hidden", "true");
    
    this.mostrar_alert("Modificacion Exitosa.", 'primary', 5000, null);
    this.get_nota();
  },
    error => {
      spinner_agregar_nota.setAttribute("hidden", "true");
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

radioChange(event: any){
  this.agregar_o_modificar = event.target.value; 
  if (this.agregar_o_modificar == "nuevo"){
    this.clean_Agregar();
    this.get_nuevo_nota();
    this.form_agregar.get('donacionID').setValue(this.gl_donante);
        
    this.traer_donante();
    this.focus=true;
  }
  else if(this.agregar_o_modificar == "modificar"){ 
    this.clean_Agregar();   
    this.focus=false;
    this.form_agregar.get('donacionID').setValue(this.gl_donante);    
    this.traer_donante();
  }
}
//hacer metodo get ultimo y traer por id
get_nuevo_nota(){
  var response = this.http.get(this.url + "ultimoNota",this.httpOptions);
  response.subscribe((resultado: number) => {
    this.form_agregar.get('notaID').setValue(resultado + 1);
  },
    error => {
      console.log("Error", error)
    });
}

get_nota(){
  var response = this.http.get(this.url + "Nota/notaespecifica?id="+this.form_buscar.value.buscarID,this.httpOptions);
  response.subscribe((data: any[]) => {
    this.arraynota = data;
    this.mostrar_alert("Busqueda existosa.", 'primary', 5000, null);
  },
    error => {
      this.mostrar_alert("Ocurrió un error, Favor de llenar los campos correctamente.", 'danger', 5000, null);
      console.log("Error", error)
    });
}

}
