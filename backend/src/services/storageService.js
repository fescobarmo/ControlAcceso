const { supabaseAdmin, isStorageEnabled } = require('../config/storage');
const path = require('path');

class StorageService {
  constructor() {
    if (!isStorageEnabled) {
      console.warn('⚠️  StorageService: Supabase Storage no está configurado');
    }
  }

  /**
   * Verificar si Storage está habilitado
   */
  checkEnabled() {
    if (!isStorageEnabled) {
      throw new Error('Supabase Storage no está configurado. Configura SUPABASE_URL y SUPABASE_SERVICE_KEY en .env');
    }
  }

  /**
   * Subir archivo a Supabase Storage
   * @param {string} bucket - Nombre del bucket
   * @param {string} filepath - Ruta del archivo en el bucket
   * @param {Buffer} file - Buffer del archivo
   * @param {string} contentType - Tipo MIME del archivo
   * @returns {Promise<{url: string, path: string}>}
   */
  async uploadFile(bucket, filepath, file, contentType) {
    this.checkEnabled();

    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filepath, file, {
          contentType,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Error uploading file: ${error.message}`);
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(filepath);

      return {
        path: data.path,
        url: publicUrl
      };
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }

  /**
   * Eliminar archivo de Supabase Storage
   * @param {string} bucket - Nombre del bucket
   * @param {string} filepath - Ruta del archivo
   */
  async deleteFile(bucket, filepath) {
    this.checkEnabled();

    try {
      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([filepath]);

      if (error) {
        throw new Error(`Error deleting file: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteFile:', error);
      throw error;
    }
  }

  /**
   * Obtener URL firmada (para archivos privados)
   * @param {string} bucket - Nombre del bucket
   * @param {string} filepath - Ruta del archivo
   * @param {number} expiresIn - Segundos hasta que expire (default: 1 hora)
   */
  async getSignedUrl(bucket, filepath, expiresIn = 3600) {
    this.checkEnabled();

    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(filepath, expiresIn);

      if (error) {
        throw new Error(`Error getting signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error in getSignedUrl:', error);
      throw error;
    }
  }

  /**
   * Listar archivos en un bucket
   * @param {string} bucket - Nombre del bucket
   * @param {string} folder - Carpeta (opcional)
   */
  async listFiles(bucket, folder = '') {
    this.checkEnabled();

    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        throw new Error(`Error listing files: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in listFiles:', error);
      throw error;
    }
  }

  /**
   * Generar nombre único para archivo
   * @param {string} originalName - Nombre original del archivo
   * @param {string} prefix - Prefijo (ej: 'avatar', 'document')
   */
  generateUniqueFileName(originalName, prefix = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
    
    return prefix 
      ? `${prefix}_${timestamp}_${random}${ext}`
      : `${baseName}_${timestamp}_${random}${ext}`;
  }

  /**
   * Validar tipo de archivo
   * @param {string} mimetype - Tipo MIME del archivo
   * @param {string[]} allowedTypes - Tipos permitidos
   */
  validateFileType(mimetype, allowedTypes) {
    return allowedTypes.includes(mimetype);
  }

  /**
   * Validar tamaño de archivo
   * @param {number} size - Tamaño en bytes
   * @param {number} maxSize - Tamaño máximo en bytes
   */
  validateFileSize(size, maxSize) {
    return size <= maxSize;
  }

  /**
   * Obtener extensión de archivo desde mimetype
   */
  getExtensionFromMimetype(mimetype) {
    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
    };
    return mimeToExt[mimetype] || '';
  }
}

module.exports = new StorageService();

