# 🗂️ Integración con Supabase Storage

Guía completa para integrar Supabase Storage (buckets serverless) en tu aplicación ControlAcceso.

---

## 📋 Índice

1. [¿Qué es Supabase Storage?](#qué-es-supabase-storage)
2. [Configurar Buckets](#configurar-buckets)
3. [Integrar en el Backend](#integrar-en-el-backend)
4. [Integrar en el Frontend](#integrar-en-el-frontend)
5. [Políticas de Seguridad](#políticas-de-seguridad)
6. [Casos de Uso](#casos-de-uso)

---

## 🎯 ¿Qué es Supabase Storage?

Supabase Storage es un servicio de almacenamiento de objetos serverless que te permite:

- ✅ Almacenar archivos (imágenes, PDFs, videos, etc.)
- ✅ Gestionar permisos con Row Level Security
- ✅ URLs públicas y privadas
- ✅ Transformación de imágenes on-the-fly
- ✅ Límites de tamaño configurables
- ✅ CDN integrado para acceso rápido

**Plan Gratuito:**
- 1 GB de almacenamiento
- 2 GB de transferencia/mes

---

## 📦 Paso 1: Configurar Buckets en Supabase

### 1.1. Crear Buckets

1. Ve a tu proyecto en [app.supabase.com](https://app.supabase.com)
2. En el menú lateral, selecciona **Storage**
3. Haz clic en **"New bucket"**

**Crear estos buckets:**

#### Bucket 1: `avatars` (Fotos de perfil)
```
Nombre: avatars
Público: Sí ✓
Tamaño máximo: 2MB
Formatos permitidos: image/jpeg, image/png, image/webp
```

#### Bucket 2: `documents` (Documentos privados)
```
Nombre: documents
Público: No ✗
Tamaño máximo: 10MB
Formatos permitidos: application/pdf, image/jpeg, image/png
```

#### Bucket 3: `resident-photos` (Fotos de residentes)
```
Nombre: resident-photos
Público: No ✗
Tamaño máximo: 5MB
Formatos permitidos: image/jpeg, image/png
```

### 1.2. Configurar mediante SQL (Alternativa)

Puedes crear buckets con SQL en el SQL Editor:

```sql
-- Crear bucket público para avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Crear bucket privado para documentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Crear bucket privado para fotos de residentes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resident-photos', 'resident-photos', false);
```

---

## 🔧 Paso 2: Integrar en el Backend

### 2.1. Instalar Cliente de Supabase

```bash
cd backend
npm install @supabase/supabase-js
```

### 2.2. Configurar Variables de Entorno

Edita `backend/.env`:

```env
# Supabase Storage
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**¿Dónde encontrar estas keys?**
1. Ve a **Settings** → **API** en Supabase
2. **Project URL** = SUPABASE_URL
3. **anon public** = SUPABASE_ANON_KEY
4. **service_role** = SUPABASE_SERVICE_KEY (⚠️ Mantén esto PRIVADO)

### 2.3. Crear Configuración de Storage

Crea `backend/src/config/storage.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

// Cliente con service role (para backend)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Cliente con anon key (para frontend)
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = {
  supabaseAdmin,
  supabaseClient
};
```

### 2.4. Crear Servicio de Storage

Crea `backend/src/services/storageService.js`:

```javascript
const { supabaseAdmin } = require('../config/storage');
const path = require('path');

class StorageService {
  /**
   * Subir archivo a Supabase Storage
   * @param {string} bucket - Nombre del bucket
   * @param {string} filepath - Ruta del archivo en el bucket
   * @param {Buffer} file - Buffer del archivo
   * @param {string} contentType - Tipo MIME del archivo
   * @returns {Promise<{url: string, path: string}>}
   */
  async uploadFile(bucket, filepath, file, contentType) {
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

      // Obtener URL pública o privada
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
    const baseName = path.basename(originalName, ext);
    
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
}

module.exports = new StorageService();
```

### 2.5. Crear Controller de Upload

Crea `backend/src/controllers/uploadController.js`:

```javascript
const storageService = require('../services/storageService');
const { usuarios } = require('../models');

class UploadController {
  /**
   * Subir avatar de usuario
   */
  async uploadAvatar(req, res) {
    try {
      const { id: userId } = req.user; // Del middleware de auth
      const file = req.file; // Del middleware multer

      if (!file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
      }

      // Validaciones
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!storageService.validateFileType(file.mimetype, allowedTypes)) {
        return res.status(400).json({ 
          error: 'Tipo de archivo no permitido. Solo JPEG, PNG o WebP' 
        });
      }

      if (!storageService.validateFileSize(file.size, maxSize)) {
        return res.status(400).json({ 
          error: 'Archivo muy grande. Máximo 2MB' 
        });
      }

      // Eliminar avatar anterior si existe
      const usuario = await usuarios.findByPk(userId);
      if (usuario.foto_perfil) {
        try {
          const oldPath = usuario.foto_perfil.split('/').slice(-1)[0];
          await storageService.deleteFile('avatars', `avatars/${oldPath}`);
        } catch (error) {
          console.log('Error eliminando avatar anterior:', error.message);
        }
      }

      // Generar nombre único
      const fileName = storageService.generateUniqueFileName(
        file.originalname, 
        `avatar_${userId}`
      );
      const filePath = `avatars/${fileName}`;

      // Subir a Supabase
      const { url } = await storageService.uploadFile(
        'avatars',
        filePath,
        file.buffer,
        file.mimetype
      );

      // Actualizar usuario
      await usuario.update({ foto_perfil: url });

      res.json({
        success: true,
        message: 'Avatar subido exitosamente',
        url
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      res.status(500).json({ 
        error: 'Error al subir avatar',
        details: error.message 
      });
    }
  }

  /**
   * Subir documento privado
   */
  async uploadDocument(req, res) {
    try {
      const { id: userId } = req.user;
      const file = req.file;
      const { tipo_documento, descripcion } = req.body;

      if (!file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
      }

      // Validaciones
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!storageService.validateFileType(file.mimetype, allowedTypes)) {
        return res.status(400).json({ 
          error: 'Tipo de archivo no permitido. Solo PDF, JPEG o PNG' 
        });
      }

      if (!storageService.validateFileSize(file.size, maxSize)) {
        return res.status(400).json({ 
          error: 'Archivo muy grande. Máximo 10MB' 
        });
      }

      // Generar nombre único
      const fileName = storageService.generateUniqueFileName(
        file.originalname,
        `doc_${userId}`
      );
      const filePath = `documents/${userId}/${fileName}`;

      // Subir a Supabase
      const { path, url } = await storageService.uploadFile(
        'documents',
        filePath,
        file.buffer,
        file.mimetype
      );

      // Guardar referencia en BD (opcional)
      // Puedes crear una tabla 'documentos' para rastrear los archivos

      res.json({
        success: true,
        message: 'Documento subido exitosamente',
        file: {
          path,
          nombre: file.originalname,
          tipo: tipo_documento,
          descripcion
        }
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ 
        error: 'Error al subir documento',
        details: error.message 
      });
    }
  }

  /**
   * Obtener URL firmada de documento privado
   */
  async getDocumentUrl(req, res) {
    try {
      const { filepath } = req.params;
      const { id: userId } = req.user;

      // Verificar que el usuario tenga acceso a este documento
      // (implementa tu lógica de autorización)

      const signedUrl = await storageService.getSignedUrl(
        'documents',
        filepath,
        3600 // 1 hora
      );

      res.json({
        success: true,
        url: signedUrl,
        expiresIn: 3600
      });
    } catch (error) {
      console.error('Error getting document URL:', error);
      res.status(500).json({ 
        error: 'Error al obtener URL del documento',
        details: error.message 
      });
    }
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(req, res) {
    try {
      const { bucket, filepath } = req.params;
      const { id: userId } = req.user;

      // Verificar permisos
      // (implementa tu lógica de autorización)

      await storageService.deleteFile(bucket, filepath);

      res.json({
        success: true,
        message: 'Archivo eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ 
        error: 'Error al eliminar archivo',
        details: error.message 
      });
    }
  }
}

module.exports = new UploadController();
```

### 2.6. Configurar Multer para Uploads

Crea `backend/src/middleware/upload.js`:

```javascript
const multer = require('multer');

// Usar memoria para almacenamiento temporal
const storage = multer.memoryStorage();

// Configuración de multer
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Lista de tipos MIME permitidos
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

module.exports = upload;
```

### 2.7. Crear Rutas de Upload

Crea `backend/src/routes/upload.js`:

```javascript
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Proteger todas las rutas con autenticación
router.use(authMiddleware.verifyToken);

// Subir avatar
router.post('/avatar', 
  upload.single('avatar'), 
  uploadController.uploadAvatar
);

// Subir documento
router.post('/document', 
  upload.single('document'), 
  uploadController.uploadDocument
);

// Obtener URL de documento privado
router.get('/document/:filepath(*)', 
  uploadController.getDocumentUrl
);

// Eliminar archivo
router.delete('/:bucket/:filepath(*)', 
  uploadController.deleteFile
);

module.exports = router;
```

### 2.8. Registrar Rutas en el Backend

Edita `backend/src/index.js`:

```javascript
// ... otros imports
const uploadRoutes = require('./routes/upload');

// ... configuraciones

// Registrar rutas
app.use('/api/upload', uploadRoutes);

// ... resto del código
```

---

## 🎨 Paso 3: Integrar en el Frontend

### 3.1. Instalar Cliente de Supabase

```bash
cd frontend
npm install @supabase/supabase-js
```

### 3.2. Configurar Variables de Entorno

Edita `frontend/.env`:

```env
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.3. Crear Cliente de Supabase

Crea `frontend/src/config/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3.4. Componente de Upload de Avatar

Crea `frontend/src/components/AvatarUpload.js`:

```javascript
import React, { useState } from 'react';
import { 
  Button, 
  Avatar, 
  Box, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import api from '../utils/api';

const AvatarUpload = ({ currentAvatar, userId, onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(currentAvatar);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validar tamaño
    if (file.size > 2 * 1024 * 1024) {
      setError('El archivo es muy grande. Máximo 2MB');
      return;
    }

    // Validar tipo
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Tipo de archivo no válido. Solo JPEG, PNG o WebP');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setPreview(response.data.url);
      if (onUploadSuccess) {
        onUploadSuccess(response.data.url);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir imagen');
      setPreview(currentAvatar);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Avatar
        src={preview}
        alt="Avatar"
        sx={{ width: 150, height: 150, margin: '0 auto 16px' }}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="avatar-upload"
        type="file"
        onChange={handleFileChange}
        disabled={loading}
      />
      
      <label htmlFor="avatar-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
          disabled={loading}
        >
          {loading ? 'Subiendo...' : 'Cambiar Avatar'}
        </Button>
      </label>
    </Box>
  );
};

export default AvatarUpload;
```

### 3.5. Componente de Upload de Documentos

Crea `frontend/src/components/DocumentUpload.js`:

```javascript
import React, { useState } from 'react';
import { 
  Button, 
  Box, 
  TextField,
  CircularProgress, 
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../utils/api';

const DocumentUpload = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [documents, setDocuments] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validaciones
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es muy grande. Máximo 10MB');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('tipo_documento', 'general');
      formData.append('descripcion', file.name);

      const response = await api.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Documento subido exitosamente');
      setDocuments([...documents, response.data.file]);
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data.file);
      }

      // Limpiar input
      event.target.value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <input
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        id="document-upload"
        type="file"
        onChange={handleFileUpload}
        disabled={loading}
      />
      
      <label htmlFor="document-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
          disabled={loading}
          fullWidth
        >
          {loading ? 'Subiendo...' : 'Subir Documento'}
        </Button>
      </label>

      {documents.length > 0 && (
        <List sx={{ mt: 2 }}>
          {documents.map((doc, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <FileIcon />
              </ListItemIcon>
              <ListItemText
                primary={doc.nombre}
                secondary={doc.tipo}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default DocumentUpload;
```

---

## 🔐 Paso 4: Configurar Políticas de Seguridad (RLS)

### 4.1. Políticas para Bucket `avatars` (Público)

En Supabase SQL Editor:

```sql
-- Política: Cualquiera puede leer avatars
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Política: Usuarios autenticados pueden subir avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Política: Usuarios pueden actualizar su propio avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Política: Usuarios pueden eliminar su propio avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);
```

### 4.2. Políticas para Bucket `documents` (Privado)

```sql
-- Política: Solo el propietario puede leer sus documentos
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Usuarios pueden subir a su propia carpeta
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Usuarios pueden actualizar sus documentos
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Usuarios pueden eliminar sus documentos
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 📝 Paso 5: Casos de Uso Comunes

### 5.1. Subir Foto de Perfil desde Frontend

```javascript
import api from '../utils/api';

const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('Avatar URL:', response.data.url);
    return response.data.url;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### 5.2. Obtener URL Firmada de Documento Privado

```javascript
const getDocumentUrl = async (filepath) => {
  try {
    const response = await api.get(`/upload/document/${filepath}`);
    return response.data.url;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### 5.3. Eliminar Archivo

```javascript
const deleteFile = async (bucket, filepath) => {
  try {
    await api.delete(`/upload/${bucket}/${filepath}`);
    console.log('Archivo eliminado');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

---

## ✅ Checklist de Integración

- [ ] Buckets creados en Supabase
- [ ] Cliente de Supabase instalado en backend
- [ ] Cliente de Supabase instalado en frontend
- [ ] Variables de entorno configuradas
- [ ] Storage service creado
- [ ] Upload controller creado
- [ ] Rutas de upload registradas
- [ ] Middleware de multer configurado
- [ ] Componentes de upload en frontend
- [ ] Políticas RLS configuradas
- [ ] Probado upload de avatars
- [ ] Probado upload de documentos
- [ ] Probado eliminación de archivos

---

## 🎉 ¡Listo!

Tu aplicación ahora está integrada con Supabase Storage. Puedes almacenar y gestionar archivos de forma serverless con todas las ventajas de Supabase.

**Próximos pasos:**
1. Prueba subir un avatar desde tu aplicación
2. Verifica que los archivos aparezcan en Supabase Storage
3. Implementa transformación de imágenes si lo necesitas
4. Configura límites de tamaño personalizados

---

**Documentación adicional:**
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage RLS](https://supabase.com/docs/guides/storage/security/access-control)

