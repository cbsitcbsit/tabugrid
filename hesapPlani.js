// hesapPlani.js
// Hesap Planı modülü - TL eklendi, varsayılan TL

(function() {
  'use strict';

  const columns = [
    {
      title: 'ID',
      field: 'id',
      width: 70,
      hozAlign: 'center',
      headerFilter: 'number',
      visible: false
    },
    {
      title: '#',
      field: 'rownum',
      formatter: 'rownum',
      width: 50,
      hozAlign: 'center',
      headerSort: false,
      frozen: true
    },
    {
      title: 'Hesap Kodu',
      field: 'Hesap Kodu',
      width: 150,
      headerFilter: 'input',
      headerFilterPlaceholder: 'Kod ara...',
      editor: 'input',
      editable: false,
      validator: ['required', 'string']
    },
    {
      title: 'Hesap Adı',
      field: 'Hesap Adı',
      width: 350,
      headerFilter: 'input',
      headerFilterPlaceholder: 'Ad ara...',
      editor: 'input',
      editable: false,
      validator: ['required', 'string']
    },
    {
      title: 'Hesap Türü',
      field: 'Hesap Türü',
      width: 130,
      hozAlign: 'center',
      headerFilter: 'list',
      headerFilterParams: { values: ['Ana Hesap', 'Alt Hesap'], clearable: true },
      editor: 'list',
      editorParams: { values: ['Ana Hesap', 'Alt Hesap'] },
      editable: false,
      formatter: function(cell) {
        const value = cell.getValue();
        return value === 'Ana Hesap' 
          ? '<span style="color:#2563eb; font-weight:500">● Ana Hesap</span>' 
          : '<span style="color:#6b7280">○ Alt Hesap</span>';
      }
    },
    {
      title: 'Dvz. Cinsi',
      field: 'Dvz.Cinsi',
      width: 110,
      hozAlign: 'center',
      headerFilter: 'list',
      headerFilterParams: { values: ['TL', 'Usd', 'Eur', 'Rbl', 'Thb'], clearable: true }, // TL EKLENDİ
      editor: 'list',
      editorParams: { values: ['TL', 'Usd', 'Eur', 'Rbl', 'Thb'] }, // TL EKLENDİ
      editable: false,
      formatter: function(cell) {
        const value = cell.getValue();
        const colors = { 
          'TL': '#2ecc71',      // TL yeşil
          'Usd': '#10b981', 
          'Eur': '#3b82f6', 
          'Rbl': '#ef4444', 
          'Thb': '#f59e0b' 
        };
        return `<span style="color:${colors[value] || '#333'}; font-weight:600">${value}</span>`;
      }
    },
    {
      title: 'Borç',
      field: 'Borç',
      width: 140,
      hozAlign: 'right',
      formatter: 'money',
      formatterParams: { decimal: ',', thousand: '.', symbol: '₺ ', precision: 2 },
      headerFilter: 'number',
      editor: 'number',
      editorParams: { step: 0.01 },
      editable: false,
      bottomCalc: 'sum'
    },
    {
      title: 'Alacak',
      field: 'Alacak',
      width: 140,
      hozAlign: 'right',
      formatter: 'money',
      formatterParams: { decimal: ',', thousand: '.', symbol: '₺ ', precision: 2 },
      headerFilter: 'number',
      editor: 'number',
      editorParams: { step: 0.01 },
      editable: false,
      bottomCalc: 'sum'
    },
    {
      title: 'Borç Bakiye',
      field: 'Borç Bakiye',
      width: 140,
      hozAlign: 'right',
      formatter: 'money',
      formatterParams: { decimal: ',', thousand: '.', symbol: '₺ ', precision: 2 },
      headerFilter: 'number',
      editor: 'number',
      editorParams: { step: 0.01 },
      editable: false,
      bottomCalc: 'sum'
    },
    {
      title: 'Alacak Bakiye',
      field: 'Alacak Bakiye',
      width: 140,
      hozAlign: 'right',
      formatter: 'money',
      formatterParams: { decimal: ',', thousand: '.', symbol: '₺ ', precision: 2 },
      headerFilter: 'number',
      editor: 'number',
      editorParams: { step: 0.01 },
      editable: false,
      bottomCalc: 'sum'
    },
    {
      title: 'Döviz Borç',
      field: 'Döviz Borç',
      width: 140,
      hozAlign: 'right',
      formatter: 'money',
      formatterParams: { decimal: ',', thousand: '.', precision: 2 },
      headerFilter: 'number',
      editor: 'number',
      editorParams: { step: 0.01 },
      editable: false,
      bottomCalc: 'sum'
    },
    {
      title: 'Döviz Alacak',
      field: 'Döviz Alacak',
      width: 140,
      hozAlign: 'right',
      formatter: 'money',
      formatterParams: { decimal: ',', thousand: '.', precision: 2 },
      headerFilter: 'number',
      editor: 'number',
      editorParams: { step: 0.01 },
      editable: false,
      bottomCalc: 'sum'
    },
    {
      title: 'Döviz Borç Bakiye',
      field: 'Döviz Borç Bakiye',
      width: 160,
      hozAlign: 'right',
      formatter: 'money',
      formatterParams: { decimal: ',', thousand: '.', precision: 2 },
      headerFilter: 'number',
      editor: 'number',
      editorParams: { step: 0.01 },
      editable: false,
      bottomCalc: 'sum'
    },
    {
      title: 'Döviz Alacak Bakiye',
      field: 'Döviz Alacak Bakiye',
      width: 160,
      hozAlign: 'right',
      formatter: 'money',
      formatterParams: { decimal: ',', thousand: '.', precision: 2 },
      headerFilter: 'number',
      editor: 'number',
      editorParams: { step: 0.01 },
      editable: false,
      bottomCalc: 'sum'
    }
  ];

  // FORM ALANLARI - SADECE 2 ALAN ZORUNLU, DÖVİZ CİNSİ VARSAYILAN TL
  const formFields = [
    { name: 'Hesap Kodu', label: 'Hesap Kodu', type: 'text', required: true, placeholder: '100 01 001' },
    { name: 'Hesap Adı', label: 'Hesap Adı', type: 'text', required: true },
    { name: 'Hesap Türü', label: 'Hesap Türü', type: 'select', required: false, 
      options: [
        { value: 'Ana Hesap', text: 'Ana Hesap' },
        { value: 'Alt Hesap', text: 'Alt Hesap' }
      ], 
      defaultValue: 'Ana Hesap' 
    },
    { name: 'Dvz.Cinsi', label: 'Döviz Cinsi', type: 'select', required: false, 
      options: [
        { value: 'TL', text: 'TL' },      // TL EKLENDİ
        { value: 'Usd', text: 'USD' },
        { value: 'Eur', text: 'EUR' },
        { value: 'Rbl', text: 'RBL' },
        { value: 'Thb', text: 'THB' }
      ], 
      defaultValue: 'TL'                   // VARSAYILAN TL
    },
    { name: 'Borç', label: 'Borç', type: 'number', step: '0.01', required: false },
    { name: 'Alacak', label: 'Alacak', type: 'number', step: '0.01', required: false },
    { name: 'Borç Bakiye', label: 'Borç Bakiye', type: 'number', step: '0.01', required: false },
    { name: 'Alacak Bakiye', label: 'Alacak Bakiye', type: 'number', step: '0.01', required: false },
    { name: 'Döviz Borç', label: 'Döviz Borç', type: 'number', step: '0.01', required: false },
    { name: 'Döviz Alacak', label: 'Döviz Alacak', type: 'number', step: '0.01', required: false },
    { name: 'Döviz Borç Bakiye', label: 'Döviz Borç Bakiye', type: 'number', step: '0.01', required: false },
    { name: 'Döviz Alacak Bakiye', label: 'Döviz Alacak Bakiye', type: 'number', step: '0.01', required: false }
  ];

  if (!window.modules) window.modules = {};
  window.modules['hesap_plani'] = {
    title: 'Hesap Planı',
    icon: 'bi-layout-three-columns',
    columns: columns,
    form: {
      title: 'Hesap',
      fields: formFields
    }
  };
})();
