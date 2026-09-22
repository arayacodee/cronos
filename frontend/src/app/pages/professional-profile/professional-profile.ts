import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/services/api.service';
import { Business } from '../../models/business.model';

@Component({
  selector: 'app-professional-profile',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './professional-profile.html',
  styleUrl: './professional-profile.css'
})
export class ProfessionalProfile implements OnInit {
  business = signal<Business | null>(null);

    // Estado temporal usado para seleccionar,
  // previsualizar y subir la foto de perfil.
  selectedAvatar = signal<File | null>(null);
  avatarPreview = signal<string | null>(null);
  uploadingAvatar = signal(false);

  selectedCover = signal<File | null>(null);
  coverPreview = signal<string | null>(null);
  uploadingCover = signal(false);


  loading = signal(true);
  saving = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  form = {
    name: '',
    description: ''
  };

  constructor(
    private readonly api: ApiService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    // El backend determina qué negocio pertenece
    // al profesional que posee la sesión activa.
    this.api.getMyBusiness().subscribe({
      next: (business) => {
        this.business.set(business);

        this.form = {
          name: business.name,
          description:
            business.description ?? ''
        };

        this.loading.set(false);
      },

      error: (error) => {
        console.error(error);

        this.errorMessage.set(
          'No fue posible cargar tu perfil.'
        );

        this.loading.set(false);
      }
    });
  }

  onAvatarSelected(event: Event): void {
      const input =
        event.target as HTMLInputElement;

      const file =
        input.files?.[0] ?? null;

      if (!file) {
        return;
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
      ];

      if (!allowedTypes.includes(file.type)) {
        this.errorMessage.set(
          'Selecciona una imagen JPEG, PNG o WebP.'
        );

        input.value = '';
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage.set(
          'La foto de perfil no puede superar 2 MB.'
        );

        input.value = '';
        return;
      }

      this.errorMessage.set('');
      this.successMessage.set('');

      this.selectedAvatar.set(file);

      // La previsualización es local y no sube nada todavía.
      // El archivo llegará a Cloudinary solo al guardar la fotografía.
      this.avatarPreview.set(
        URL.createObjectURL(file)
      );
    }

    uploadAvatar(): void {
    const file =
      this.selectedAvatar();

    if (!file) {
      this.errorMessage.set(
        'Selecciona una imagen primero.'
      );

      return;
    }

    this.uploadingAvatar.set(true);

    this.errorMessage.set('');
    this.successMessage.set('');

    this.api
      .uploadBusinessAvatar(file)
      .subscribe({
        next: (business) => {
          // La respuesta ya contiene la URL guardada en Neon.
          // Actualizamos el perfil sin tener que recargar la página.
          this.business.set(business);

          this.selectedAvatar.set(null);
          this.avatarPreview.set(null);

          this.successMessage.set(
            'Foto de perfil actualizada correctamente.'
          );

          this.uploadingAvatar.set(false);
        },

        error: (error) => {
          console.error(error);

          this.errorMessage.set(
            error?.error?.error ??
              'No fue posible subir la fotografía.'
          );

          this.uploadingAvatar.set(false);
        }
      });
  }


  onCoverSelected(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage.set(
        'Selecciona una imagen JPEG, PNG o WebP.'
      );

      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set(
        'La portada no puede superar 5 MB.'
      );

      input.value = '';
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.selectedCover.set(file);

    // Creamos una URL temporal para mostrar la portada
    // antes de enviarla realmente a Cloudinary.
    this.coverPreview.set(
      URL.createObjectURL(file)
    );
  }

  uploadCover(): void {
    const file =
      this.selectedCover();

    if (!file) {
      this.errorMessage.set(
        'Selecciona una portada primero.'
      );

      return;
    }

    this.uploadingCover.set(true);

    this.errorMessage.set('');
    this.successMessage.set('');

    this.api
      .uploadBusinessCover(file)
      .subscribe({
        next: (business) => {
          // La respuesta ya contiene la URL persistida en Neon.
          // Actualizamos inmediatamente la vista local.
          this.business.set(business);

          this.selectedCover.set(null);
          this.coverPreview.set(null);

          this.successMessage.set(
            'Portada actualizada correctamente.'
          );

          this.uploadingCover.set(false);
        },

        error: (error) => {
          console.error(error);

          this.errorMessage.set(
            error?.error?.error ??
              'No fue posible subir la portada.'
          );

          this.uploadingCover.set(false);
        }
      });
  }


  saveProfile(): void {
    const name =
      this.form.name.trim();

    const description =
      this.form.description.trim();

    if (name.length < 2) {
      this.errorMessage.set(
        'El nombre debe tener al menos 2 caracteres.'
      );

      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.api.updateMyBusiness({
      name,
      description:
        description || null
    }).subscribe({
      next: (business) => {
        // Actualizamos también el estado local para que
        // la página refleje inmediatamente los cambios.
        this.business.set(business);

        this.form = {
          name: business.name,
          description:
            business.description ?? ''
        };

        this.successMessage.set(
          'Perfil actualizado correctamente.'
        );

        this.saving.set(false);
      },

      error: (error) => {
        console.error(error);

        this.errorMessage.set(
          error?.error?.error ??
            'No fue posible actualizar tu perfil.'
        );

        this.saving.set(false);
      }
    });
  }
}
