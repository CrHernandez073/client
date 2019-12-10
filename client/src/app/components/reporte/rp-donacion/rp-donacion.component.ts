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
import { image } from 'html2canvas/dist/types/css/types/image';

@Component({
  selector: 'rp-donacion',
  templateUrl: './rp-donacion.component.html',
  styleUrls: ['./rp-donacion.component.css']
})
export class RpDonacionComponent implements OnInit {
  data: any;
  nombre: any;

  constructor(private http: HttpClient, private formBuilder: FormBuilder, private excelService: ExcelService) {
    this.get_Lider();
    this.get_Eventoe();
    this.get_Campana();
  }
  //busqueda
  informe: any;
  arrayLideres: any;
  arrayCampanas: any;
  arrayEventos: any;

  contador: any = 0;

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
      donacionid: [0],
      liderID: [],
      campanaID: [],
      eventoID: [],
      fechadonacion1: [],
      fechadonacion2: [],
      tipodonante: [],
      estatus: [],
      tipodonacion: [],
      frecuencia: [],
      primerpago1: [],
      primerpago2: [],
      rfc: [],
      pais: [],
      estado: [],
      municipio: [],
      status: [],
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
    this.form_report.get('donacionID').setValue(0);
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
      this.nombre = 'Informe-Donacion'
    } else {
      this.nombre = this.form_report.value.nombreinforme;
    }
    for (let i in this.informe) {
      console.log(i);
      excel.push({
        ID: this.informe[i].donacion.donacion.donacion.donacion.donacionID,
        Donante: this.informe[i].donacion.donacion.donacion.donacion.nombre,
        Sede: this.informe[i].donacion.donacion.donacion.donacion.sede,
        Status: this.informe[i].donacion.donacion.donacion.donacion.status,
        Fecha_Donacion: this.informe[i].donacion.donacion.donacion.donacion.fechadonacion,
        Tipo_Donante: this.informe[i].donacion.donacion.donacion.donacion.tipodonante,
        Nombre_Fiscal: this.informe[i].donacion.donacion.donacion.donacion.nombrefiscal,
        Tipo_Donacion: this.informe[i].donacion.donacion.donacion.donacion.tipodonacion,
        Monto: this.informe[i].donacion.donacion.donacion.donacion.monto,
        Estado: this.informe[i].donacion.donacion.donacion.donacion.Estado,
        Primer_Pago: this.informe[i].donacion.donacion.donacion.donacion.primerpago,
        Frecuencia: this.informe[i].donacion.donacion.donacion.donacion.frecuencia,
        Lider: this.informe[i].donacion.donacion.descripcion,
        Campaña: this.informe[i].descripcion,
        Evento: this.informe[i].donacion.descripcion,
        Observacion: this.informe[i].donacion.donacion.donacion.donacion.observacion,
      });

    }

    this.excelService.exportAsExcelFile(excel, this.nombre);
    spinner_excel.setAttribute("hidden", "true");
  }

  //crear pdf
  captureScreen() {
    if (this.contador==0){
      alert("No hay registros.");
      return;
    }
    var spinner_buscar_evento = document.getElementById("spinner_pdf");
    spinner_buscar_evento.removeAttribute("hidden");

    var doc = new jsPDF('l', 'mm', 'a4');
    var totalPagesExp = "{total_pages_count_string}";
    var registros = 'Informe Donaciones.     Registros: ' + this.contador;

    var img = new Image();
    img.src = ('./assets/img/logo.png');



    var pageContent = function (data) {
      // HEADER
      doc.setFontSize(10);
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
      html: '#contentToConvert',
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
      this.nombre = 'Informe-Donacion.pdf'
    } else {
      this.nombre = this.form_report.value.nombreinforme + '.pdf';
    }

    doc.save(this.nombre);
    spinner_buscar_evento.setAttribute("hidden", "true");
  }

  //peticion para llenar la tabla
  crear_informe() {
    var spinner_consulta_donacion = document.getElementById("spinner_consulta_donacion");
    spinner_consulta_donacion.setAttribute("hidden", "false");
    this.submit_agregar = true;
    if (this.form_report.value.tipodonante == null || this.form_report.value.tipodonante == '') {
      this.form_report.get('tipodonante').setValue('null');
    }
    if (this.form_report.value.donacionid == null) {
      this.form_report.get('donacionID').setValue(0);
    }
    if (this.form_report.value.status == null || this.form_report.value.status == '') {
      this.form_report.get('status').setValue('null');
    }
    if (this.form_report.value.fechadonacion1 == null || this.form_report.value.fechadonacion1 == '') {
      this.form_report.get('fechadonacion1').setValue('null');
    }
    if (this.form_report.value.fechadonacion2 == null || this.form_report.value.fechadonacion2 == '') {
      this.form_report.get('fechadonacion2').setValue('null');
    }
    if (this.form_report.value.liderID == null || this.form_report.value.liderID == '') {
      this.form_report.get('liderID').setValue(0);
    }
    if (this.form_report.value.campanaID == null || this.form_report.value.campanaID == '') {
      this.form_report.get('campanaID').setValue(0);
    }
    if (this.form_report.value.eventoID == null || this.form_report.value.eventoID == '') {
      this.form_report.get('eventoID').setValue(0);
    }
    if (this.form_report.value.primerpago1 == null || this.form_report.value.primerpago1 == '') {
      this.form_report.get('primerpago1').setValue('null');
    }
    if (this.form_report.value.primerpago2 == null || this.form_report.value.primerpago2 == '') {
      this.form_report.get('primerpago2').setValue('null');
    }
    if (this.form_report.value.tipodonacion == null || this.form_report.value.tipodonacion == '') {
      this.form_report.get('tipodonacion').setValue('null');
    }
    if (this.form_report.value.frecuencia == null || this.form_report.value.frecuencia == '') {
      this.form_report.get('frecuencia').setValue('null');
    }
    if (this.form_report.value.estatus == null || this.form_report.value.estatus == '') {
      this.form_report.get('estatus').setValue('null');
    }
    if (this.form_report.value.rfc == null || this.form_report.value.rfc == '') {
      this.form_report.get('rfc').setValue('null');
    }
    if (this.form_report.value.pais == null || this.form_report.value.pais == '') {
      this.form_report.get('pais').setValue('null');
    }
    if (this.form_report.value.estado == null || this.form_report.value.estado == '') {
      this.form_report.get('estado').setValue('null');
    }
    if (this.form_report.value.municipio == null || this.form_report.value.municipio == '') {
      this.form_report.get('municipio').setValue('null');
    }
    var response = this.http.get(this.url
      + "donacion/reporte?RDonID=" + this.form_report.value.donacionid
      + "&RTD=" + this.form_report.value.tipodonante
      + "&RSTS=" + this.form_report.value.status
      + "&RFdonante1=" + this.form_report.value.fechadonacion1
      + "&RFdonante2=" + this.form_report.value.fechadonacion2
      + "&RLID=" + this.form_report.value.liderID
      + "&RCID=" + this.form_report.value.campanaID
      + "&REID=" + this.form_report.value.eventoID
      + "&RFdonacion1=" + this.form_report.value.primerpago1
      + "&RFdonacion2=" + this.form_report.value.primerpago2
      + "&RTdonacion=" + this.form_report.value.tipodonacion
      + "&RFrecuencia=" + this.form_report.value.frecuencia
      + "&RStatus=" + this.form_report.value.estatus
      + "&RRFC=" + this.form_report.value.rfc
      + "&RPais=" + this.form_report.value.pais
      + "&REstado=" + this.form_report.value.estado
      + "&RMunicipio=" + this.form_report.value.municipio
      + "&Rsede="+this.form_report.value.sede,this.httpOptions
    );


    response.subscribe((data: any[]) => {
      this.informe = data;
      this.contador = data.length;
    },
      error => {
        console.log("Error", error)
      });

    spinner_consulta_donacion.setAttribute("hidden", "true");
  }

  get_Lider() {
    var response = this.http.get(this.url + "Lider/",this.httpOptions);
    response.subscribe((data: any[]) => {
      this.arrayLideres = data;
    },
      error => {
        console.log("Error", error)
      });
  }
  get_Campana() {
    var response = this.http.get(this.url + "Campana/",this.httpOptions);
    response.subscribe((data: any[]) => {
      this.arrayCampanas = (data);
    },
      error => {
        console.log("Error", error)
      });
  }
  get_Eventoe() {
    var response = this.http.get(this.url + "Eventoe/",this.httpOptions);
    response.subscribe((data: any[]) => {
      this.arrayEventos = (data);
    },
      error => {
        console.log("Error", error)
      });
  }
}
