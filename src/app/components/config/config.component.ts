import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { v4 as uuidv4 } from 'uuid';
import { GLOBAL } from '../../services/global';

declare var jQuery: any;
declare var $: any;
declare var iziToast: any;

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css' // Corregido de styleUrl a styleUrls
  ]
})
export class ConfigComponent implements OnInit {
  public idConfig: any ='664cef82d033ba9cec80115e';

  public token: string | null;
  public config: any = {};
  public url: string;
  public titulo_cat: string = '';
  public icono_cat: string = '';
  public file: File | undefined;
  public imgSelect: string | ArrayBuffer = '';

  constructor(private _adminService: AdminService) {
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.obtenerConfig();
  }

  obtenerConfig(): void {
    this._adminService.obtener_config_admin(this.token).subscribe(
      response => {
        this.config = response.data;
        this.imgSelect = `${this.url}obtener_logo/${this.config.logo}`;
      },
      error => this.mostrarError(error)
    );
  }

  agregar_cat(): void {
    if (this.titulo_cat && this.icono_cat) {
      this.config.categorias.push({
        titulo: this.titulo_cat,
        icono: this.icono_cat,
        _id: uuidv4()
      });
      this.titulo_cat = '';
      this.icono_cat = '';
    } else {
      this.mostrarError('Debe ingresar un título e icono para la categoría');
    }
  }

  actualizar(confForm: any): void {
    if (confForm.valid) {
      const data = {
        titulo: confForm.value.titulo,
        serie: confForm.value.serie,
        correlativo: confForm.value.correlativo,
        categorias: this.config.categorias,
        logo: this.file
      };

      this._adminService.actualizar_config_admin(this.idConfig, data, this.token).subscribe(
        () => this.mostrarExito('Se actualizó correctamente la configuración'),
        error => this.mostrarError(error)
      );
    } else {
      this.mostrarError('Complete correctamente el formulario');
    }
  }

  fileChangeEvent(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) {
      return this.mostrarError('No hay una imagen de envío');
    }

    if (!this.validarArchivo(file)) return;

    const reader = new FileReader();
    reader.onload = () => this.imgSelect = reader.result as string;
    reader.readAsDataURL(file);
    $('#input-portada').text(file.name);
    this.file = file;
  }

  validarArchivo(file: File): boolean {
    if (file.size > 4000000) {
      this.mostrarError('La imagen no puede superar los 4MB');
      return false;
    }
    const validTypes = ['image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      this.mostrarError('El archivo debe ser una imagen');
      return false;
    }
    return true;
  }

  mostrarError(message: string): void {
    iziToast.show({
      title: 'ERROR',
      titleColor: '#FF0000',
      class: 'text-danger',
      position: 'topRight',
      message
    });
  }

  mostrarExito(message: string): void {
    iziToast.show({
      title: 'SUCCESS',
      titleColor: '#1DC74C',
      class: 'text-SUCCESS',
      position: 'topRight',
      message
    });
  }

  eliminar_categoria(idx: number): void {
    this.config.categorias.splice(idx, 1);
  }

  ngDoCheck(): void {
    $('.cs-file-drop-preview').html(`<img src="${this.imgSelect}">`);
  }
}
