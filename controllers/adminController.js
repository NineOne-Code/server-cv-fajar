const mysql = require('mysql');
const fs = require('fs-extra');
const path = require('path');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_pertanian'
  });
  connection.connect((err) => {
    if (err) throw err;
    console.log('Connected!');
  });

module.exports = {
    viewSignin: async (req, res) => {
        try {
            const sql = 'SELECT * FROM admin';
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                // console.log(results.filter(x => x.username == 'wyvren'))
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
            });
        } catch (error) {
            res.redirect('/admin/signin');
        }
    },
    actionSignin: async (req, res) => {
        try {
            const { username, password } = req.body;
            console.log(req.body)
            let sql = `SELECT * FROM admin WHERE username = '${username}'`;
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                let checkUser, checkPass;
                results.forEach(x => {
                    checkUser = x.username;
                    checkPass = x.password;
                    namaUser = x.nama;
                    idUser = x.admin_id
                })
                console.log('results')
                console.log(checkUser, checkPass)
                if(checkUser === username) {
                    if(checkPass == password) {
                        req.session.user = {
                            id: idUser,
                            nama: namaUser
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
            });
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
            let petani = [];
            let countPetani;
            let barang = [];
            let penjualan = [];
            await connection.query('SELECT * FROM customer', (error, results, fields) => {
                if (error) {
                return console.error(error.message);
                }
                results.forEach((index, element) => {
                    petani.push(index.customer_id);
                });
                petani = [...new Set(petani)];
                for (let i = 0; i < petani.length; i++) {
                    countPetani = +petani[i];
                    
                }
                console.log('petani')
                console.log(countPetani)
                connection.query('SELECT * FROM barang', (error, results, fields) => {
                    if (error) {
                    return console.error(error.message);
                    }
                    results.forEach((index, element) => {
                        barang.push(index.barang_id);
                    });
                    barang = [...new Set(barang)];
                    console.log('barang')
                    console.log(barang)
                    connection.query('SELECT * FROM penjualan', (error, results, fields) => {
                        if (error) {
                        return console.error(error.message);
                        }
                        results.forEach((index, element) => {
                            penjualan.push(index.penjualan_id);
                        });
                        penjualan = [...new Set(penjualan)];
                        // console.log()
                        res.render('admin/dashboard/view_dashboard', {
                            penjualan, petani, barang, user: req.session.user,
                            title: "CV FAJAR | Dashboard"
                        });
                    });
                });
            });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    },
    viewBarang: async (req, res) => {
        try {
            const sql = 'SELECT a.*, b.nama AS kate FROM barang a JOIN kategori b ON a.kategori_id = b.kategori_id';
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                let unique = [];
                results.forEach((index, element) => {
                    // console.log(`elm -> ${element}, index -> ${index.kate}`)
                    unique.push(index.kate);
                });
                // console.log(results)
                unique = [...new Set(unique)];
                const alertMessage = req.flash('alertMessage');
                const alertStatus = req.flash('alertStatus');
                const alert = {message: alertMessage, status: alertStatus};
                // console.log(category);
                res.render('admin/barang/view_barang', {
                    results, unique, user: req.session.user,
                    alert,
                    title: "CV FAJAR | Barang"
                });
                });
            // console.log(barang);
        } catch (error) {
            res.redirect('/admin/barang');
        }
    },
    addBarang: async (req, res) => {
        try {
            const { nama, kate, harga_jual, stok } = req.body;
            const img = `images/${req.file.filename}`;
            console.log(img, nama, kate, harga_jual, stok)
            const sql = `INSERT INTO barang (barang_id, nama, kategori_id, harga_jual, stok, image, tgl_buat, tgl_ubah) VALUES (NULL, '${nama}', '${kate}', '${harga_jual}', '${stok}', '${img}', current_timestamp(), current_timestamp());`;
            // console.log(sql)
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Add Barang!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/barang');  
            });  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/barang');
        }
    },
    editBarang: async (req, res) => {
        try {
            const { id, nama, kate, harga_jual, stok } = req.body;
            console.log(id, nama, kate, harga_jual, stok)
            let sql = `UPDATE barang SET `
            if (req.file == undefined) {
                // await bank.save();
                await connection.query(sql + `nama = '${nama}', kategori_id = '${kate}', harga_jual = '${harga_jual}', stok = '${stok}' WHERE barang_id = '${id}'`, (error, results, fields) => {
                    if (error) {
                      return console.error(error.message);
                    }
                    req.flash('alertMessage', 'Success Update Barang!');
                    req.flash('alertStatus', 'success');
                    res.redirect('/admin/barang');
                });
            } else {
                await connection.query(`SELECT image FROM barang WHERE barang_id = '${id}'`, async (error, result) => {
                    if (error) {
                      return console.error(error.message);
                    }
                    console.log('Select Image');
                    console.log(result)
                    console.log('END Select Image');
                    await fs.unlink(path.join(`public/${result.image}`)); 
                }); 
                await connection.query(sql + `nama = '${nama}', kategori_id = '${kate}', harga_jual = '${harga_jual}', stok = '${stok}', image = 'images/${req.file.filename}' WHERE barang_id = '${id}'`, (error, results, fields) => {
                    if (error) {
                      return console.error(error.message);
                    }
                    req.flash('alertMessage', 'Success Update Barang!');
                    req.flash('alertStatus', 'success');
                    res.redirect('/admin/barang');
                });
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
            const sql = `DELETE FROM barang WHERE barang_id = '${id}'`;
            await connection.query(`SELECT image FROM barang WHERE barang_id = '${id}'`, async (error, result) => {
                if (error) {
                  return console.error(error.message);
                }
                console.log('Select Image');
                result.forEach((index, element) => {
                    result = index.image
                    console.log(result)
                });
                console.log('END Select Image');
                await fs.unlink(path.join(`public/${result}`)); 
            }); 
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Delete Barang!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/barang');   
            });  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/barang');
        }
    },
    // petani
    viewPetani: async (req, res) => {
        try {
            const sql = 'SELECT * FROM customer';
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                let unique = [];
                results.forEach((index, element) => {
                    unique.push(index.kate);
                });
                unique = [...new Set(unique)];
                const alertMessage = req.flash('alertMessage');
                const alertStatus = req.flash('alertStatus');
                const alert = {message: alertMessage, status: alertStatus};
                res.render('admin/petani/view_petani', {
                    results, unique, user: req.session.user,
                    alert,
                    title: "CV FAJAR | Petani"
                });
                });
        } catch (error) {
            res.redirect('/admin/petani');
        }
    },
    addPetani: async (req, res) => {
        try {
            const { nama, telp, alamat, kelompok_tani, pengelola_irigasi, luas_tanah } = req.body;
            const [img1, img2] = req.files;
            console.log(img1, img2);
            const sql = `INSERT INTO customer (customer_id, nama, telp, alamat, kartu_keluarga, ktp, kelompok_tani, pengelola_irigasi, luas_tanah) VALUES (NULL, '${nama}', '${telp}', '${alamat}', 'images/${img2.filename}', 'images/${img1.filename}', '${kelompok_tani}', '${pengelola_irigasi}', '${luas_tanah}');`;
            // console.log(sql)
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Add Petani!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/petani');  
            });  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/petani');
        }
    },
    editPetani: async (req, res) => {
        try {
            const { id, nama, telp, alamat, kelompok_tani, pengelola_irigasi, luas_tanah } = req.body;
            const [img1, img2] = req.files;
            console.log(id, nama, telp, alamat, kelompok_tani, pengelola_irigasi, luas_tanah)
            let sql = `UPDATE customer SET `
            if (req.files < 1) {
                await connection.query(sql + `nama = '${nama}', telp = '${telp}', alamat = '${alamat}', kelompok_tani = '${kelompok_tani}', pengelola_irigasi = '${pengelola_irigasi}', luas_tanah = '${luas_tanah}' WHERE customer_id = '${id}'`, (error, results, fields) => {
                    if (error) {
                      return console.error(error.message);
                    }
                    req.flash('alertMessage', 'Success Update Petani!');
                    req.flash('alertStatus', 'success');
                    res.redirect('/admin/petani');
                });
            } else {
                await connection.query(`SELECT kartu_keluarga, ktp FROM customer WHERE customer_id = '${id}'`, async (error, results) => {
                    if (error) {
                      return console.error(error.message);
                    }
                    await fs.unlink(path.join(`public/${results.kartu_keluarga}`)); 
                    await fs.unlink(path.join(`public/${results.ktp}`)); 
                }); 
                await connection.query(sql + `nama = '${nama}', telp = '${telp}', alamat = '${alamat}', kartu_keluarga = 'images/${img2.filename}', ktp = 'images/${img1.filename}', kelompok_tani = '${kelompok_tani}', pengelola_irigasi = '${pengelola_irigasi}', luas_tanah = '${luas_tanah}' WHERE customer_id = '${id}'`, (error, results, fields) => {
                    if (error) {
                      return console.error(error.message);
                    }
                    req.flash('alertMessage', 'Success Update Petani!');
                    req.flash('alertStatus', 'success');
                    res.redirect('/admin/petani');
                });
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
            const sql = `DELETE FROM customer WHERE customer_id = '${id}'`;
            await connection.query(`SELECT kartu_keluarga, ktp FROM customer WHERE customer_id = '${id}'`, async (error, results) => {
                if (error) {
                  return console.error(error.message);
                }
                await fs.unlink(path.join(`public/${results.kartu_keluarga}`)); 
                await fs.unlink(path.join(`public/${results.ktp}`)); 
            }); 
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Delete Petani!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/petani');   
            });  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/petani');
        }
    },
    // kategori
    viewKategori: async (req, res) => {
        try {
            const sql = 'SELECT * FROM kategori';
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                let unique = [];
                results.forEach((index, element) => {
                    unique.push(index.kate);
                });
                unique = [...new Set(unique)];
                const alertMessage = req.flash('alertMessage');
                const alertStatus = req.flash('alertStatus');
                const alert = {message: alertMessage, status: alertStatus};
                res.render('admin/kategori/view_kategori', {
                    results, unique, user: req.session.user,
                    alert,
                    title: "CV FAJAR | Kategori"
                });
                });
        } catch (error) {
            res.redirect('/admin/kategori');
        }
    },
    addKategori: async (req, res) => {
        try {
            const { nama } = req.body;
            console.log(req.body)
            const sql = `INSERT INTO kategori (kategori_id, nama) VALUES (NULL, '${nama}');`;
            console.log(sql)
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Add Kategori!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/kategori');  
            });  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/kategori');
        }
    },
    editKategori: async (req, res) => {
        try {
            const { id, nama } = req.body;
            let sql = `UPDATE kategori SET nama = '${nama}' WHERE kategori_id = '${id}'`
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Update Kategori!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/kategori');
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/kategori');
        }
    },
    deleteKategori: async (req, res) => {
        try {
            const { id } = req.params;
            const sql = `DELETE FROM kategori WHERE kategori_id = '${id}'`;
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Delete Kategori!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/kategori');   
            });  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/kategori');
        }
    },
    // stok_barang
    viewStok: async (req, res) => {
        try {
            let unique = [];
            await connection.query('SELECT * FROM barang', (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                console.log('results')
                console.log(results)
                results.forEach((index, element) => {
                    unique.push(index.nama);
                    console.log(index)
                });
                unique = [...new Set(unique)];
                console.log(unique)
                });

            const sql = 'SELECT a.*, b.nama AS nama_barang FROM stok_barang a JOIN barang b ON a.barang_id = b.barang_id';
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                const alertMessage = req.flash('alertMessage');
                const alertStatus = req.flash('alertStatus');
                const alert = {message: alertMessage, status: alertStatus};
                res.render('admin/stok_barang/view_stok_barang', {
                    results, unique, user: req.session.user,
                    alert,
                    title: "CV FAJAR | Stok Barang"
                });
                });
        } catch (error) {
            res.redirect('/admin/stok_barang');
        }
    },
    addStok: async (req, res) => {
        try {
            const { nama_barang, jumlah, harga_beli, kadaluwarsa } = req.body;
            console.log(req.body)
            const sql = `INSERT INTO stok_barang (stok_id, barang_id, jumlah, harga_beli, kadaluwarsa) VALUES (NULL, '${nama_barang}', '${jumlah}', '${harga_beli}', '${kadaluwarsa}');`;
            console.log(sql)
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Add Stok Barang!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/stok_barang');  
            });  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/stok_barang');
        }
    },
    editStok: async (req, res) => {
        try {
            const { id, nama_barang, jumlah, harga_beli, kadaluwarsa } = req.body;
            let sql = `UPDATE stok_barang SET barang_id = '${nama_barang}', jumlah = '${jumlah}', harga_beli = '${harga_beli}', kadaluwarsa = '${kadaluwarsa}' WHERE stok_id = '${id}'`
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Update Stok Barang!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/stok_barang');
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/stok_barang');
        }
    },
    deleteStok: async (req, res) => {
        try {
            const { id } = req.params;
            const sql = `DELETE FROM stok_barang WHERE stok_id = '${id}'`;
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Delete Stok Barang!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/stok_barang');   
            });  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/stok_barang');
        }
    },
    // penjualan
    viewPenjualan: async (req, res) => {
        try {
            let admin = [];
            await connection.query('SELECT * FROM admin', (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                results.forEach((index, element) => {
                    admin.push(index.nama);
                });
                admin = [...new Set(admin)];
                console.log('admin')
                console.log(admin)
            });
            let petani = [];
            await connection.query('SELECT * FROM customer', (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                results.forEach((index, element) => {
                    petani.push(index.nama);
                });
                petani = [...new Set(petani)];
                console.log('petani')
                console.log(petani)
                });

            const sql = 'SELECT a.*, b.nama AS nama_admin, c.nama AS nama_petani FROM penjualan a JOIN admin b ON a.admin_id = b.admin_id JOIN customer c ON a.customer_id = c.customer_id';
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                console.log(results);
                let unique = [];
                results.forEach((index, element) => {
                    unique.push(index.kate);
                });
                unique = [...new Set(unique)];
                const alertMessage = req.flash('alertMessage');
                const alertStatus = req.flash('alertStatus');
                const alert = {message: alertMessage, status: alertStatus};
                res.render('admin/penjualan/view_penjualan', {
                    results, admin, petani, user: req.session.user,
                    alert,
                    title: "CV FAJAR | Penjualan"
                });
                });
        } catch (error) {
            res.redirect('/admin/penjualan');
        }
    },
    addPenjualan: async (req, res) => {
        try {
            const { admin, petani, total_harga } = req.body;
            const sql = `INSERT INTO penjualan (penjualan_id, admin_id, customer_id, total_harga) VALUES (NULL, '${admin}', '${petani}', '${total_harga}');`;
            console.log(sql)
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Add Penjualan!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/penjualan');  
            });  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/penjualan');
        }
    },
    editPenjualan: async (req, res) => {
        try {
            const { id, admin, petani, total_harga } = req.body;
            let sql = `UPDATE penjualan SET admin_id = '${admin}', customer_id = '${petani}', total_harga = '${total_harga}' WHERE penjualan_id = '${id}'`
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Update Penjualan!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/penjualan');
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/penjualan');
        }
    },
    deletePenjualan: async (req, res) => {
        try {
            const { id } = req.params;
            const sql = `DELETE FROM penjualan WHERE penjualan_id = '${id}'`;
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Delete Penjualan!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/penjualan');   
            });  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/penjualan');
        }
    },
    // detail_penjualan
    viewDetail: async (req, res) => {
        try {
            let barang = [];
            await connection.query('SELECT * FROM barang', (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                results.forEach((index, element) => {
                    barang.push(index.nama);
                });
                barang = [...new Set(barang)];
                console.log('barang')
                console.log(barang)
            });
            let penjualan = [];
            await connection.query('SELECT * FROM penjualan', (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                results.forEach((index, element) => {
                    penjualan.push(index.penjualan_id);
                });
                penjualan = [...new Set(penjualan)];
                console.log('penjualan')
                console.log(penjualan)
                });

            const sql = 'SELECT a.*, b.nama AS nama_barang, c.penjualan_id AS penjualan_id FROM detail_penjualan a JOIN barang b ON a.barang_id = b.barang_id JOIN penjualan c ON a.penjualan_id = c.penjualan_id';
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                const alertMessage = req.flash('alertMessage');
                const alertStatus = req.flash('alertStatus');
                const alert = {message: alertMessage, status: alertStatus};
                res.render('admin/detail_penjualan/view_detail_penjualan', {
                    results, barang, penjualan, user: req.session.user,
                    alert,
                    title: "CV FAJAR | Detail Penjualan"
                });
                });
        } catch (error) {
            res.redirect('/admin/detail_penjualan');
        }
    },
    addDetail: async (req, res) => {
        try {
            const { nama_barang, penjualan_id, jumlah, total_harga } = req.body;
            const sql = `INSERT INTO detail_penjualan (detail_penjualan_id, barang_id, penjualan_id, jumlah, total_harga) VALUES (NULL, '${nama_barang}', '${penjualan_id}', '${jumlah}', '${total_harga}');`;
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Add Detail Penjualan!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/detail_penjualan');  
            });  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/detail_penjualan');
        }
    },
    editDetail: async (req, res) => {
        try {
            const { id, nama_barang, penjualan_id, jumlah, total_harga } = req.body;
            let sql = `UPDATE detail_penjualan SET barang_id = '${nama_barang}', penjualan_id = '${penjualan_id}', jumlah = '${jumlah}', total_harga = '${total_harga}' WHERE detail_penjualan_id = '${id}'`
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Update Detail Penjualan!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/detail_penjualan');
            });
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/detail_penjualan');
        }
    },
    deleteDetail: async (req, res) => {
        try {
            const { id } = req.params;
            const sql = `DELETE FROM detail_penjualan WHERE detail_penjualan_id = '${id}'`;
            await connection.query(sql, (error, results, fields) => {
                if (error) {
                  return console.error(error.message);
                }
                req.flash('alertMessage', 'Success Delete Detail Penjualan!');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/detail_penjualan');   
            });  
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/detail_penjualan');
        }
    },
}