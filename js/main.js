function createDatabase(){
    //apakah browser support dengan IDB
    if (!('indexedDB' in window)){
        console.log('Web browser tidak mendukung IDB');
        return;
    }
    var request = window.indexedDB.open('db-a1');

    request.onerror =  tanganiError;
    request.onupgradeneeded = (e) => {
        var db = e.target.result;
        db.onerror = tanganiError;
        var objStore = db.createObjectStore('mahasiswa', {keyPath : 'nim'});
        console.log('Object mahasiswa berhasil dibuat');
    }
    request.onsuccess = (e) => {
        db = e.target.result;
        db.onerror = tanganiError;
        console.log('Berhasil melakukan koneksi ke IDB');

        bacaDariDB();
    }
}

function tanganiError(e){
    console.log('Error IDB ' + e.target.errorCode);
}

createDatabase();

var tabel = document.getElementById('tabel-mahasiswa'), 
    form = document.getElementById('form-tambah'),
    nama = document.getElementById('nama'),
    nim = document.getElementById('nim'),
    gender = document.getElementById('gender');

form.addEventListener('submit', tambahBaris);

function tambahBaris(e){
    if(tabel.rows.namedItem(nim.value)){
        alert("Error : NIM sudah terdaftar");
        e.preventDefault();
        return;
    }

    insertKeDB({
        nim : nim.value,
        nama : nama.value,
        gender : gender.value,
    });

    var baris = tabel.insertRow();
    baris.id = nim.value;
    baris.insertCell().appendChild(document.createTextNode(nim.value));
    baris.insertCell().appendChild(document.createTextNode(nama.value));
    baris.insertCell().appendChild(document.createTextNode(gender.value));

    var btn = document.createElement('input');
    btn.type = 'button';
    btn.value = 'Hapus';
    btn.id = nim.value;
    btn.className = 'btn btn-danger btn-nm';
    baris.insertCell().appendChild(btn);
    e.preventDefault();

}

function insertKeDB(mahasiswa){
    var objStore = buatTransaksi().objectStore('mahasiswa');
    var request = objStore.add(mahasiswa);
    request.onerror = tanganiError;
    request.onsuccess = console.log("Mahasiswa nim " + mahasiswa.nim + "berhasil ditambahkan ke DB");

}

function buatTransaksi(){
    var transaksi = db.transaction(['mahasiswa'],'readwrite');
    transaksi.onerror = tanganiError;
    transaksi.oncomplete = console.log("Transaksi selesai");

    return transaksi;
}

bacaDariDB = () => {
    var objStore = buatTransaksi().objectStore('mahasiswa');
    objStore.openCursor().onsuccess = (e) => {
        var result = e.target.result;
        if (result){
            console.log('Membaca ['+result.value.nim+'] dari IDB');

            var baris = tabel.insertRow();
            baris.id = result.value.nim;
            baris.insertCell().appendChild(document.createTextNode(result.value.nama));
            baris.insertCell().appendChild(document.createTextNode(result.value.nim));
            baris.insertCell().appendChild(document.createTextNode(result.value.gender));
        
            var btn = document.createElement('input');
            btn.type = 'button';
            btn.value = 'Hapus';
            btn.id = result.value.nim;
            btn.className = 'btn btn-danger btn-nm';
            baris.insertCell().appendChild(btn);
            result.continue();
        }
    }
}

tabel.addEventListener('click',hapusBaris);
function hapusBaris(e){
    if (e.target.type === 'button'){
        var hapus = confirm('Apakah anda yakin untuk menghapus data ?');
        if(hapus){
            tabel.deleteRow(tabel.rows.namedItem(e.target.id).sectionRowIndex);
            var objStore = buatTransaksi().objectStore('mahasiswa');
            var request = objStore.delete(e.target.id);
            request.onerror = tanganiError;
            request.onsuccess = console.log("Mahasiswa nim " + mahasiswa.nim + "berhasil ditambahkan ke DB");
        }
    }
}
