// cari.js
// Cari modülü: sütunlar ve form alanları

(function() {
  'use strict';

  const columns = [
      { 
          title: 'ID', 
          field: 'id', 
          width: 80, 
          hozAlign: 'center', 
          headerFilter: 'number', 
          visible: false, 
          headerFilterPlaceholder: 'ID ara...', 
          editor: 'number', 
          editorParams: { min: 1 } 
        },

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
          title: 'Cari Kodu', 
          field: 'cari_kodu', 
          width: 120, 
          headerFilter: 'input', 
          headerFilterPlaceholder: 'Cari kodu ara...', 
          editor: 'input', 
          editable: false, 
          validator: ['required', 'string'] 
        },

      { 
          title: 'Ünvan', 
          field: 'unvan', 
          width: 350, 
          headerFilter: 'input', 
          headerFilterPlaceholder: 'Ünvan ara...', 
          editor: 'input', 
          editable: false, 
          validator: ['required', 'string'] 
        },

      { 
          title: 'Yetkili', 
          field: 'yetkili_kisi', 
          width: 150, 
          headerFilter: 'input', 
          headerFilterPlaceholder: 'Yetkili ara...', 
          editor: 'input', 
          editable: false
        },

      { 
          title: 'Telefon', 
          field: 'telefon', 
          width: 140, 
          headerFilter: 'input', 
          headerFilterPlaceholder: 'Telefon ara...', 
          editor: 'input', 
          editable: false, 
          validator: ['regex:/^[0-9+\\s-]*$/', 'maxLength:20'] 
        },

      { 
          title: 'E-posta', 
          field: 'email', 
          width: 180, 
          headerFilter: 'input', 
          headerFilterPlaceholder: 'E-posta ara...', 
          editor: 'input', 
          editable: false, 
          validator: ['email'] 
        },

      { 
          title: 'Bakiye', 
          field: 'bakiye', 
          width: 130, 
          hozAlign: 'right', 
          formatter: 'money', 
          formatterParams: { decimal: ',', thousand: '.', symbol: '₺', precision: 2 }, 
          headerFilter: 'number', 
          headerFilterPlaceholder: 'Bakiye ara...', 
          editor: false, 
          editorParams: { step: 0.01 }, 
          validator: ['numeric'], 
          bottomCalc: 'sum', 
          bottomCalcFormatter: 'money', 
          bottomCalcFormatterParams: { decimal: ',', thousand: '.', symbol: '₺', precision: 2 } 
        },

      { 
          title: 'Durum', 
          field: 'durum', 
          width: 120, 
          hozAlign: 'center', 
          headerFilter: 'list', 
          headerFilterParams: { values: ['Aktif', 'Pasif'], 
          clearable: true }, 
          editor: false, 
          editorParams: { values: ['Aktif', 'Pasif'] }, 
          formatter: function(cell) {
          const value = cell.getValue();
          return value === 'Aktif' ? '<span style="color:green; font-weight:bold">● Aktif</span>' : '<span style="color:red">● Pasif</span>'; } 
        },
     
  ];

  const formFields = [
      { name: 'cari_kodu', label: 'Cari Kodu', type: 'text', required: true, placeholder: 'CR-001' },
      { name: 'unvan', label: 'Ünvan', type: 'text', required: true },
      { name: 'yetkili_kisi', label: 'Yetkili Kişi', type: 'text', required: true },
      { name: 'telefon', label: 'Telefon', type: 'tel', required: false },
      { name: 'email', label: 'E-posta', type: 'email', required: false },
      { name: 'bakiye', label: 'Bakiye', type: 'number', step: '0.01', required: false },
      { name: 'durum', label: 'Durum', type: 'select', required: true, options: [
          { value: 'Aktif', text: 'Aktif' },
          { value: 'Pasif', text: 'Pasif' }
      ], defaultValue: 'Aktif' }
  ];

  if (!window.modules) window.modules = {};
  window.modules.cari = {
      title: 'Cari Hesaplar',
      icon: 'bi-people',
      columns: columns,
      form: {
          title: 'Cari',
          fields: formFields
      }
  };
})();