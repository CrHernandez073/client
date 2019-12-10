import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { OptionsInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClient ,HttpHeaders } from '@angular/common/http';
import interactionPlugin from '@fullcalendar/interaction';
import { MyserviceService } from '../../../myservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agenda-recepcion',
  templateUrl: './agenda-recepcion.component.html',
  styleUrls: ['./agenda-recepcion.component.css']
})
export class AgendaRecepcionComponent implements OnInit {
  calendarPlugins = [dayGridPlugin, interactionPlugin]; 
  options: OptionsInput;
  eventsModel: any;
  //busqueda
  resultado: any;
  //Tabla
  mievento: any;
  todoseventos: any;
  todo: any;
  calendario:any;
  //radio Option
  agregar_o_modificar: string = 'modificar';
  focus: boolean = false;
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

  //Usuario logueado  
  miembroID= localStorage.getItem("miembroID");

  cc:number;
  color1:string='#ffffff';

  url = "https://api-remota.conveyor.cloud/api/";

  constructor(private http: HttpClient, private formBuilder: FormBuilder, private userService: MyserviceService ) {

  }
  ngOnInit() {
    this.options = {
      //configuracion estructura header
      header: {
        left: 'prev,next today',
        center: 'title',
      },
    };

    //buscar
    this.form_buscar = this.formBuilder.group({
      buscarID: ['', Validators.required],
    })

    //agregar
    this.form_agregar = this.formBuilder.group({
      agendaID: [''],
      title: ['',Validators.required],
      start: ['',Validators.required],
      end: [''],
      ubicacion: [''],
      email: ['',[Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
      usuarioID: [this.miembroID],
      color: ['#ffffff'],
      sede:[localStorage.getItem("sede")],
    })
    this.get_mieventos();
    this.get_todoseventos();
    this.get_all_agenda();
    this.get_calendario();

  }

  
//controls Buscar
get f_B() {
  return this.form_buscar.controls;
  }
  //controls Agregar
  get f_A() {
  return this.form_agregar.controls;
  }
  //asignacion de color a var
  public onEventLog(data: any): void {
    this.form_agregar.get('color').setValue(data);
  }

  buscar_agenda() {
    //select mediante el id
    var response = this.http.get(this.url + "Agenda/" + this.form_buscar.value.buscarID, this.httpOptions);
    response.subscribe((data: any[]) => {
      this.resultado = data;
      //transformar fecha formato
      var datePipe = new DatePipe("en-US");
      this.resultado.start = datePipe.transform(this.resultado.start, 'yyyy-MM-dd');
      this.resultado.end = datePipe.transform(this.resultado.end, 'yyyy-MM-dd');

      this.form_agregar.get('agendaID').setValue(this.resultado.agendaID);
      this.form_agregar.get('title').setValue(this.resultado.title);
      this.form_agregar.get('start').setValue(this.resultado.start);
      this.form_agregar.get('end').setValue(this.resultado.end);
      this.form_agregar.get('ubicacion').setValue(this.resultado.ubicacion);
      this.form_agregar.get('email').setValue(this.resultado.email);
      this.form_agregar.get('usuarioID').setValue(this.resultado.usuarioID);
      this.form_agregar.get('color').setValue(this.resultado.color);
      this.form_agregar.get('sede').setValue(localStorage.getItem("sede"));
      this.color1=this.form_agregar.value.color;
      if (this.focus == true) {
        this.focus = false;
        this.agregar_o_modificar = 'modificar';
      }
      this.mostrar_alert("Busqueda Exitosa", 'primary', 5000, null);
    },
      error => {        
        this.mostrar_alert("Error. Favor de verificar los campos y/o la conexion", 'danger', 5000, null);
        console.log("Error", error)
      });
  }

  modif_agenda(id:any) {
    //select mediante el id
    var response = this.http.get(this.url + "Agenda/" + id, this.httpOptions);
    response.subscribe((data: any[]) => {
      this.resultado = data;
      //transformar fecha formato
      var datePipe = new DatePipe("en-US");
      this.resultado.start = datePipe.transform(this.resultado.start, 'yyyy-MM-dd');
      this.resultado.end = datePipe.transform(this.resultado.end, 'yyyy-MM-dd');

      this.form_agregar.get('agendaID').setValue(this.resultado.agendaID);
      this.form_agregar.get('title').setValue(this.resultado.title);
      this.form_agregar.get('start').setValue(this.resultado.start);
      this.form_agregar.get('end').setValue(this.resultado.end);
      this.form_agregar.get('ubicacion').setValue(this.resultado.ubicacion);
      this.form_agregar.get('email').setValue(this.resultado.email);
      this.form_agregar.get('usuarioID').setValue(this.resultado.usuarioID);
      this.form_agregar.get('color').setValue(this.resultado.color);
      this.form_agregar.get('sede').setValue(localStorage.getItem("sede"));
      this.color1=this.form_agregar.value.color;
      if (this.focus == true) {
        this.focus = false;
        this.agregar_o_modificar = 'modificar';
      }
      
      this.mostrar_alert("Registro Obtenido. Listo para modificación.", 'success', 5000, null);
    },
      error => {
        this.mostrar_alert("Error. Favor de verificar los campos y/o la conexion", 'danger', 5000, null);
        console.log("Error", error)
      });
  }

  eliminar_agenda(id: any) {
    var r = confirm("¿Esta seguro que desea eliminar el Evento: " + id + " ?");
    if (r == false) {
      return;
    }
    else {
      var response = this.http.delete(this.url + "Agenda/" + id, this.httpOptions);
      response.subscribe((data: any[]) => {        
      this.mostrar_alert("Se a eliminado el Evento: " + id, 'primary', 15000, null);
        this.get_mieventos();
        this.get_todoseventos();
        this.get_all_agenda();
        this.get_calendario();
      },
        error => {
          this.mostrar_alert("Error. Favor de verificar los campos y/o la conexion", 'danger', 5000, null);
          console.log("Error", error)
        });
    }
  }

  opcion_agenda() {
    this.submit_agregar = true;
    if (this.form_agregar.invalid) {
      
      this.mostrar_alert("Error. Favor de llenar los campos requeridos.", 'danger', 5000, null);
      return;
    }
    else {
      var r = confirm("¿Esta seguro que desea " + this.agregar_o_modificar + " Evento?");
      if (r == false) {
        return;
      }
      if (this.agregar_o_modificar == "nuevo") {
        this.agregar_agenda();
      }
      else if (this.agregar_o_modificar == "modificar") {
        this.modificar_agenda();
      }
      else {
        console.log("se fue a ninguno")
      }
    }
  }
  
  agregar_agenda() {
    this.get_nuevo_agenda();
  
    //verificar la fecha 
    this.http.post(this.url + "Agenda", this.form_agregar.value, this.httpOptions).subscribe(data => {
      alert("Se a registrado el Evento correctamente. ");
      this.clean_Agregar();
      this.form_agregar.get('usuarioID').setValue(this.miembroID);
      this.get_nuevo_agenda();
      this.get_mieventos();
      this.get_todoseventos();
      this.get_all_agenda();
      this.get_calendario();
    },
      error => {
        this.mostrar_alert("Error. Favor de verificar los campos y/o la conexion", 'danger', 5000, null);
        console.log("Error", error);
      });
  }
  modificar_agenda() {
    this.http.put(this.url + "Agenda/" + this.form_agregar.value.agendaID, this.form_agregar.value, this.httpOptions).subscribe(data => {
      alert("Evento Modificado");
      this.get_mieventos();
      this.get_todoseventos();
      this.get_all_agenda();
      this.get_calendario();
    },
      error => {
        this.mostrar_alert("Error. Favor de verificar los campos y/o la conexion", 'danger', 5000, null);
        console.log("Error", error);
      });
  }

  radioChange(event: any) {
    this.agregar_o_modificar = event.target.value;

    if (this.agregar_o_modificar == "nuevo") {
      this.clean_Agregar();
      this.get_nuevo_agenda();
      this.form_agregar.get('usuarioID').setValue(this.miembroID);
      this.focus = true;
    }
    else if (this.agregar_o_modificar == "modificar") {
      this.clean_Agregar();
      this.form_agregar.get('usuarioID').setValue(this.miembroID);
      this.focus = false;
    }
  }

  get_nuevo_agenda() {
    var response = this.http.get(this.url + "ultimo_agenda", this.httpOptions);
    response.subscribe((resultado: number) => {
      this.form_agregar.get('agendaID').setValue(resultado + 1);
    },
      error => {
        this.mostrar_alert("Error. Favor de verificar los campos y/o la conexion", 'danger', 5000, null);
        console.log("Error", error)
      });
  }



//mis eventos
  get_mieventos() {
    var response = this.http.get(this.url + "Registro_agenda?id=" + this.form_agregar.value.usuarioID, this.httpOptions);
    response.subscribe((data: any[]) => {
      this.mievento = data;
    },
      error => {
        console.log("Error", error)
      });
  }

  //eventos x sede
  get_todoseventos() {
    var response = this.http.get(this.url + "Eventos?Rsede="+this.form_agregar.value.sede, this.httpOptions);
    response.subscribe((data: any[]) => {
      this.todoseventos = data;
    },
      error => {
        console.log("Error", error)
      });
  }
  //toda las agendas order(sede)
  get_all_agenda() {
    var response = this.http.get(this.url + "all/agenda", this.httpOptions);
    response.subscribe((data: any[]) => {
      this.todo = data;
    },
      error => {
        console.log("Error", error)
      });
  }
  //llenar calendario x sede
  get_calendario() {
    var response = this.http.get(this.url + "Eventos?Rsede="+this.form_agregar.value.sede, this.httpOptions);
    response.subscribe((data: any[]) => {
      this.calendario=data
      //transformar fecha formato
      var datePipe = new DatePipe("en-US");
      for (let entry of this.calendario) {
      entry.start = datePipe.transform(entry.start, 'yyyy-MM-dd');
      if (entry.end=='')
      { }
      else
      {
        // console.log(entry.end);
        var fecha = new Date(entry.end);
        fecha.setDate(fecha.getDate() + 1);   
        entry.end=fecha;
        entry.end = datePipe.transform(entry.end, 'yyyy-MM-dd');        
      }      
    }
      this.eventsModel = this.calendario;
    },
      error => {
        console.log("Error", error)
      });
  }


  //reset agregar
  clean_Agregar() {
    this.submit_agregar = false;
    this.form_agregar.reset();    
    this.form_agregar.get('sede').setValue(localStorage.getItem("sede"));
  }
  //clic en evento (azul)
  eventClick(model) {
    let fecha1= model.event.start;
    let fecha2= model.event.end;
    
    var datePipe = new DatePipe("en-US");
    fecha1 = datePipe.transform(fecha1, 'yyyy-MMMM-dd, EEEE');
    fecha2 = datePipe.transform(fecha2, 'yyyy-MMMM-dd, EEEE');

    alert("Event: " + model.event.title +"\nFecha Inicio: "+fecha1+"\nFecha Terminacion: "+ fecha2);
  }

  // //clic en las cell del dategrid
  // dateClick(model) {
  //   console.log(model);
  // }

  refresacar(){
    this.get_calendario();
    this.get_todoseventos();
    this.get_all_agenda();
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

}
