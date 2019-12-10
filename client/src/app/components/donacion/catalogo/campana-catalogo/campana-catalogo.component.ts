import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'campana-catalogo',
  templateUrl: './campana-catalogo.component.html',
  styleUrls: ['./campana-catalogo.component.css'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class CampanaCatalogoComponent implements OnInit {
//busqueda
resultado: any;
arrayCampana: any;
//Tabla
arreglo: any;

//radio Option
agregar_o_modificar: string = 'nuevo';

  //Formularios
  form_buscar : FormGroup;
  form_agregar : FormGroup;
  
  //validacion
  submit_buscar = false;
	submit_agregar= false;

  httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json',
			'miembroID': localStorage.getItem('miembroID'),
			'Authorization': localStorage.getItem('Authorization')
		})
	};

  url = "https://api-remota.conveyor.cloud/api/";

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router

  ) { 
    this.get_nuevo_campana();
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
      campanaID: ['', Validators.required],
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

	buscar_campana(){
	 //spinner
   var spinner_buscar_campana = document.getElementById("spinner_buscar_campana");

   this.submit_buscar = true;
   if (this.form_buscar.invalid) {
     return;
   }
   else {

     spinner_buscar_campana.removeAttribute("hidden");
     //select mediante el id
     var response = this.http.get(this.url + "Campana/" + this.form_buscar.value.buscarID,this.httpOptions);
     response.subscribe((data: any[]) => {
       this.resultado = data;
       if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }

       //transformar fecha formato
       var datePipe = new DatePipe("en-US");
       this.resultado.fecha = datePipe.transform(this.resultado.fecha, 'yyyy-MM-dd');

       this.form_agregar.get('campanaID').setValue(this.resultado.campanaID);
       this.form_agregar.get('descripcion').setValue(this.resultado.descripcion);
       this.form_agregar.get('fecha').setValue(this.resultado.fecha);
       this.form_agregar.get('sede').setValue(this.resultado.sede);
       spinner_buscar_campana.setAttribute("hidden", "true");
     },
       error => {
         spinner_buscar_campana.setAttribute("hidden", "true");
         alert("Error.");
         console.log("Error", error)
       });
   }
  }

  opcion_campana() {
    this.submit_agregar = true;
    if (this.form_agregar.invalid) {
      return;
    }
    else {
      var r = confirm("¿Esta seguro que desea " + this.agregar_o_modificar + " Campaña?");
      if (r == false) {
        return;
      }
      if (this.agregar_o_modificar == "nuevo") {
        console.log("Creando ...");
        this.agregar_campana();
      }
      else if (this.agregar_o_modificar == "modificar") {
        console.log("Modificando ...");
        this.modificar_campana();
      }
      else {
        console.log("se fue a ninguno")
      }
    }
  }

  //Obtener nuevo Lider
  get_nuevo_campana() {
    var response = this.http.get(this.url + "ultimoCampana",this.httpOptions);
    response.subscribe((resultado: number) => {
      this.resultado=resultado;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }

      this.form_agregar.get('campanaID').setValue(resultado + 1);
    },
      error => {
        console.log("Error", error)
      });
  }
  //List Lider
  get_Campana() {
    var response = this.http.get(this.url + "campana/sede?Rsede="+localStorage.getItem('sede'),this.httpOptions);
    response.subscribe((data: any[]) => {
      this.arrayCampana = data;
      if (this.arrayCampana == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }

    },
      error => {
        console.log("Error", error)
      });
  }

  agregar_campana(){
	//Spiner
  var spinner_agregar_campana = document.getElementById("spinner_agregar_campana");
  spinner_agregar_campana.removeAttribute("hidden");
  this.http.post(this.url + "Campana", this.form_agregar.value,this.httpOptions).subscribe(data => {
    this.resultado=data;
    if (this.resultado == "Sesión invalida") {          
      this.router.navigate(['/login']);
      return;
     }

    spinner_agregar_campana.setAttribute("hidden", "true");
    alert("Campaña Guardado");
    this.clean_Agregar();
    this.get_nuevo_campana();
    this.get_Campana();
  },
    error => {
      spinner_agregar_campana.setAttribute("hidden", "true");
      alert("Error.");
      console.log("Error", error);
    });
  }
  
  
  modificar_campana() {
    var spinner_agregar_campana = document.getElementById("spinner_agregar_campana");
    spinner_agregar_campana.removeAttribute("hidden");

    //Update mediante el id y los campos de agregar
    this.http.put(this.url + "Campana/" + this.form_buscar.value.buscarID, this.form_agregar.value,this.httpOptions).subscribe(data => {
      
      this.resultado=data;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }

      spinner_agregar_campana.setAttribute("hidden", "true");
      alert("Campaña Modificado");
      this.get_Campana();
    },
      error => {
        spinner_agregar_campana.setAttribute("hidden", "true");
        alert("Error.");
        console.log("Error", error);
      });
  }

  //reset buscar
	clean_Buscar(){
		this.submit_buscar =false;
		this.form_buscar.reset();
  }
  
  //reset agregar
  clean_Agregar(){
		this.submit_agregar =false;
		this.form_agregar.reset();
    this.form_agregar.get('sede').setValue(localStorage.getItem('sede'));
	}


  
	radioChange(event: any){
		this.agregar_o_modificar = event.target.value;
		var campana_btn_buscar = document.getElementById("campana_btn_buscar");

		if (this.agregar_o_modificar == "nuevo"){
			this.clean_Agregar();
      this.clean_Buscar();
      this.get_nuevo_campana();

			campana_btn_buscar.setAttribute("disabled", "true");
		}
		else if(this.agregar_o_modificar == "modificar"){
			campana_btn_buscar.removeAttribute("disabled");
      campana_btn_buscar.setAttribute("enable", "true");
      
			this.clean_Agregar();
			this.clean_Buscar();
		}
  }
  eliminar_campana(id: any) {
    var r = confirm("¿Esta seguro que desea eliminar la Campaña: "+id+" ?");
    if (r == false) {
      return;
    }
    else {
      var response = this.http.delete(this.url + "Campana/" + id,this.httpOptions);
      response.subscribe((data: any[]) => {
        this.resultado=data;
        if (this.resultado == "Sesión invalida") {          
          this.router.navigate(['/login']);
          return;
         }
  
        alert("Se a eliminado la Campaña: " + id);
        this.get_Campana();
        this.get_nuevo_campana();
      },
        error => {
          console.log("Error", error)
        });
    }
  }
}
