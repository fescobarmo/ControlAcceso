const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Verificar que las variables de entorno estén configuradas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn('⚠️  ADVERTENCIA: Supabase Storage no está configurado');
  console.warn('   Configura SUPABASE_URL y SUPABASE_SERVICE_KEY en .env');
  console.warn('   El sistema funcionará sin storage hasta que lo configures.');
}

// Cliente con service role (para operaciones del backend)
const supabaseAdmin = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

// Cliente con anon key (para operaciones del cliente)
const supabaseClient = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )
  : null;

// Verificar conexión a Supabase
const testStorageConnection = async () => {
  if (!supabaseAdmin) {
    return false;
  }

  try {
    const { data, error } = await supabaseAdmin.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error conectando a Supabase Storage:', error.message);
      return false;
    }
    
    console.log('✅ Conexión a Supabase Storage establecida correctamente');
    console.log(`   Buckets disponibles: ${data.length}`);
    return true;
  } catch (error) {
    console.error('❌ Error verificando Supabase Storage:', error.message);
    return false;
  }
};

module.exports = {
  supabaseAdmin,
  supabaseClient,
  testStorageConnection,
  isStorageEnabled: !!supabaseAdmin
};

