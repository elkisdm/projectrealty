#!/usr/bin/env node

/**
 * Script para crear usuario administrador en Supabase
 * 
 * Uso:
 *   node scripts/create-admin-user.mjs <email> <password> [role]
 * 
 * Ejemplo:
 *   node scripts/create-admin-user.mjs admin@example.com password123 admin
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno requeridas:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nAsegúrate de tener un archivo .env.local con estas variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function createAdminUser(email, password, role = 'admin') {
  try {
    // Validar email
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }

    // Validar password
    if (!password || password.length < 8) {
      throw new Error('Password debe tener al menos 8 caracteres');
    }

    // Validar role
    const validRoles = ['admin', 'editor', 'viewer'];
    if (!validRoles.includes(role)) {
      throw new Error(`Role debe ser uno de: ${validRoles.join(', ')}`);
    }

    console.log(`\n🔐 Creando usuario administrador...`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${role}`);

    // Verificar si el usuario ya existe en auth.users
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.warn('⚠️  No se pudo verificar usuarios existentes:', listError.message);
    } else {
      const existingUser = existingUsers.users.find((u) => u.email === email);
      if (existingUser) {
        console.log(`\n✅ Usuario ya existe en auth.users (ID: ${existingUser.id})`);
        
        // Verificar si ya está en admin_users
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', existingUser.id)
          .single();

        if (adminUser) {
          console.log('✅ Usuario ya existe en admin_users');
          console.log(`\n📋 Usuario admin creado exitosamente:`);
          console.log(`   ID: ${adminUser.id}`);
          console.log(`   Email: ${adminUser.email}`);
          console.log(`   Role: ${adminUser.role}`);
          return;
        }

        // Insertar en admin_users
        const { data: newAdminUser, error: insertError } = await supabase
          .from('admin_users')
          .insert({
            id: existingUser.id,
            email: existingUser.email,
            role: role,
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(`Error insertando en admin_users: ${insertError.message}`);
        }

        console.log(`\n✅ Usuario agregado a admin_users`);
        console.log(`\n📋 Usuario admin creado exitosamente:`);
        console.log(`   ID: ${newAdminUser.id}`);
        console.log(`   Email: ${newAdminUser.email}`);
        console.log(`   Role: ${newAdminUser.role}`);
        return;
      }
    }

    // Crear usuario en auth.users usando Admin API
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Confirmar email automáticamente
    });

    if (createError) {
      throw new Error(`Error creando usuario en auth.users: ${createError.message}`);
    }

    if (!authUser.user) {
      throw new Error('No se pudo crear el usuario');
    }

    console.log(`✅ Usuario creado en auth.users (ID: ${authUser.user.id})`);

    // Insertar en admin_users
    const { data: adminUser, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        id: authUser.user.id,
        email: email,
        role: role,
      })
      .select()
      .single();

    if (insertError) {
      // Si falla la inserción, intentar eliminar el usuario de auth.users
      console.error('❌ Error insertando en admin_users:', insertError.message);
      console.log('🔄 Limpiando usuario creado en auth.users...');
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Error insertando en admin_users: ${insertError.message}`);
    }

    console.log(`✅ Usuario insertado en admin_users`);

    console.log(`\n📋 Usuario admin creado exitosamente:`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`\n✨ Puedes iniciar sesión con estas credenciales en /admin/login`);
  } catch (error) {
    console.error('\n❌ Error creando usuario admin:', error.message);
    process.exit(1);
  }
}

// Leer argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Uso incorrecto');
  console.error('\nUso:');
  console.error('   node scripts/create-admin-user.mjs <email> <password> [role]');
  console.error('\nEjemplo:');
  console.error('   node scripts/create-admin-user.mjs admin@example.com password123 admin');
  console.error('\nRoles disponibles: admin, editor, viewer');
  process.exit(1);
}

const [email, password, role = 'admin'] = args;

createAdminUser(email, password, role)
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });












