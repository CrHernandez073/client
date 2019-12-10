import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'evento-catalogo',
  templateUrl: './evento-catalogo.component.html',
  styleUrls: ['./evento-catalogo.component.css'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class EventoCatalogoComponent implements OnInit {
  //busqueda
  resultado: any;
  arrayEvento: any;
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
  httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json',
			'miembroID': localStorage.getItem('miembroID'),
			'Authorization': localStorage.getItem('Authorization')
		})
	};

  url = "https://api-remota.conveyor.cloud/api/";

  constructor(private http: HttpClient, private formBuilder: FormBuilder) {
    this.get_nuevo_evento();
    this.get_Eventos();
   }

  ngOnInit() {
    //Se rellena los campos al formulario 
    //buscar
    this.form_buscar = this.formBuilder.group({
      buscarID: ['', Validators.required],
    })

    //agregar
    this.form_agregar = this.formBuilder.group({
      eventoID: ['', Validators.required],
      descripcion: ['', Validators.required],
      fecha: [''],
      sede: [localStorage.getItem('sede')],
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

  buscar_evento() {
    //spinner 
    var spinner_buscar_evento = document.getElementById("spinner_buscar_evento");

    this.submit_buscar = true;
    if (this.form_buscar.invalid) {
      return;
    }
    else {

      spinner_buscar_evento.removeAttribute("hidden");
      //select mediante el id
      var response = this.http.get(this.url + "Eventoe/" + this.form_buscar.value.buscarID,this.httpOptions);
      response.subscribe((data: any[]) => {
        this.resultado = data;
        //transformar fecha formato
        var datePipe = new DatePipe("en-US");
        this.resultado.fecha = datePipe.transform(this.resultado.fecha, 'yyyy-MM-dd');

        this.form_agregar.get('eventoID').setValue(this.resultado.eventoID);
        this.form_agregar.get('descripcion').setValue(this.resultado.descripcion);
        this.form_agregar.get('fecha').setValue(this.resultado.fecha);
        this.form_agregar.get('sede').setValue(this.resultado.sede);
        spinner_buscar_evento.setAttribute("hidden", "true");
      },
        error => {
          spinner_buscar_evento.setAttribute("hidden", "true");
          alert("Error.");
          console.log("Error", error)
        });
    }
  }

  opcion_evento() {
    this.submit_agregar = true;
    if (this.form_agregar.invalid) {
      return;
    }
    else {
      var r = confirm("¿Esta seguro que desea " + this.agregar_o_modificar + " Evento?");
      if (r == false) {
        return;
      }
      if (this.agregar_o_modificar == "nuevo") {
        console.log("Creando ...");
        this.agregar_evento();
      }
      else if (this.agregar_o_modificar == "modificar") {
        console.log("Modificando ...");
        this.modificar_evento();
      }
      else {
        console.log("se fue a ninguno")
      }
    }
  }

  //Obtener nuevo Lider
  get_nuevo_evento() {
    var response = this.http.get(this.url + "ultimoEventoe",this.httpOptions);
    response.subscribe((resultado: number) => {
      this.form_agregar.get('eventoID').setValue(resultado + 1);
    },
      error => {
        console.log("Error", error)
      });
  }
  //List Lider
  get_Eventos() {
    var response = this.http.get(this.url + "evento/sede?Rsede="+localStorage.getItem('sede'),this.httpOptions);
    response.subscribe((data: any[]) => {
      this.arrayEvento = data;
      console.log(data);
    },
      error => {
        console.log("Error", error)
      });
  }

  agregar_evento() {
    //Spiner
    var spinner_agregar = document.getElementById("spinner_agregar");
    spinner_agregar.removeAttribute("hidden");
    this.http.post(this.url + "Eventoe", this.form_agregar.value,this.httpOptions).subscribe(data => {
      spinner_agregar.setAttribute("hidden", "true");
      alert("Evento Guardado");
      this.clean_Agregar();
      this.get_Eventos();
      this.get_nuevo_evento();
    },
      error => {
        spinner_agregar.setAttribute("hidden", "true");
        alert("Error.");
        console.log("Error", error);
      });
  }

  modificar_evento() {
    var spinner_agregar = document.getElementById("spinner_agregar");
    spinner_agregar.removeAttribute("hidden");

    //Update mediante el id y los campos de agregar
    this.http.put(this.url + "Eventoe/" + this.form_buscar.value.buscarID, this.form_agregar.value,this.httpOptions).subscribe(data => {
      spinner_agregar.setAttribute("hidden", "true");
      alert("Evento Modificado");
      this.get_Eventos();
    },
      error => {
        spinner_agregar.setAttribute("hidden", "true");
        alert("Error.");
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
    this.form_agregar.get('sede').setValue(localStorage.getItem('sede'));
  }

	radioChange(event: any){
		this.agregar_o_modificar = event.target.value;
		var evento_btn_buscar = document.getElementById("evento_btn_buscar");

		if (this.agregar_o_modificar == "nuevo"){
			this.clean_Agregar();
      this.clean_Buscar();
      this.get_nuevo_evento();

			evento_btn_buscar.setAttribute("disabled", "true");
		}
		else if(this.agregar_o_modificar == "modificar"){
			evento_btn_buscar.removeAttribute("disabled");
      evento_btn_buscar.setAttribute("enable", "true");
      
			this.clean_Agregar();
			this.clean_Buscar();
		}
  }

  eliminar_eventoe(id: any) {
    var r = confirm("¿Esta seguro que desea eliminar el Evento: "+id+" ?");
    if (r == false) {
      return;
    }
    else {
      var response = this.http.delete(this.url + "Eventoe/" + id,this.httpOptions);
      response.subscribe((data: any[]) => {
        alert("Se a eliminado el Evento: " + id);
        this.get_Eventos();
        this.get_nuevo_evento();
      },
        error => {
          console.log("Error", error)
        });
    }
  }
}
