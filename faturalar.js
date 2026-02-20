// faturalar.js
// Fatura modülü: sütunlar ve form alanları

(function() {
  'use strict';
  // --- Sütun tanımları (Tabulator için) ---
  const columns = [
      { 
        title: 'ID', 
        field: 'id', 
        width: 70, 
        hozAlign: 'center', 
        headerFilter: 'input', 
        headerFilterPlaceholder: 'ID ara...', 
        editor: 'number', 
        visible: false,
        editorParams: { min: 1 } },

      { 
        title: '#', 
        field: 'rownum', 
        formatter: 'rownum', 
        width: 50, 
        hozAlign: 'center',
        headerSort: true,  // sıralama yapılamasın
        frozen: true        // isteğe bağlı: kaydırma sırasında sabit kalsın
      },

      { 
        title: 'Fatura Tipi', 
        field: 'durum', 
        width: 150, 
        hozAlign: 'center', 
        headerFilter: 'list', 
        headerFilterParams: { values: ['Alış Faturası', 'Satış Faturası', 'Alıştan İade', 'Satıştan İade'], 
        clearable: true }, 
        editor: 'list', 
        editorParams: { values: ['Alış Faturası', 'Satış Faturası', 'Alıştan İade', 'Satıştan İade'] }, formatter: function(cell) {
          const value = cell.getValue();
          const colors = { 'Alış Faturası': '#4ecdc4', 'Satış Faturası': '#36b9cc', 'Alıştan İade': '#ff6b6b', 'Satıştan İade': '#ffd166' };
          return `<span style="color:${colors[value] || 'black'}; font-weight:bold">${value}</span>`;} 
        },

      { 
        title: 'Fatura No', 
        field: 'fatura_no', 
        width: 150, 
        headerFilter: 'input', 
        headerFilterPlaceholder: 'Fatura no ara...', 
        editor: 'input', 
        editable: true, 
        validator: ['required', 'string'] 
      },

      { 
        title: 'Müşteri Adı', 
        field: 'musteri_adi', 
        width: 270, 
        headerFilter: 'input', 
        headerFilterPlaceholder: 'Müşteri ara...', 
        editor: 'input', 
        editable: true, 
        validator: ['required', 'string'] 
      },

      {
        title: 'Tarih',
        field: 'tarih',
        width: 120,
        hozAlign: 'center',
        headerFilter: 'input',
        headerFilterFunc: 'like',
        editor: 'date',
        editorParams: { format: 'yyyy-MM-dd', 
        elementAttributes: { type: 'date' } },
          formatter: function(cell) {
              const value = cell.getValue();
              if (value && window.luxon?.DateTime) {
                  try {
                      const date = window.luxon.DateTime.fromISO(value);
                      return date.toFormat('dd.MM.yyyy');
                  } catch (e) { return value; }
              }
              return value || '';
          }
      },

      { 
        title: 'Tutar', 
        field: 'tutar', 
        width: 150, 
        hozAlign: 'right', 
        formatter: 'money', 
        formatterParams: { decimal: ',', thousand: '.', symbol: '₺', precision: 2 }, 
        headerFilter: 'number', 
        headerFilterPlaceholder: 'Tutar ara...', 
        editor: 'number', 
        editorParams: { min: 0, step: 0.01 }, 
        validator: ['required', 'numeric'], 
        bottomCalc: 'sum', 
        bottomCalcFormatter: 'money', 
        bottomCalcFormatterParams: { decimal: ',', thousand: '.', symbol: '₺', precision: 2 } 
      },

      { 
        title: 'Açıklama', 
        field: 'aciklama', 
        width: 480, 
        headerFilter: 'input', 
        headerFilterPlaceholder: 'Açıklama ara...', 
        editor: 'textarea', 
        editorParams: { rows: 3 }, 
        formatter: 'textarea', 
        editable: true },
      
      
  ];

  // --- Form alanları (CRUD modalı için) ---
  const formFields = [

      { name: 'fatura_no', label: 'Fatura No', type: 'text', required: true, placeholder: 'FTR-2024-001' },
      { name: 'musteri_adi', label: 'Müşteri Adı', type: 'text', required: true, placeholder: 'Müşteri adı' },
      { name: 'tarih', label: 'Tarih', type: 'date', required: true },
      { name: 'tutar', label: 'Tutar', type: 'number', step: '0.01', required: true, placeholder: '0.00' },    
      { name: 'durum', label: 'Fatura Tipi', type: 'select', required: true, 
      options: [
          { value: 'Alış Faturası', text: 'Alış Faturası' },
          { value: 'Satış Faturası', text: 'Satış Faturası' },
          { value: 'Alıştan İade', text: 'Alıştan İade' },
          { value: 'Satıştan İade', text: 'Satıştan İade' }], 
          defaultValue: 'Satış Faturası' },
         { name: 'aciklama', label: 'Açıklama', type: 'textarea', required: false, placeholder: 'Açıklama girin...', rows: 3 },

      { name: 'Kod01', label: 'Kod01', type: 'input', required: false, placeholder: 'Kod01 girin...'} 
      
  ];

  // --- Global nesneye ekle ---
  if (!window.modules) window.modules = {};
                window.modules.faturalar = {
          title: 'Fatura Listesi',
          icon: 'bi-receipt',
          columns: columns,
          form: {
          title: 'Fatura',
          fields: formFields
      }
  };
})();