import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'donacion-donante',
  templateUrl: './donacion-donante.component.html',
  styleUrls: ['./donacion-donante.component.css'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class DonacionDonanteComponent implements OnInit, OnChanges {
  @Input('gl_donante') gl_donante: any;
  @Input() prop!: number;

  ngOnChanges(changes: SimpleChanges) {
    if (this.form_buscar !== undefined) {
      var donacion_Nuevo = document.getElementById("donacion_Nuevo");
      donacion_Nuevo.setAttribute("checked", "True");
      this.form_buscar.get('buscarID').setValue(this.gl_donante);
      this.buscar_donante();
      if (this.focus==true){
        this.focus=false;
        this.agregar_o_modificar='modificar';
      } 
    }
  }

  @Output() donante_variable = new EventEmitter<number>();
  //busqueda
  resultado: any;
  arrayLideres: any;
  arrayCampanas: any;
  arrayEventos: any;
  miembro: any;
  //Tabla
  arreglo: any;

  //radio Option
  agregar_o_modificar: string = 'nuevo';
  focus:boolean=true;

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

  constructor(private http: HttpClient, private formBuilder: FormBuilder, private router: Router) {

    this.get_nuevo_donacion();
    this.get_Lider();
    this.get_Eventoe();
    this.get_Campana();
  }

  ngOnInit() {
    //Se rellena los campos al formulario 
    //buscar
    this.form_buscar = this.formBuilder.group({
      buscarID: ['', Validators.required],
    })

    //agregar
    this.form_agregar = this.formBuilder.group({
      donacionID: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      nombrefiscal: ['', Validators.required],
      status: ['', Validators.required],
      email: ['',[Validators.required,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]], 
      tipodonante: ['', Validators.required],
      fechanacimiento: [''],
      edad: [''],
      fechadonacion: [''],
      liderID: ['', Validators.required],
      campanaID: ['', Validators.required],
      eventoID: ['', Validators.required],
      observacion: [''],
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

  //Cambio a padre
  cambiar_valor_Padre() {
    this.donante_variable.emit(this.form_buscar.value.buscarID);
    this.buscar_donante();
  }

  calcular_edad(event){
		var fecha_actual = new Date(Date.now());
		var fecha_nacimiento = new Date(event.srcElement.value)

		var edad =  fecha_actual.getFullYear() - fecha_nacimiento.getFullYear();
		this.form_agregar.get('edad').setValue(edad);

	}

  buscar_donante() {    
    // this.get_Lider();
    // this.get_Eventoe();
    // this.get_Campana();
    //spinner
    var spinner_buscar_donacion = document.getElementById("spinner_buscar_donacion");
    this.submit_buscar = true;
    if (this.form_buscar.invalid) {
      return;
    }
    else {
      this.form_buscar.disable();
      var response = this.http.get(this.url + "Donacion/" + this.form_buscar.value.buscarID,this.httpOptions);
      response.subscribe((data: any[]) => {
        this.resultado = data;
        if (this.resultado == "Sesión invalida") {          
          this.router.navigate(['/login']);
          return;
         }
  
        //transformar fecha formato
        var datePipe = new DatePipe("en-US");
        this.resultado.fechanacimiento = datePipe.transform(this.resultado.fechanacimiento, 'yyyy-MM-dd');
        this.resultado.fechadonacion = datePipe.transform(this.resultado.fechadonacion, 'yyyy-MM-dd');

        this.form_agregar.get('donacionID').setValue((this.resultado.donacionID));
        this.form_agregar.get('nombres').setValue(this.resultado.nombres);
        this.form_agregar.get('apellidos').setValue(this.resultado.apellidos);
        this.form_agregar.get('nombrefiscal').setValue(this.resultado.nombrefiscal);
        this.form_agregar.get('status').setValue(this.resultado.status);
        this.form_agregar.get('email').setValue(this.resultado.email);
        this.form_agregar.get('tipodonante').setValue(this.resultado.tipodonante);
        this.form_agregar.get('fechanacimiento').setValue(this.resultado.fechanacimiento);
        this.form_agregar.get('fechadonacion').setValue(this.resultado.fechadonacion);
        this.form_agregar.get('edad').setValue(this.resultado.edad);
        this.form_agregar.get('liderID').setValue(this.resultado.liderID);
        this.form_agregar.get('campanaID').setValue(this.resultado.campanaID);
        this.form_agregar.get('eventoID').setValue(this.resultado.eventoID);
        this.form_agregar.get('observacion').setValue(this.resultado.observacion);

        spinner_buscar_donacion.setAttribute("hidden", "true");
        this.form_buscar.enable();        
        this.mostrar_alert("Busqueda exitosa.", 'primary', 5000, null);
      },
        error => {
          spinner_buscar_donacion.setAttribute("hidden", "true");
          this.mostrar_alert("Ocurrió un error, Favor de ingresar un id existente.", 'danger', 5000, null);
          this.form_buscar.enable();  
          console.log("Error", error)
        });
    }
  }

  opcion_donante() {
    this.submit_agregar = true;
    if (this.form_agregar.invalid) {
      this.mostrar_alert("Favor de llenar los campos requeridos.","danger",5000,null);
      return;
    }
    else {
      var r = confirm("¿Esta seguro que desea " + this.agregar_o_modificar + " donante?");
      if (r == false) {
        return;
      }
      if (this.agregar_o_modificar == "nuevo") {
        this.agregar_donante();
      }
      else if (this.agregar_o_modificar == "modificar") {
        this.modificar_donante();
      }
      else {
        console.log("se fue a ninguno")
      }
    }
  }

  //Obtener nuevo Donante 
  get_nuevo_donacion() {
    var response = this.http.get(this.url + "ultimoDonacion",this.httpOptions);
    response.subscribe((resultado: number) => {
      this.resultado=resultado;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }

      this.form_agregar.get('donacionID').setValue(resultado + 1);
    },
      error => {
        console.log("Error", error)
      });
  }

  agregar_donante() {
    this.get_nuevo_donacion();
    //Spiner
    var spinner_agregar_donacion = document.getElementById("spinner_agregar_donacion");
    spinner_agregar_donacion.removeAttribute("hidden");
    //Donacion
    this.http.post(this.url + "Donacion", this.form_agregar.value,this.httpOptions).subscribe(data => {
      this.resultado=data;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }

      this.crear_tabla("Telefonodonante", "telefonoID", this.form_agregar.value.donacionID);
      this.crear_tabla("DireccionDonante", "direcciondonanteID", this.form_agregar.value.donacionID);
      this.crear_tabla("Contacto", "contactoID", this.form_agregar.value.donacionID);
      this.crear_tabla("DFiscal", "datosfiscalesID", this.form_agregar.value.donacionID);
      this.mostrar_alert("Se a registrado los Datos del Donante correctamente.\n ID: " + this.form_agregar.value.donacionID, 'success', 15000, null);
      this.form_buscar.get('buscarID').setValue(this.form_agregar.value.donacionID);
      spinner_agregar_donacion.setAttribute("hidden", "true");
      this.cambiar_valor_Padre();
    },
      error => {
        spinner_agregar_donacion.setAttribute("hidden", "true");
        this.mostrar_alert("Ocurrió un error, Favor de llenar los campos correctamente.", 'danger', 5000, null);
        console.log("Error", error);
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

  crear_tabla(tabla: string, columnaID: string, valorID: number) {
    var datos_aux = JSON.parse('{"' + columnaID + '":' + valorID + ', "donacionID":' + valorID + '}');
    this.http.post(this.url + tabla, datos_aux,this.httpOptions).subscribe(data => {
      this.resultado=data;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
    },
      error => {
        console.log("Error al guardar en la tabla: " + tabla, error);
      });
  }

  modificar_donante() {
    var spinner_agregar_donacion = document.getElementById("spinner_agregar_donacion");
    spinner_agregar_donacion.removeAttribute("hidden");

    //Update mediante el id y los campos de agregar
    this.http.put(this.url + "Donacion/" + this.form_buscar.value.buscarID, this.form_agregar.value,this.httpOptions).subscribe(data => {
      this.resultado=data;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }

      spinner_agregar_donacion.setAttribute("hidden", "true");
      
      this.mostrar_alert("Donacion Modificada correctamente.", 'primary', 5000, null);
    },
      error => {
        spinner_agregar_donacion.setAttribute("hidden", "true");        
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

  radioChange(event: any) {
    this.agregar_o_modificar = event.target.value;
    var donacion_btn_buscar = document.getElementById("donacion_btn_buscar");

    if (this.agregar_o_modificar == "nuevo") {
      this.get_nuevo_donacion();
      this.clean_Buscar();
      this.clean_Agregar();
      this.focus=true;
      donacion_btn_buscar.setAttribute("disabled", "true");
    }
    else if (this.agregar_o_modificar == "modificar") {
      this.clean_Buscar();
      this.clean_Agregar();
      this.focus=false;
      donacion_btn_buscar.removeAttribute("disabled");
      donacion_btn_buscar.setAttribute("enable", "true");

    }
  }

  get_Lider() {
    var response = this.http.get(this.url + "Lider/",this.httpOptions);
    response.subscribe((data: any[]) => {
    this.arrayLideres = data;  
    if (this.arrayLideres == "Sesión invalida") {          
      this.router.navigate(['/login']);
      return;
     }

    },
      error => {
        this.mostrar_alert("Ocurrió un error, Favor de verificar la conexion.", 'danger', 5000, null);
        console.log("Error", error)
      });
  }
  get_Campana() {
    var response = this.http.get(this.url + "Campana/",this.httpOptions);
    response.subscribe((data: any[]) => {
    this.arrayCampanas = (data);   
    if (this.arrayCampanas == "Sesión invalida") {          
      this.router.navigate(['/login']);
      return;
     }
    },
      error => {
        console.log("Error", error)
      });
  }
  get_Eventoe() {
    var response = this.http.get(this.url + "Eventoe/",this.httpOptions);
    response.subscribe((data: any[]) => {
    this.arrayEventos = (data);    
    if (this.arrayEventos == "Sesión invalida") {          
      this.router.navigate(['/login']);
      return;
     }

    },
      error => {
        console.log("Error", error)
      });
  }
}
