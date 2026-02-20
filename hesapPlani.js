// hesapPlani.js
// Hesap Planı modülü: sütunlar ve form alanları

(function() {
  'use strict';

  const columns = [
    // Sıra numarası sütunu (isteğe bağlı, diğer modüllerde varsa ekleyin)
    { title: '#', formatter: 'rownum', width: 50, hozAlign: 'center', headerSort: false, frozen: true },

    // Hesap Kodu (Örnek: 100 01 001)
    { title: 'Hesap Kodu', field: 'hesap_kodu', width: 150, headerFilter: 'input', editor: 'input', validator: ['required', 'string'] },

    // Hesap Adı
    { title: 'Hesap Adı', field: 'hesap_adi', width: 250, headerFilter: 'input', editor: 'input', validator: ['required', 'string'] },

    // Hesap Türü (Ana Hesap veya Alt Hesap)
    { title: 'Hesap Türü', field: 'hesap_turu', width: 120, hozAlign: 'center', headerFilter: 'list', headerFilterParams: { values: ['Ana Hesap', 'Alt Hesap'], clearable: true }, editor: 'list', editorParams: { values: ['Ana Hesap', 'Alt Hesap'] } },

    // Döviz Cinsi
    { title: 'Dvz. Cinsi', field: 'dvz_cinsi', width: 100, hozAlign: 'center', headerFilter: 'list', headerFilterParams: { values: ['Usd', 'Eur', 'Rbl', 'Thb'], clearable: true }, editor: 'list', editorParams: { values: ['Usd', 'Eur', 'Rbl', 'Thb'] } },

    // Borç (sayısal, para birimi formatında)
    { title: 'Borç', field: 'borc', width: 150, hozAlign: 'right', formatter: 'money', formatterParams: { decimal: ',', thousand: '.', symbol: '₺', precision: 2 }, headerFilter: 'number', editor: 'number', editorParams: { min: 0, step: 0.01 }, bottomCalc: 'sum', bottomCalcFormatter: 'money' },

    // Alacak
    { title: 'Alacak', field: 'alacak', width: 150, hozAlign: 'right', formatter: 'money', formatterParams: { decimal: ',', thousand: '.', symbol: '₺', precision: 2 }, headerFilter: 'number', editor: 'number', editorParams: { min: 0, step: 0.01 }, bottomCalc: 'sum', bottomCalcFormatter: 'money' },

    // Borç Bakiye
    { title: 'Borç Bakiye', field: 'borc_bakiye', width: 150, hozAlign: 'right', formatter: 'money', formatterParams: { decimal: ',', thousand: '.', symbol: '₺', precision: 2 }, headerFilter: 'number', editor: 'number', editorParams: { min: 0, step: 0.01 }, bottomCalc: 'sum', bottomCalcFormatter: 'money' },

    // Alacak Bakiye
    { title: 'Alacak Bakiye', field: 'alacak_bakiye', width: 150, hozAlign: 'right', formatter: 'money', formatterParams: { decimal: ',', thousand: '.', symbol: '₺', precision: 2 }, headerFilter: 'number', editor: 'number', editorParams: { min: 0, step: 0.01 }, bottomCalc: 'sum', bottomCalcFormatter: 'money' },

    // Döviz Borç
    { title: 'Döviz Borç', field: 'dvz_borc', width: 150, hozAlign: 'right', formatter: 'money', formatterParams: { decimal: ',', thousand: '.', symbol: '', precision: 2 }, headerFilter: 'number', editor: 'number', editorParams: { min: 0, step: 0.01 }, bottomCalc: 'sum' },

    // Döviz Alacak
    { title: 'Döviz Alacak', field: 'dvz_alacak', width: 150, hozAlign: 'right', formatter: 'money', formatterParams: { decimal: ',', thousand: '.', symbol: '', precision: 2 }, headerFilter: 'number', editor: 'number', editorParams: { min: 0, step: 0.01 }, bottomCalc: 'sum' },

    // Döviz Borç Bakiye
    { title: 'Döviz Borç Bakiye', field: 'dvz_borc_bakiye', width: 180, hozAlign: 'right', formatter: 'money', formatterParams: { decimal: ',', thousand: '.', symbol: '', precision: 2 }, headerFilter: 'number', editor: 'number', editorParams: { min: 0, step: 0.01 }, bottomCalc: 'sum' },

    // Döviz Alacak Bakiye
    { title: 'Döviz Alacak Bakiye', field: 'dvz_alacak_bakiye', width: 180, hozAlign: 'right', formatter: 'money', formatterParams: { decimal: ',', thousand: '.', symbol: '', precision: 2 }, headerFilter: 'number', editor: 'number', editorParams: { min: 0, step: 0.01 }, bottomCalc: 'sum' },
  ];

  const formFields = [
    { name: 'hesap_kodu', label: 'Hesap Kodu', type: 'text', required: true, placeholder: 'Örn: 100 01 001' },
    { name: 'hesap_adi', label: 'Hesap Adı', type: 'text', required: true },
    { name: 'hesap_turu', label: 'Hesap Türü', type: 'select', required: true, options: [
        { value: 'Ana Hesap', text: 'Ana Hesap' },
        { value: 'Alt Hesap', text: 'Alt Hesap' }
    ], defaultValue: 'Ana Hesap' },
    { name: 'dvz_cinsi', label: 'Döviz Cinsi', type: 'select', required: true, options: [
        { value: 'Usd', text: 'USD' },
        { value: 'Eur', text: 'EUR' },
        { value: 'Rbl', text: 'RBL' },
        { value: 'Thb', text: 'THB' }
    ], defaultValue: 'Usd' },
    { name: 'borc', label: 'Borç', type: 'number', step: '0.01', required: false },
    { name: 'alacak', label: 'Alacak', type: 'number', step: '0.01', required: false },
    { name: 'borc_bakiye', label: 'Borç Bakiye', type: 'number', step: '0.01', required: false },
    { name: 'alacak_bakiye', label: 'Alacak Bakiye', type: 'number', step: '0.01', required: false },
    { name: 'dvz_borc', label: 'Döviz Borç', type: 'number', step: '0.01', required: false },
    { name: 'dvz_alacak', label: 'Döviz Alacak', type: 'number', step: '0.01', required: false },
    { name: 'dvz_borc_bakiye', label: 'Döviz Borç Bakiye', type: 'number', step: '0.01', required: false },
    { name: 'dvz_alacak_bakiye', label: 'Döviz Alacak Bakiye', type: 'number', step: '0.01', required: false }
  ];

  if (!window.modules) window.modules = {};
  window.modules.hesapPlani = {
    title: 'Hesap Planı',
    icon: 'bi-journal-bookmark-fill', // Uygun bir Bootstrap ikonu seçtik
    columns: columns,
    form: {
      title: 'Hesap',
      fields: formFields
    }
  };
})();