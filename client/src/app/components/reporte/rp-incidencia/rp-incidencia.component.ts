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
  selector: 'rp-incidencia',
  templateUrl: './rp-incidencia.component.html',
  styleUrls: ['./rp-incidencia.component.css']
})
export class RpIncidenciaComponent implements OnInit {

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
      incidenciaid: [],
      miembroid: [],
      grupo: [],
      fechaincidencia1: [],
      fechaincidencia2: [],
      area_actividad: [],
      tipoproblema: [],
      sede:[],
    })
  }

  //controls Agregar
  get f_A() {
    return this.form_report.controls;
  }

  //reset agregar
  public clean_Agregar() {
    this.submit_agregar = false;
    this.form_report.reset();
    // this.form_report.get('donacionID').setValue(0);
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
      this.nombre = 'Informe-Incidencia'
    } else {
      this.nombre = this.form_report.value.nombreinforme;
    }
    for (let i in this.informe) {
      console.log(i);
      excel.push({
        ID_Incidencia:this.informe[i].no_incidencia,
        ID_Miembro:this.informe[i].miembroID,
        Sede:this.informe[i].sede,
        Nombre_Niño:this.informe[i].nombresnino,
        Grupo:this.informe[i].grupo,
        Fecha_Incidencia:this.informe[i].fecha_incidencia,
        Instructor:this.informe[i].quien_detecto,
        Area_Actividad:this.informe[i].area_actividad,
        Conducta_Problema:this.informe[i].conducta_problema,
        Descripción:this.informe[i].descripcion,
        Canalización:this.informe[i].canaliza,
        Solución:this.informe[i].solucion,
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
    var img = new Image();
    img.src = ('./assets/img/logo.png');
    var registros='Informe Incidencia.     Registros: '+this.contador;

    var pageContent = function (data) {
      // HEADER
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.setFontStyle('normal');

      //https://www.youtube.com/watch?v=7hUr0P9nHF8

      // doc.addImage(imgData, 'PNG', data.settings.margin.left, 15, 10, 10);

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
      html: '#informeincidencia',
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
      this.nombre = 'Informe-Incidencia.pdf'
    } else {
      this.nombre = this.form_report.value.nombreinforme + '.pdf';
    }

    doc.save(this.nombre);
    spinner_buscar_evento.setAttribute("hidden", "true");
  }

  //peticion para llenar la tabla
  crear_informe() {
    this.submit_agregar = true;
    if (this.form_report.value.incidenciaid == null || this.form_report.value.incidenciaid == '') {
      this.form_report.get('incidenciaid').setValue(0);
    }
    if (this.form_report.value.miembroid == null || this.form_report.value.miembroid  == '') {
      this.form_report.get('miembroid').setValue(0);
    }    
    if (this.form_report.value.grupo == null || this.form_report.value.grupo == '') {
      this.form_report.get('grupo').setValue('null');
    }
    if (this.form_report.value.fechaincidencia1 == null || this.form_report.value.fechaincidencia1 == '') {
      this.form_report.get('fechaincidencia1').setValue('null');
    }
    if (this.form_report.value.fechaincidencia2 == null || this.form_report.value.fechaincidencia2 == '') {
      this.form_report.get('fechaincidencia2').setValue('null');
    } 
     if (this.form_report.value.area_actividad == null || this.form_report.value.area_actividad == '') {
      this.form_report.get('area_actividad').setValue('null');
    }
    if (this.form_report.value.tipoproblema == null || this.form_report.value.tipoproblema == '') {
      this.form_report.get('tipoproblema').setValue('null');
    } 
    var response = this.http.get(this.url
      + 'incidencia/reporte?Rincidenciaid='+this.form_report.value.incidenciaid
      + '&Rmiembroid='+this.form_report.value.miembroid
      + '&Rgrupo='+ this.form_report.value.grupo
      + '&RFechaincidencia1='+ this.form_report.value.fechaincidencia1
      + '&RFechaincidencia2='+ this.form_report.value.fechaincidencia2
      + '&Rareaactividad='+ this.form_report.value.area_actividad
      + '&Rtipoproblema='+ this.form_report.value.tipoproblema
      + '&Rsede='+this.form_report.value.sede,this.httpOptions
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
