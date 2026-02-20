// supabaseClient.js
// Supabase bağlantısı ve ortak veritabanı işlemleri (merkezi servis)

(function() {
  'use strict';

  const SUPABASE_URL = 'https://ahvyflzzwdtdxkhqpqbv.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodnlmbHp6d2R0ZHhraHFwcWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjMzMDcsImV4cCI6MjA4NDU5OTMwN30.EorGS-xr9Pn6FYiw93g8yZHlzBf7kfFw7b6RNhb6bJU';

  // Supabase client'ı oluştur (tekil)
  if (!window.supabaseClient) {
      window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  const supabase = window.supabaseClient;

  // Bağlantı kontrolü
  async function checkConnection() {
      try {
          const { data, error } = await supabase.from('faturalar').select('*').limit(1);
          if (error) {
              console.error('Supabase bağlantı hatası:', error);
              return { success: false, error: error.message };
          }
          return { success: true };
      } catch (err) {
          console.error('Bağlantı kontrol hatası:', err);
          return { success: false, error: 'Network error' };
      }
  }

  // Veri çekme (tüm modüller için)
  async function fetchData(moduleName) {
      try {
          const { data, error } = await supabase
              .from(moduleName)
              .select('*')
              .order('id', { ascending: true })
              .limit(10000);
          if (error) throw error;
          return { success: true, data: data || [] };
      } catch (error) {
          console.error(`fetchData hatası (${moduleName}):`, error);
          return { success: false, error: error.message };
      }
  }

  // Tek satır silme
  async function deleteRow(moduleName, id) {
      try {
          const { error } = await supabase
              .from(moduleName)
              .delete()
              .eq('id', id);
          if (error) throw error;
          return { success: true };
      } catch (error) {
          console.error('Silme hatası:', error);
          return { success: false, error: error.message };
      }
  }

  // Hücre güncelleme
  async function updateCell(moduleName, id, field, value) {
      try {
          const { error } = await supabase
              .from(moduleName)
              .update({ [field]: value })
              .eq('id', id);
          if (error) throw error;
          return { success: true };
      } catch (error) {
          console.error('Güncelleme hatası:', error);
          return { success: false, error: error.message };
      }
  }

  // Yeni satır ekleme (tek kayıt)
  async function insertRow(moduleName, rowData) {
      try {
          const { data, error } = await supabase
              .from(moduleName)
              .insert([rowData])
              .select();
          if (error) throw error;
          return { success: true, data: data };
      } catch (error) {
          console.error('Ekleme hatası:', error);
          return { success: false, error: error.message };
      }
  }

  // Toplu ekleme (import için)
  async function bulkInsert(moduleName, records) {
    if (!records.length) return { success: true, data: [] };
    try {
        const { data, error } = await supabase
            .from(moduleName)
            .insert(records)
            .select();
        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Toplu ekleme hatası:', error);
        return { success: false, error: error.message };
    }
}

async function deleteRows(moduleName, ids) {
    if (!ids.length) return { success: true };
    try {
        const { error } = await supabase
            .from(moduleName)
            .delete()
            .in('id', ids);  // ids dizisindeki tüm ID'leri sil
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Toplu silme hatası:', error);
        return { success: false, error: error.message };
    }
}

  // Servisi global olarak kullanıma aç
  window.supabaseService = {
      supabase,                // gerektiğinde doğrudan erişim için (nadir)
      checkConnection,
      fetchData,
      deleteRow,
      deleteRows,
      updateCell,
      insertRow,
      bulkInsert
  };
})();