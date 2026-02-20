// stok.js
// Stok modülü: sütunlar ve form alanları

(function() {
  'use strict';

  const columns = [
      { 
        title: 'ID', 
        field: 'id', 
        width: 80, 
        hozAlign: 'center', 
        headerFilter: 'number', 
        headerFilterPlaceholder: 'ID ara...', 
        editor: 'number', 
        editorParams: { min: 1 }, 
        visible: false
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
        title: 'Ürün Kodu', 
        field: 'urun_kodu', 
        width: 130, 
        headerFilter: 'input', 
        headerFilterPlaceholder: 'Ürün kodu ara...', 
        editor: 'input', 
        editable: false, 
        validator: ['required', 'string'] 
      },

      { 
        title: 'Ürün Adı', 
        field: 'urun_adi', 
        width: 350, 
        headerFilter: 'input', 
        headerFilterPlaceholder: 'Ürün adı ara...', 
        editor: 'input', 
        editable: false, 
        validator: ['required', 'string'] 
      },

      { 
        title: 'Kategori', 
        field: 'kategori', 
        width: 150, 
        headerFilter: 'input', 
        headerFilterPlaceholder: 'Kategori ara...', 
        editor: 'input', 
        editable: false 
      },

      { 
        title: 'Stok Miktarı', 
        field: 'stok_miktari', 
        width: 120, 
        hozAlign: 'center', 
        headerFilter: 'number', 
        headerFilterPlaceholder: 'Stok ara...', 
        editor: 'number', 
        editorParams: { min: 0 }, 
        formatter: function(cell) {
          const value = cell.getValue();
          if (value < 10) return `<span style="color:red; font-weight:bold">${value} (AZ)</span>`;
          if (value < 50) return `<span style="color:orange">${value}</span>`;
          return `<span style="color:green">${value}</span>`;}, 
          validator: ['required', 'integer'], 
          bottomCalc: 'sum' 
        },

      { 
        title: 'Birim Fiyat', 
        field: 'birim_fiyat', 
        width: 120, 
        hozAlign: 'right', 
        formatter: 'money', 
        formatterParams: { decimal: ',', thousand: '.', symbol: '₺', precision: 2 }, 
        headerFilter: 'number', 
        headerFilterPlaceholder: 'Fiyat ara...', 
        editor: false, 
        editorParams: { min: 0, step: 0.01 }, 
        validator: ['required', 'numeric'], 
        bottomCalc: 'avg', 
        bottomCalcFormatter: 'money', 
        bottomCalcFormatterParams: { decimal: ',', thousand: '.', symbol: '₺', precision: 2 } 
      },

      { 
        title: 'Tedarikçi', 
        field: 'tedarikci', 
        width: 150, 
        headerFilter: 'input', 
        headerFilterPlaceholder: 'Tedarikçi ara...', 
        editor: 'input', 
        editable: false 
      },

      { 
        title: 'Lokasyon', 
        field: 'lokasyon', 
        width: 120, 
        headerFilter: 'input', 
        headerFilterPlaceholder: 'Lokasyon ara...', 
        editor: 'input', 
        editable: false 
      },
     
  ];

  
  const formFields = [
      { name: 'urun_kodu',    label: 'Ürün Kodu',    type: 'text',   required: true, placeholder: 'PRD-001' },
      { name: 'urun_adi',     label: 'Ürün Adı',     type: 'text',   required: true },
      { name: 'kategori',     label: 'Kategori',     type: 'text',   required: true },
      { name: 'stok_miktari', label: 'Stok Miktarı', type: 'number', required: true, min: 0 },
      { name: 'birim_fiyat',  label: 'Birim Fiyat',  type: 'number', required: true, step: '0.01' },
      { name: 'tedarikci',    label: 'Tedarikçi',    type: 'text',   required: false },
      { name: 'lokasyon',     label: 'Lokasyon',     type: 'text',   required: false }
  ];

  if (!window.modules) window.modules = {};
  window.modules.stok = {
      title: 'Stok Listesi',
      icon: 'bi-box-seam',
      columns: columns,
      form: {
          title: 'Stok',
          fields: formFields
      }
  };
})();