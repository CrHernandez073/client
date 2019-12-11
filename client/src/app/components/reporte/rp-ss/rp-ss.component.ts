import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as jspdf from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { autoTable as AutoTable } from 'jspdf-autotable';
import { ExcelService } from '../../../excel.service';

@Component({
  selector: 'rp-ss',
  templateUrl: './rp-ss.component.html',
  styleUrls: ['./rp-ss.component.css']
})
export class RpSSComponent implements OnInit {

  data: any;
  nombre: any;

  constructor(
    private http: HttpClient, 
    private formBuilder: FormBuilder, 
    private excelService: ExcelService, 
    private router: Router
    ) {
  }
  //busqueda
  informe: any;
  contador: any=0;

  //Formularios
  form_report: FormGroup;

  //validacion
  submit_agregar = false;
  guardando: boolean=false;

  httpOptions = {
		headers: new HttpHeaders({
			'Content-Type':  'application/json',
			'miembroID': localStorage.getItem('miembroID'),
			'Authorization': localStorage.getItem('Authorization')
		})
	};

  url = "https://api-remota.conveyor.cloud/api/";

  ngOnInit() {
    //buscar
    this.form_report = this.formBuilder.group({
      nombreinforme: [],
      idSS: [],
      Estado: [],
      Sede: [],
      Fecha_Nacimiento1: [],
      Fecha_Nacimiento2: [],
      Enfermedad: [],
      Alergia: [],
      Lunes: [],
      Martes: [],
      Miercoles: [],
      Jueves: [],
      Viernes: [],
    })
  }

  //controls Agregar
  get f_A() {
    return this.form_report.controls;
  }
   get f2() {
    return this.form_report.controls;
  }


  //reset agregar
  public clean_Agregar() {
    this.submit_agregar = false;
    this.form_report.reset();
  }

  //crear excel
  exportAsXLSX(): void {
    if (this.contador==0){
      alert("No hay registros.");
      return;
    }
    var excel = [];

    var spinner_excel = document.getElementById("spinner_excel");
    spinner_excel.removeAttribute("hidden");

    if (this.form_report.value.nombreinforme == null) {
      this.nombre = 'Informe-Servicio-Social'
    } else {
      this.nombre = this.form_report.value.nombreinforme;
    }
    for (let i in this.informe) {
      console.log(i);
      excel.push({
        //meter todo
        ID_Staff: this.informe.idStaff,
        Estado: this.informe[i].estado,
        Sede: this.informe[i].sede,
        Nombre: this.informe[i].nombrestaff,
        Fecha_Nacimiento: this.informe[i].fecha_nacimiento,
        Telefono: this.informe[i].Telefono,
        Email: this.informe[i].correo,
        Domicilio: this.informe[i].domicilio,
        Escuela_Proviene: this.informe[i].escuela,
        Tipo: this.informe[i].tipo,
        Enfermedad: this.informe[i].Enfermedad,
        Alergia: this.informe[i].Alergia,
        Tel_Emergencia: this.informe[i].telefono_emergencia,
        Contacto: this.informe[i].parentesco_emergencia,
        lunes: this.informe[i].horas_lunes,
        martes: this.informe[i].horas_martes,
        miercoles: this.informe[i].horas_miercoles,
        jueves: this.informe[i].horas_jueves,
        viernes: this.informe[i].horas_viernes,

      });
    }
    this.excelService.exportAsExcelFile(excel, this.nombre);
    spinner_excel.setAttribute("hidden", "true");
  }

  //crear pdf
  public captureScreen() {
    if (this.contador==0){
      alert("No hay registros.");
      return;
    }
    var spinner_buscar_evento = document.getElementById("spinner_pdf");
    spinner_buscar_evento.removeAttribute("hidden");

    var doc = new jsPDF('l', 'mm', 'a4');
    var totalPagesExp = "{total_pages_count_string}";
    var registros='Informe Servicio Social.     Registros: '+this.contador;
    var img = new Image();
    img.src = ('./assets/img/logo.png');

    var pageContent = function (data) {
      // HEADER
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.setFontStyle('normal');

      //https://www.youtube.com/watch?v=7hUr0P9nHF8
      doc.addImage(img, 'PNG', data.settings.margin.left, 15, 50, 10);
      doc.text(registros, data.settings.margin.left + 60, 22); 


      // FOOTER
      var str = "Page " + data.pageCount;
      // Total page number
      if (typeof doc.putTotalPages === 'function') {
        str = str + " of " + totalPagesExp;
      }
      doc.setFontSize(10);
      doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
    };

    doc.autoTable({
      html: '#informeSS',
      columnStyles: { 0: { halign: 'center' } },  // Cells in first column centered and green(, fillColor: [0, 255, 0])
      didDrawPage: pageContent,
      margin: {
        top: 30
      }
    });

    // Total page number 
    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    if (this.form_report.value.nombreinforme == null) {
      this.nombre = 'Informe-Servicio-Social.pdf'
    } else {
      this.nombre = this.form_report.value.nombreinforme + '.pdf';
    }

    doc.save(this.nombre);
    spinner_buscar_evento.setAttribute("hidden", "true");
  }

  //peticion para llenar la tabla
  crear_informe() {
    this.submit_agregar = true;
    if (this.form_report.value.idSS == null || this.form_report.value.idSS == '') {
      this.form_report.get('idSS').setValue(0);
    }
    if (this.form_report.value.Sede == null || this.form_report.value.Sede == '') {
      this.form_report.get('Sede').setValue('null');
    }
    if (this.form_report.value.Estado == null || this.form_report.value.Estado == '') {
      this.form_report.get('Estado').setValue('null');
    }
    if (this.form_report.value.Fecha_Nacimiento1 == null || this.form_report.value.Fecha_Nacimiento1 == '') {
      this.form_report.get('Fecha_Nacimiento1').setValue('null');
    }
    if (this.form_report.value.Fecha_Nacimiento2 == null || this.form_report.value.Fecha_Nacimiento2 == '') {
      this.form_report.get('Fecha_Nacimiento2').setValue('null');
    }
    if (this.form_report.value.Enfermedad == null || this.form_report.value.Enfermedad == '') {
      this.form_report.get('Enfermedad').setValue('null');
    }
    if (this.form_report.value.Alergia == null || this.form_report.value.Alergia == '') {
      this.form_report.get('Alergia').setValue('null');
    }
    if (this.form_report.value.Lunes == null || this.form_report.value.Lunes == '') {
      this.form_report.get('Lunes').setValue(false);
    }
    if (this.form_report.value.Martes == null || this.form_report.value.Martes == '') {
      this.form_report.get('Martes').setValue(false);
    }
    if (this.form_report.value.Miercoles == null || this.form_report.value.Miercoles == '') {
      this.form_report.get('Miercoles').setValue(false);
    }
    if (this.form_report.value.Jueves == null || this.form_report.value.Jueves == '') {
      this.form_report.get('Jueves').setValue(false);
    }
    if (this.form_report.value.Viernes == null || this.form_report.value.Viernes == '') {
      this.form_report.get('Viernes').setValue(false);
    }
    var response = this.http.get(this.url
      + 'staff/reporte?Rsede=' + this.form_report.value.Sede
      + '&RidSS=' + this.form_report.value.idSS
      + '&Restado=' + this.form_report.value.Estado
      + '&RFechanacimiento1=' + this.form_report.value.Fecha_Nacimiento1
      + '&RFechanacimiento2=' + this.form_report.value.Fecha_Nacimiento2
      + '&REnfermedad=' + this.form_report.value.Enfermedad
      + '&RAlergia=' + this.form_report.value.Alergia
      + '&RLunes=' + this.form_report.value.Lunes
      + '&RMartes=' + this.form_report.value.Martes
      + '&RMiercoles=' + this.form_report.value.Miercoles
      + '&RJueves=' + this.form_report.value.Jueves
      + '&RViernes=' + this.form_report.value.Viernes,this.httpOptions
    );

    response.subscribe((data: any[]) => {
      this.informe = data;

      if (this.informe == "Sesión invalida") {          
        this.router.navigate(['/login']);
        return;
       }
      this.contador= data.length;
    },
      error => {
        console.log("Error", error)
      });
  }


}
