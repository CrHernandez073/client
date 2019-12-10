import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'lider-catalogo',
  templateUrl: './lider-catalogo.component.html',
  styleUrls: ['./lider-catalogo.component.css']
})
export class LiderCatalogoComponent implements OnInit {
  //busqueda
  resultado: any;
  arrayLideres: any;

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

  constructor(private http: HttpClient, private formBuilder: FormBuilder,private router: Router) {
    this.get_nuevo_lider();
    this.get_Liders();
  }

  ngOnInit() {
    //Se rellena los campos al formulario 
    //buscar
    this.form_buscar = this.formBuilder.group({
      buscarID: ['', Validators.required],
    })

    //agregar
    this.form_agregar = this.formBuilder.group({
      liderID: ['', Validators.required],
      descripcion: ['', Validators.required],
      sede: [localStorage.getItem('sede'), Validators.required],
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

  buscar_lider() {
    //spinner
    var spinner_buscar = document.getElementById("spinner_buscar");
    this.submit_buscar = true;
    if (this.form_buscar.invalid) {
      return;
    }
    else {

      spinner_buscar.removeAttribute("hidden");
      //select mediante el id
      var response = this.http.get(this.url + "Lider/" + this.form_buscar.value.buscarID,this.httpOptions);
      response.subscribe((data: any[]) => {
        this.resultado = data;
        if (this.resultado == "Sesión invalida") {          
          this.router.navigate(['/login']);
          return;
         }

        this.form_agregar.get('liderID').setValue(this.resultado.liderID);
        this.form_agregar.get('descripcion').setValue(this.resultado.descripcion);
        this.form_agregar.get('sede').setValue(this.resultado.sede);
        spinner_buscar.setAttribute("hidden", "true");
      },
        error => {
          spinner_buscar.setAttribute("hidden", "true");
          alert("Error.");
          console.log("Error", error)
        });
    }
  }
  opcion_lider() {
    this.submit_agregar = true;
    if (this.form_agregar.invalid) {
      return;
    }
    else {
      var r = confirm("¿Esta seguro que desea " + this.agregar_o_modificar + " Lider?");
      if (r == false) {
        return;
      }
      if (this.agregar_o_modificar == "nuevo") {
        console.log("Creando ...");
        this.agregar_lider();
      }
      else if (this.agregar_o_modificar == "modificar") {
        console.log("Modificando ...");
        this.modificar_lider();
      }
      else {
        console.log("se fue a ninguno")
      }
    }
  }

  //Obtener nuevo Lider
  get_nuevo_lider() {
    var response = this.http.get(this.url + "ultimoLider",this.httpOptions);
    response.subscribe((resultado: number) => {
      this.resultado=resultado;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
      this.form_agregar.get('liderID').setValue(resultado + 1);
    },
      error => {
        console.log("Error", error)
      });
  }
  //List Lider
  get_Liders() {
    var response = this.http.get(this.url + "lider/sede?Rsede="+localStorage.getItem('sede'),this.httpOptions);
    response.subscribe((data: any[]) => {
      this.arrayLideres = data;
      if (this.arrayLideres == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
    },
      error => {
        console.log("Error", error)
      });
  }

  agregar_lider() {
    //Spiner
    var spinner_agregar = document.getElementById("spinner_agregar");
    spinner_agregar.removeAttribute("hidden");
    this.http.post(this.url + "Lider", this.form_agregar.value,this.httpOptions).subscribe(data => {
      this.resultado=data;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
      spinner_agregar.setAttribute("hidden", "true");
      alert("Lider Guardado");
      this.clean_Agregar();
      this.get_nuevo_lider();
      this.get_Liders();
    },
      error => {
        spinner_agregar.setAttribute("hidden", "true");
        alert("Error.");
        console.log("Error", error);
      });
  }

  modificar_lider() {
    var spinner_agregar = document.getElementById("spinner_agregar");
    spinner_agregar.removeAttribute("hidden");

    //Update mediante el id y los campos de agregar
    this.http.put(this.url + "Lider/" + this.form_buscar.value.buscarID, this.form_agregar.value,this.httpOptions).subscribe(data => {
      this.resultado=data;
      if (this.resultado == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
      spinner_agregar.setAttribute("hidden", "true");
      alert("Evento Modificado");
      this.get_Liders();
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

  radioChange(event: any) {

    this.agregar_o_modificar = event.target.value;
    var lider_btn_buscar = document.getElementById("lider_btn_buscar");

    if (this.agregar_o_modificar == "nuevo") {
      this.clean_Buscar();
      this.clean_Agregar();
      this.get_nuevo_lider();

      lider_btn_buscar.setAttribute("disabled", "true");
    }
    else if (this.agregar_o_modificar == "modificar") {
      lider_btn_buscar.removeAttribute("disabled");
      lider_btn_buscar.setAttribute("enable", "true");

      this.clean_Buscar();
      this.clean_Agregar();
    }
  }

  eliminar_lider(id: any) {
    var r = confirm("¿Esta seguro que desea eliminar el Lider: "+id+" ?");
    if (r == false) {
      return;
    }
    else {
      var response = this.http.delete(this.url + "Lider/" + id,this.httpOptions);
      response.subscribe((data: any[]) => {
        this.resultado=data;
        if (this.resultado == "Sesión invalida") {          
          this.router.navigate(['/login']);
          return;
         }
        alert("Se a eliminado el Lider: " + id);
        this.get_Liders();
        this.get_nuevo_lider();
      },
        error => {
          alert("Error.");
          console.log("Error", error)
        });
    }
  }
}
