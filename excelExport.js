// excelExport.js
// Manuel SheetJS ile Excel dışa aktarma

(function() {
  'use strict';

  const exportExcelBtn = document.getElementById('exportExcel');

  if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', function() {
          const table = window.getCurrentTable();
          const activeModule = window.getActiveModule();

          if (!table) {
              alert('Tablo henüz yüklenmedi.');
              return;
          }

          try {
              const rows = table.getData();
              if (!rows.length) {
                  alert('İndirilecek veri yok.');
                  return;
              }

              const module = activeModule || 'veri';
              const columns = table.getColumns(true)
                  .filter(col => col.isVisible())
                  .map(col => col.getDefinition().title || col.getField());

              const formattedRows = rows.map(row => {
                  const newRow = {};
                  table.getColumns(true).forEach(col => {
                      if (col.isVisible()) {
                          const field = col.getField();
                          let value = row[field];

                          // Tarih formatını düzenle (dd.MM.yyyy)
                          if (field === 'tarih' && value && window.luxon?.DateTime) {
                              try {
                                  const date = window.luxon.DateTime.fromISO(value);
                                  value = date.toFormat('dd.MM.yyyy');
                              } catch (e) {}
                          }

                          newRow[col.getDefinition().title || field] = value;
                      }
                  });
                  return newRow;
              });

              const wb = XLSX.utils.book_new();
              const ws = XLSX.utils.json_to_sheet(formattedRows, { header: columns });
              XLSX.utils.book_append_sheet(wb, ws, module.charAt(0).toUpperCase() + module.slice(1));
              const fileName = `${module}_${new Date().toISOString().slice(0,10)}.xlsx`;
              XLSX.writeFile(wb, fileName);

          } catch (e) {
              console.error('Excel oluşturma hatası:', e);
              alert('Excel dosyası oluşturulamadı: ' + e.message);
          }
      });
  }
})();