// excelImport.js
// Excel'den veri yükleme işlemleri

(function() {
  'use strict';

  const importExcelBtn = document.getElementById('importExcel');

  if (importExcelBtn) {
      importExcelBtn.addEventListener('click', function() {
          if (!window.activeModule) {
              alert('Lütfen önce bir modül seçin.');
              return;
          }

          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = '.xlsx, .xls';
          fileInput.style.display = 'none';
          document.body.appendChild(fileInput);

          fileInput.addEventListener('change', handleFileUpload);
          fileInput.click();

          function handleFileUpload(e) {
              const file = e.target.files[0];
              if (!file) {
                  document.body.removeChild(fileInput);
                  return;
              }
              readExcelFile(file);
              document.body.removeChild(fileInput);
          }
      });
  }

  async function readExcelFile(file) {
      const reader = new FileReader();
      reader.onload = function(e) {
          try {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];

              // Başlık satırı ilk satır
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              if (jsonData.length < 2) {
                  alert('Dosyada veri bulunamadı.');
                  return;
              }

              const headers = jsonData[0];
              const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

              const fieldMap = mapHeadersToFields(headers, window.activeModule);
              const records = transformRows(rows, fieldMap, window.activeModule);

              uploadToSupabase(records, window.activeModule);

          } catch (err) {
              console.error('Excel okuma hatası:', err);
              alert('Dosya okunamadı: ' + err.message);
          }
      };
      reader.readAsArrayBuffer(file);
  }

  function mapHeadersToFields(headers, moduleName) {
    const moduleDef = window.modules?.[moduleName];
    if (!moduleDef) {
        console.error('Modül tanımı bulunamadı:', moduleName);
        return {};
    }

    const fieldMap = {};
    headers.forEach((header, idx) => {
        if (!header) return;
        const cleanHeader = header.toString().trim().toLowerCase();
        
        const column = moduleDef.columns.find(col => 
            (col.title && col.title.toString().toLowerCase() === cleanHeader) ||
            (col.field && col.field.toString().toLowerCase() === cleanHeader)
        );
        
        if (column) {
            fieldMap[idx] = column.field;
        } else {
            console.warn(`Eşleşmeyen sütun: "${header}" (index ${idx})`);
        }
    });
    console.log('fieldMap:', fieldMap);
    return fieldMap;
}

function transformRows(rows, fieldMap, moduleName) {
    const records = [];
    rows.forEach((row, rowIndex) => {
        const record = {};
        let hasData = false;

        Object.entries(fieldMap).forEach(([indexStr, field]) => {
            if (!field) return;
            const index = parseInt(indexStr);
            let value = row[index];

            if (value === undefined || value === null || value === '') {
                return;
            }

            hasData = true;

            // DÖVİZ CİNSİ DÖNÜŞÜMÜ (SADECE hesap_plani modülü için)
            if (moduleName === 'hesap_plani' && 
                (field === 'dvz_cinsi' || field === 'Dvz.Cinsi' || field === 'Dvz. Cinsi')) {
                
                let strValue = String(value).trim();
                const upperValue = strValue.toUpperCase();
                
                const currencyMap = {
                    'TL': 'TL', 'TRY': 'TL',
                    'USD': 'Usd', 'USd': 'Usd',
                    'EUR': 'Eur', 'EURO': 'Eur',
                    'RBL': 'Rbl', 'RUBLE': 'Rbl',
                    'THB': 'Thb', 'BAHT': 'Thb'
                };
                
                value = currencyMap[upperValue] || strValue;
                
                if (!['TL', 'Usd', 'Eur', 'Rbl', 'Thb'].includes(value)) {
                    console.warn(`Satır ${rowIndex+2}, Geçersiz döviz cinsi: "${strValue}" -> null yapıldı`);
                    value = null;
                }
            }

            // TARİH DÖNÜŞÜMÜ (SADECE tarih alanı olan modüller için)
            if (field === 'tarih' && window.luxon?.DateTime) {
                try {
                    if (typeof value === 'number' && value > 30000) {
                        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                        const jsDate = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
                        const date = window.luxon.DateTime.fromJSDate(jsDate);
                        if (date.isValid) value = date.toISODate();
                    } else if (typeof value === 'string') {
                        let str = value.trim();
                        const parts = str.split(/[.\/]/);
                        if (parts.length === 3) {
                            const day = parts[0].padStart(2, '0');
                            const month = parts[1].padStart(2, '0');
                            let year = parts[2];
                            if (year.length === 2) year = '20' + year;
                            str = `${year}-${month}-${day}`;
                        }
                        const date = window.luxon.DateTime.fromISO(str);
                        if (date.isValid) value = date.toISODate();
                    }
                } catch (e) {
                    console.warn(`Satır ${rowIndex+2}, Tarih dönüştürülemedi:`, value);
                }
            }

            // SAYISAL ALANLAR - MODÜL BAZLI
            const numericFields = {
                'faturalar': ['tutar'],
                'stok': ['stok_miktari', 'birim_fiyat'],
                'cari': ['bakiye'],
                'hesap_plani': ['Borç', 'Alacak', 'Borç Bakiye', 'Alacak Bakiye', 
                               'Döviz Borç', 'Döviz Alacak', 'Döviz Borç Bakiye', 'Döviz Alacak Bakiye']
            };

            if (numericFields[moduleName]?.includes(field)) {
                if (typeof value === 'string') value = value.replace(',', '.');
                value = parseFloat(value);
                if (isNaN(value)) value = null;
            }

            record[field] = value;
        });

        if (hasData) {
            records.push(record);
        } else {
            console.warn(`Satır ${rowIndex+2} tamamen boş, atlandı.`);
        }
    });
    return records;
}

async function uploadToSupabase(records, moduleName) {
    if (records.length === 0) {
        alert('Yüklenecek veri bulunamadı.');
        return;
    }

    // undefined değerleri olan alanları temizle
    const cleanRecords = records.map(record => {
        const clean = {};
        Object.entries(record).forEach(([key, value]) => {
            if (key && value !== undefined) { // key varsa ve value undefined değilse
                clean[key] = value;
            }
        });
        return clean;
    });

    const originalText = importExcelBtn.innerHTML;
    importExcelBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Yükleniyor...';
    importExcelBtn.disabled = true;

    try {
        const result = await window.supabaseService.bulkInsert(moduleName, cleanRecords);
        if (result.success) {
            alert(`${cleanRecords.length} kayıt başarıyla eklendi!`);
            if (window.refreshCurrentTable) window.refreshCurrentTable();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Yükleme hatası:', error);
        alert(`Hata: ${error.message}`);
    } finally {
        importExcelBtn.innerHTML = originalText;
        importExcelBtn.disabled = false;
    }
}
})();
