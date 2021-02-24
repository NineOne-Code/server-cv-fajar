const fs = require('fs-extra');
const path = require('path');
const lowDb = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")
const bodyParser = require("body-parser")
const { nanoid } = require("nanoid")

const db = lowDb(new FileSync('db_pertanian.json'));
// axios.get('http://localhost:3004/admin').then(res => console.log(res)).catch(error => console.log(error))

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'db_pertanian'
//   });
//   connection.connect((err) => {
//     if (err) throw err;
//     console.log('Connected!');
//   });

module.exports = {
    viewSignin: async (req, res) => {
        
        try {
            const admin = () => {return db.get('/admin').value()}
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            if (req.session.user == null || req.session.user == undefined) {
                res.render('index', {
                    alert,
                    title: "CV FAJAR | Login"
                });
            } else {
                res.redirect('/admin/dashboard');
            }
        } catch (error) {
            res.redirect('/admin/signin');
        }
    },
    actionSignin: async (req, res) => {
        try {
            const { username, password } = req.body;
            const admin = db.get('admin').find({
                username: username
            }).value()
            let checkUser, checkPass;
            checkUser = admin.username;
            checkPass = admin.password;
            if(checkUser === username) {
                if(checkPass == password) {
                    req.session.user = {
                        id: admin.id,
                        nama: admin.nama
                    }
                    req.flash('alertMessage', 'Login Success');
                    req.flash('alertStatus', 'success');
                    res.redirect('/admin/dashboard'); 
                } else {
                    req.flash('alertMessage', `Password yang anda masukan salah`);
                    req.flash('alertStatus', 'danger');
                    res.redirect('/admin/signin');
                }
            } else {
                req.flash('alertMessage', `Username anda tidak terdaftar`);
                req.flash('alertStatus', 'danger');
                res.redirect('/admin/signin');
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/signin');
        }
    },
    actionLogout: (req, res) => {
        req.session.destroy();
        res.redirect('/admin/signin');
    },
    viewDashboard: async (req, res) => {
        try {
            let petani = db.get('customer').value()
            let barang = db.get('barang').value()
            let penjualan = db.get('penjualan').value()
            console.log('results')
            // console.log(tablePetani)
            res.render('admin/dashboard/view_dashboard', {
                penjualan, petani, barang, user: req.session.user,
                title: "CV FAJAR | Dashboard"
            });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    },
    viewBarang: async (req, res) => {
        try {
            let barang = db.get('barang').value();
            const kategori = db.get('kategori').value();
            for (let i = 0; i < barang.length; i++) {
                for (let j = 0; j < kategori.length; j++) {
                    if (barang[i].kategoriId === kategori[j].id) {
                        barang[i].kategoriId = kategori[j].nama;
                    }
                }
            }
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/barang/view_barang', {
                barang, kategori, user: req.session.user,
                alert,
                title: "CV FAJAR | Barang"
            });
        } catch (error) {
            res.redirect('/admin/barang');
        }
    },
    addBarang: async (req, res) => {
        try {
            const { nama, kategoriId, harga_jual, stok } = req.body;
            const image = `images/${req.file.filename}`;
            const tgl_buat = tgl_ubah = new Date().toLocaleString()
            const data = { nama, kategoriId, harga_jual, stok, image, tgl_buat, tgl_ubah }
            db.get('barang').push({
                ...data, id: nanoid()
            }).write();
            req.flash('alertMessage', 'Success Add Barang!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/barang');  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/barang');
        }
    },
    editBarang: async (req, res) => {
        try {
            const { id, nama, kategoriId, harga_jual, stok } = req.body;
            const barang = db.get('barang').find({
                id: id
            }).value();
            const tgl_ubah = new Date().toLocaleString()
            let data = { id, nama, kategoriId, harga_jual, stok, tgl_ubah }
            if (req.file == undefined) {
                db.get("barang").find({
                    id: id
                }).assign(data).value()
                db.write()
                req.flash('alertMessage', 'Success Update Barang!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/barang');
            } else {
                const image = `images/${req.file.filename}`
                data = { ...data, image }
                await fs.unlink(path.join(`public/${barang.image}`)); 
                db.get("barang").find({
                    id: id
                }).assign(data).value()
                db.write()
                req.flash('alertMessage', 'Success Update Barang!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/barang');
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/barang');
        }
    },
    deletebarang: async (req, res) => {
        try {
            const { id } = req.params;
            const barang = db.get('barang').find({
                id: id
            }).value();
            await fs.unlink(path.join(`public/${barang.image}`)); 
            db.get("barang").remove({
                id: id
            }).write() 
            req.flash('alertMessage', 'Success Delete Barang!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/barang');   
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/barang');
        }
    },
    // petani
    viewPetani: async (req, res) => {
        try {
            const petani = db.get('customer').value()
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/petani/view_petani', {
                petani, user: req.session.user,
                alert,
                title: "CV FAJAR | Petani"
            });
        } catch (error) {
            res.redirect('/admin/petani');
        }
    },
    addPetani: async (req, res) => {
        try {
            const { nama, telp, alamat, kelompok_tani, pengelola_irigasi, luas_tanah } = req.body;
            let [ktp, kartu_keluarga] = req.files;
            const tgl_buat = tgl_ubah = new Date().toLocaleString()
            kartu_keluarga = `images/${kartu_keluarga.filename}`, ktp = `images/${ktp.filename}`
            const data = { nama, telp, alamat, kelompok_tani, pengelola_irigasi, luas_tanah, kartu_keluarga, ktp, tgl_buat, tgl_ubah }
            db.get('customer').push({
                ...data, id: nanoid()
            }).write();
            req.flash('alertMessage', 'Success Add Petani!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/petani');  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/petani');
        }
    },
    editPetani: async (req, res) => {
        try {
            const { id, nama, telp, alamat, kelompok_tani, pengelola_irigasi, luas_tanah } = req.body;
            let [ktp, kartu_keluarga] = req.files;
            const petani = db.get('customer').find({
                id: id
            }).value()
            const tgl_ubah = new Date().toLocaleString();
            let data = { nama, telp, alamat, kelompok_tani, pengelola_irigasi, luas_tanah, tgl_ubah }
            if (req.files < 1) {
                db.get("customer").find({
                    id: id
                }).assign(data).value()
                db.write()
                req.flash('alertMessage', 'Success Update Petani!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/petani');
            } else {
                await fs.unlink(path.join(`public/${petani.kartu_keluarga}`)); 
                await fs.unlink(path.join(`public/${petani.ktp}`)); 
                kartu_keluarga = `images/${kartu_keluarga.filename}`, ktp = `images/${ktp.filename}`
                data = {...data, ktp, kartu_keluarga}
                db.get("customer").find({
                    id: id
                }).assign(data).value()
                db.write()
                req.flash('alertMessage', 'Success Update Petani!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/petani');
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/petani');
        }
    },
    deletePetani: async (req, res) => {
        try {
            const { id } = req.params;
            const petani = db.get('customer').find({
                id: id
            }).value();
            await fs.unlink(path.join(`public/${petani.kartu_keluarga}`)); 
            await fs.unlink(path.join(`public/${petani.ktp}`)); 
            db.get("customer").remove({
                id: id
            }).write() 
            req.flash('alertMessage', 'Success Delete Petani!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/petani');   
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/petani');
        }
    },
    // kategori
    viewKategori: async (req, res) => {
        try {
            const kategori = db.get('kategori').value()
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/kategori/view_kategori', {
                kategori, user: req.session.user,
                alert,
                title: "CV FAJAR | Kategori"
            });
        } catch (error) {
            res.redirect('/admin/kategori');
        }
    },
    addKategori: async (req, res) => {
        try {
            const { nama } = req.body;
            const tgl_buat = tgl_ubah = new Date().toLocaleString()
            const data = { nama, tgl_buat, tgl_ubah }
            db.get('kategori').push({
                ...data, id: nanoid()
            }).write(); 
            req.flash('alertMessage', 'Success Add Kategori!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/kategori');  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/kategori');
        }
    },
    editKategori: async (req, res) => {
        try {
            const { id, nama } = req.body;
            const tgl_ubah = new Date().toLocaleString()
            const data = { nama, tgl_ubah }
            db.get("kategori").find({
                id: id
            }).assign(data).value()
            req.flash('alertMessage', 'Success Update Kategori!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/kategori');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/kategori');
        }
    },
    deleteKategori: async (req, res) => {
        try {
            const { id } = req.params; 
            db.get("kategori").remove({
                id: id
            }).write()  
            req.flash('alertMessage', 'Success Delete Kategori!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/kategori');   
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/kategori');
        }
    },
    // stok_barang
    viewStok: async (req, res) => {
        try {
            let stok_barang = db.get('stok_barang').value();
            const barang = db.get('barang').value();
            for (let i = 0; i < stok_barang.length; i++) {
                for (let j = 0; j < barang.length; j++) {
                    if (stok_barang[i].barangId === barang[j].id) {
                        stok_barang[i].barangId = barang[j].nama;
                    }
                }
            }
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/stok_barang/view_stok_barang', {
                stok_barang, barang, user: req.session.user,
                alert,
                title: "CV FAJAR | Stok Barang"
            });
        } catch (error) {
            res.redirect('/admin/stok_barang');
        }
    },
    addStok: async (req, res) => {
        try {
            const { barangId, jumlah, harga_beli, kadaluwarsa } = req.body;
            const tgl_buat = tgl_ubah = new Date().toLocaleString()
            const data = { barangId, jumlah, harga_beli, kadaluwarsa, tgl_buat, tgl_ubah }
            db.get('stok_barang').push({
                ...data, id: nanoid()
            }).write();
            req.flash('alertMessage', 'Success Add Stok Barang!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/stok_barang');  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/stok_barang');
        }
    },
    editStok: async (req, res) => {
        try {
            const { id, barangId, jumlah, harga_beli, kadaluwarsa } = req.body;
            const tgl_ubah = new Date().toLocaleString()
            const data = { tgl_ubah, barangId, jumlah, harga_beli, kadaluwarsa }
            db.get("stok_barang").find({
                id: id
            }).assign(data).value()
            req.flash('alertMessage', 'Success Update Stok Barang!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/stok_barang');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/stok_barang');
        }
    },
    deleteStok: async (req, res) => {
        try {
            const { id } = req.params; 
            db.get("stok_barang").remove({
                id: id
            }).write()  
            req.flash('alertMessage', 'Success Delete Stok Barang!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/stok_barang');   
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/stok_barang');
        }
    },
    // penjualan
    viewPenjualan: async (req, res) => {
        try {
            let penjualan = db.get('penjualan').value();
            const admin = db.get('admin').value();
            const petani = db.get('customer').value();
            for (let i = 0; i < penjualan.length; i++) {
                for (let j = 0; j < admin.length; j++) {
                    if (penjualan[i].adminId === admin[j].id) {
                        penjualan[i].adminId = admin[j].nama;
                    }
                    for (let k = 0; k < petani.length; k++) {
                        if (penjualan[i].customerId === petani[k].id) {
                            penjualan[i].customerId = petani[k].nama;
                        }
                    }
                }
            }
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/penjualan/view_penjualan', {
                penjualan, admin, petani, user: req.session.user,
                alert,
                title: "CV FAJAR | Penjualan"
            });
        } catch (error) {
            res.redirect('/admin/penjualan');
        }
    },
    addPenjualan: async (req, res) => {
        try {
            const { adminId, customerId, total_harga } = req.body;
            const tgl_buat = tgl_ubah = new Date().toLocaleString()
            const data = { adminId, customerId, total_harga, tgl_buat, tgl_ubah }
            db.get('penjualan').push({
                ...data, id: nanoid()
            }).write(); 
            req.flash('alertMessage', 'Success Add Penjualan!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/penjualan');  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/penjualan');
        }
    },
    editPenjualan: async (req, res) => {
        try {
            const { id, adminId, customerId, total_harga } = req.body;
            const tgl_ubah = new Date().toLocaleString()
            const data = { adminId, customerId, total_harga, tgl_ubah }
            db.get("penjualan").find({
                id: id
            }).assign(data).value()
            req.flash('alertMessage', 'Success Update Penjualan!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/penjualan');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/penjualan');
        }
    },
    deletePenjualan: async (req, res) => {
        try {
            const { id } = req.params;
            db.get("penjualan").remove({
                id: id
            }).write() 
            req.flash('alertMessage', 'Success Delete Penjualan!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/penjualan');   
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/penjualan');
        }
    },
    // detail_penjualan
    viewDetail: async (req, res) => {
        try {
            let detail_penjualan = db.get('detail_penjualan').value();
            const barang = db.get('barang').value();
            const penjualan = db.get('customer').value();
            for (let i = 0; i < detail_penjualan.length; i++) {
                for (let j = 0; j < barang.length; j++) {
                    if (detail_penjualan[i].barangId === barang[j].id) {
                        detail_penjualan[i].barangId = barang[j].nama;
                    }
                    for (let k = 0; k < penjualan.length; k++) {
                        if (detail_penjualan[i].penjualanId === penjualan[k].id) {
                            detail_penjualan[i].penjualanId = penjualan[k].id;
                        }
                    }
                }
            }
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/detail_penjualan/view_detail_penjualan', {
                detail_penjualan, barang, penjualan, user: req.session.user,
                alert,
                title: "CV FAJAR | Detail Penjualan"
            });
        } catch (error) {
            res.redirect('/admin/detail_penjualan');
        }
    },
    addDetail: async (req, res) => {
        try {
            const { barangId, penjualanId, jumlah, total_harga } = req.body;
            const tgl_buat = tgl_ubah = new Date().toLocaleString()
            const data = { barangId, penjualanId, jumlah, total_harga, tgl_buat, tgl_ubah }
            db.get('detail_penjualan').push({
                ...data, id: nanoid()
            }).write();
            req.flash('alertMessage', 'Success Add Detail Penjualan!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/detail_penjualan');  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/detail_penjualan');
        }
    },
    editDetail: async (req, res) => {
        try {
            const { id, barangId, penjualanId, jumlah, total_harga } = req.body;
            const tgl_ubah = new Date().toLocaleString()
            const data = { barangId, penjualanId, jumlah, total_harga, tgl_ubah }
            db.get("detail_penjualan").find({
                id: id
            }).assign(data).value()
            req.flash('alertMessage', 'Success Update Detail Penjualan!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/detail_penjualan');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/detail_penjualan');
        }
    },
    deleteDetail: async (req, res) => {
        try {
            const { id } = req.params;
            db.get("detail_penjualan").remove({
                id: id
            }).write()
            req.flash('alertMessage', 'Success Delete Detail Penjualan!');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/detail_penjualan');   
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/detail_penjualan');
        }
    },
}