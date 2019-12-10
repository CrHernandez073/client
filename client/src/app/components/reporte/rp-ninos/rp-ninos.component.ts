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
  selector: 'rp-ninos',
  templateUrl: './rp-ninos.component.html',
  styleUrls: ['./rp-ninos.component.css']
})
export class RpNinosComponent implements OnInit {

  data: any;
  nombre: any;
  contador: any = 0;
  fecha1: any;
  fecha2: any;
  promedio_matutino: any;
  promedio_vespertino: any;

  constructor(private http: HttpClient, private formBuilder: FormBuilder, private excelService: ExcelService) {
  }
  //busqueda
  informe: any;
  informe_asistensia: any;
  informe_asistensia2: any;

  //Formularios
  form_report: FormGroup;
  form_ninos: FormGroup;

  //validacion
  submit_agregar = false;
  submit_nino = false;

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
      idnino: [],
      turno: [],
      nombrenino: [],
      fechainscripcion1: [],
      fechainscripcion2: [],
      fechanacimiento1: [],
      fechanacimiento2: [],
      sexo: [],
      nacionalidad: [],
      persona_autorizada: [],
      padre: [],
      madre: [],
      tutor: [],
      alergia: [],
      medicamento: [],
      cuidado_especial: [],
      estado: [],
      sede: [],
    })

    this.form_ninos = this.formBuilder.group({
      nombreinformes: [],
      seder: [, Validators.required],
      fecha1: [],
      fecha2: [],
    })

  }

  //controls Agregar
  get f_A() {
    return this.form_report.controls;
  }
  get f_B() {
    return this.form_ninos.controls;
  }

  //reset agregar
  public clean_Agregar() {
    this.submit_agregar = false;
    this.submit_nino = false;
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
      this.nombre = 'Informe-Niños'
    } else {
      this.nombre = this.form_report.value.nombreinforme;
    }
    for (let i in this.informe) {
      console.log(i);
      excel.push({
        ID_Niño: this.informe[i].miembro.miembro.idNinosDG,
        Sede: this.informe[i].miembro.miembro.sede,
        Estado: this.informe[i].miembro.miembro.estado,
        Nombre: this.informe[i].miembro.miembro.nombrenino,
        CURP: this.informe[i].miembro.miembro.curp,
        Turno: this.informe[i].miembro.miembro.turno_asiste,
        Fecha_Nacimiento: this.informe[i].miembro.miembro.fechanacimiento,
        Sexo: this.informe[i].miembro.miembro.sexo,
        Edad: this.informe[i].miembro.miembro.edad,
        Nacionalidad: this.informe[i].miembro.miembro.nacionalidad,
        Madre: this.informe[i].miembro.madre,
        Ocupación_madre: this.informe[i].miembro.trabajomadre,
        Contacto_Madre: this.informe[i].miembro.contactomadre,
        Padre: this.informe[i].miembro.padre,
        Ocupación_padre: this.informe[i].miembro.trabajopadre,
        Contacto_Padre: this.informe[i].miembro.contactopadre,
        Tutor: this.informe[i].miembro.tutor,
        Ocupacion_Tutor: this.informe[i].miembro.ocupaciontutor,
        Tel_Tutor: this.informe[i].miembro.teltutor,
        Persona_Autorizada: this.informe[i].miembro.miembro.persona_autorizada,
        Contacto_Emergencia1: this.informe[i].miembro.miembro.contacto1,
        Contacto_Emergencia2: this.informe[i].miembro.miembro.contacto2,
        Contacto_Emergencia3: this.informe[i].miembro.miembro.contacto3,
        Fecha_Ingreso: this.informe[i].miembro.miembro.fechainscripcion,
        Dirección: this.informe[i].miembro.miembro.direccion,
        Visa: this.informe[i].miembro.miembro.visa,
        Religion: this.informe[i].miembro.miembro.religion,
        Alergias: this.informe[i].alergia,
        Cuidado_especial: this.informe[i].cuidadoespecial,
        Medicamento: this.informe[i].medicamento,
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
    var registros = 'Informe Donaciones.     Registros: ' + this.contador;
    var img = new Image(); img.src = ('./assets/img/logo.png');

    var pageContent = function (data) {
      // HEADER
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.setFontStyle('normal');

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
      html: '#informeNinos',
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
      this.nombre = 'Informe-Niños.pdf'
    } else {
      this.nombre = this.form_report.value.nombreinforme + '.pdf';
    }

    doc.save(this.nombre);
    spinner_buscar_evento.setAttribute("hidden", "true");
  }

  //peticion para llenar la tabla
  crear_informe() {
    this.submit_agregar = true;
    if (this.form_report.value.idnino == null || this.form_report.value.idnino == '') {
      this.form_report.get('idnino').setValue(0);
    }
    if (this.form_report.value.turno == null || this.form_report.value.turno == '') {
      this.form_report.get('turno').setValue('null');
    }
    if (this.form_report.value.nombrenino == null || this.form_report.value.nombrenino == '') {
      this.form_report.get('nombrenino').setValue('null');
    }
    if (this.form_report.value.fechainscripcion1 == null || this.form_report.value.fechainscripcion1 == '') {
      this.form_report.get('fechainscripcion1').setValue('null');
    } if (this.form_report.value.fechainscripcion2 == null || this.form_report.value.fechainscripcion2 == '') {
      this.form_report.get('fechainscripcion2').setValue('null');
    }
    if (this.form_report.value.fechanacimiento1 == null || this.form_report.value.fechanacimiento1 == '') {
      this.form_report.get('fechanacimiento1').setValue('null');
    }
    if (this.form_report.value.fechanacimiento2 == null || this.form_report.value.fechanacimiento2 == '') {
      this.form_report.get('fechanacimiento2').setValue('null');
    }
    if (this.form_report.value.sexo == null || this.form_report.value.sexo == '') {
      this.form_report.get('sexo').setValue('null');
    }
    if (this.form_report.value.nacionalidad == null || this.form_report.value.nacionalidad == '') {
      this.form_report.get('nacionalidad').setValue('null');
    }
    if (this.form_report.value.persona_autorizada == null || this.form_report.value.persona_autorizada == '') {
      this.form_report.get('persona_autorizada').setValue('null');
    }
    if (this.form_report.value.alergia == null || this.form_report.value.alergia == '') {
      this.form_report.get('alergia').setValue('null');
    }
    if (this.form_report.value.medicamento == null || this.form_report.value.medicamento == '') {
      this.form_report.get('medicamento').setValue('null');
    }
    if (this.form_report.value.cuidado_especial == null || this.form_report.value.cuidado_especial == '') {
      this.form_report.get('cuidado_especial').setValue('null');
    }
    if (this.form_report.value.estado == null || this.form_report.value.estado == '') {
      this.form_report.get('estado').setValue('null');
    }
    if (this.form_report.value.sede == null || this.form_report.value.sede == '') {
      this.form_report.get('sede').setValue('null');
    }
    var response = this.http.get(this.url
      + 'Nino/reporte?Rturno=' + this.form_report.value.turno
      + '&Ridnino=' + this.form_report.value.idnino
      + '&Rnombrenino=' + this.form_report.value.nombrenino
      + '&Rfechainscripcion1=' + this.form_report.value.fechainscripcion1
      + '&Rfechainscripcion2=' + this.form_report.value.fechainscripcion2
      + '&Rfechanacimient1=' + this.form_report.value.fechanacimiento1
      + '&Rfechanacimient2=' + this.form_report.value.fechanacimiento2
      + '&Rsexo=' + this.form_report.value.sexo
      + '&nacionalidad=' + this.form_report.value.nacionalidad
      + '&Rpersonautho=' + this.form_report.value.persona_autorizada
      + '&Ralergia=' + this.form_report.value.alergia
      + '&Rmedicamento=' + this.form_report.value.medicamento
      + '&Rcuidadoespc=' + this.form_report.value.cuidado_especial
      + '&Restado=' + this.form_report.value.estado
      + '&Rsede=' + this.form_report.value.sede, this.httpOptions
    );

    response.subscribe((data: any[]) => {
      this.informe = data;
      this.contador = data.length;
    },
      error => {
        console.log("Error", error)
      });
  }

  informe_ninos() {
    this.submit_nino = true;
    if (this.form_ninos.invalid) {
      return;
    }
    this.asistensia_informe_ninos();
    this.edad_informe_ninos();

  }

  //peticion para llenar la tabla
  asistensia_informe_ninos() {
    {
      if (this.form_ninos.value.fecha1 == null) {
        this.fecha1 = '2000-01-01';
      } else {
        this.fecha1 = this.form_ninos.value.fecha1;
      }
      if (this.form_ninos.value.fecha2 == null) {
        this.fecha2 = '3000-01-01';
      } else {
        this.fecha2 = this.form_ninos.value.fecha2;
      }

      var response = this.http.get(this.url
        + 'Nino/sede/total?Rsede=' + this.form_ninos.value.seder
        + '&fecha1=' + this.fecha1
        + '&fecha2=' + this.fecha2, this.httpOptions
      );

      response.subscribe((data: any[]) => {
        this.informe_asistensia = data;
      },
        error => {
          console.log("Error", error)
        });
    }
  }
  //peticion para llenar la tabla
  edad_informe_ninos() {
    {
      if (this.form_ninos.value.fecha1 == null) {
        this.fecha1 = '2000-01-01';
      } else {
        this.fecha1 = this.form_ninos.value.fecha1;
      }
      if (this.form_ninos.value.fecha2 == null) {
        this.fecha2 = '3000-01-01';
      } else {
        this.fecha2 = this.form_ninos.value.fecha2;
      }

      var response = this.http.get(this.url
        + 'Nino/sede/total/asistencia?Rsede=' + this.form_ninos.value.seder
        + '&fecha1=' + this.fecha1
        + '&fecha2=' + this.fecha2, this.httpOptions
      );

      response.subscribe((data: any[]) => {
        this.informe_asistensia2 = data;
        this.promedio_matutino = this.informe_asistensia2.count_asistensia_Matutinos_fecha / this.informe_asistensia.count_total_matutino_activos;
        this.promedio_vespertino = this.informe_asistensia2.count_asistensia_Vespertino_fecha / this.informe_asistensia.count_total_vespertino_activos;

      },
        error => {
          console.log("Error", error)
        });
    }
  }

  //crear excel
  exportAsXLSX_asistencia(): void {
    var excel = [];

    var spinner_excel = document.getElementById("spinner_excel");
    spinner_excel.removeAttribute("hidden");

    if (this.form_ninos.value.nombreinformes == null) {
      this.nombre = 'Informe-Niños-Asistencia'
    } else {
      this.nombre = this.form_ninos.value.nombreinformes;
    }

    excel.push({
      Matutino_Inscritos: this.informe_asistensia.count_total_matutino,
      Vespertino_Inscritos: this.informe_asistensia.count_total_vespertino,
      Matutino_Activos: this.informe_asistensia.count_total_matutino_activos,
      Vespertino_Activos: this.informe_asistensia.count_total_vespertino_activos,
      Matutino_Baja: this.informe_asistensia.count_total_matutino_inactivos,
      Vespertino_Baja: this.informe_asistensia.count_total_vespertino_inactivos,
      Matutino_Total: this.informe_asistensia2.count_asistensia_Matutinos_fecha,
      Vespertino_Total: this.informe_asistensia2.count_asistensia_Vespertino_fecha,
      Promedio_Matutino: this.promedio_matutino,
      Promedio_Vespertino: this.promedio_vespertino,
      _: '',
      Total_matutino: this.informe_asistensia.count_total_matutino_activos,
      Niña_6_7_matutino: this.informe_asistensia.count_edad_6_7_F_matutino,
      Niño_6_7_matutino: this.informe_asistensia.count_edad_6_7_M_matutino,
      Niña_8_10_matutino: this.informe_asistensia.count_edad_8_10_F_matutino,
      Niño_8_10_matutino: this.informe_asistensia.count_edad_8_10_M_matutino,
      Niña_11_12_matutino: this.informe_asistensia.count_edad_11_12_F_matutino,
      Niño_11_12_matutino: this.informe_asistensia.count_edad_11_12_M_matutino,
      Niña_13_16_matutino: this.informe_asistensia.count_edad_13_16_F_matutino,
      Niño_13_16_matutino: this.informe_asistensia.count_edad_13_16_M_matutino,

      Niña_6_7_vespertino: this.informe_asistensia.count_edad_6_7_M_vespertino,
      Niño_6_7_vespertino: this.informe_asistensia.count_edad_6_7_F_vespertino,
      Niña_8_10_vespertino: this.informe_asistensia.count_edad_8_10_F_vespertino,
      Niño_8_10_vespertino: this.informe_asistensia.count_edad_8_10_M_vespertino,
      Niña_11_12_vespertino: this.informe_asistensia.count_edad_11_12_F_vespertino,
      Niño_11_12_vespertino: this.informe_asistensia.count_edad_11_12_M_vespertino,
      Niña_13_16_vespertino: this.informe_asistensia.count_edad_13_16_F_vespertino,
      Niño_13_16_vespertino: this.informe_asistensia.count_edad_13_16_M_vespertino,
      Total_vespertino: this.informe_asistensia.count_total_vespertino_activos,
    });
    this.excelService.exportAsExcelFile(excel, this.nombre);
    spinner_excel.setAttribute("hidden", "true");
  }

  //crear pdf
  public pdf_asistencia() {
    var spinner_buscar_evento = document.getElementById("spinner_pdf");
    spinner_buscar_evento.removeAttribute("hidden");

    var doc = new jsPDF('l', 'mm', 'a4');
    var totalPagesExp = "{total_pages_count_string}";
    var registros = 'Informe Niños .';
    var img = new Image(); img.src = ('./assets/img/logo.png');

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
      html: '#informeAsistensia',
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
      this.nombre = 'Informe-Niños.pdf'
    } else {
      this.nombre = this.form_report.value.nombreinforme + '.pdf';
    }

    doc.save(this.nombre);
    spinner_buscar_evento.setAttribute("hidden", "true");
  }
}