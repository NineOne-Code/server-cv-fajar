const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { uploadSingle, uploadMultiple } = require('../middlewares/multer');
const auth = require('../middlewares/auth')

router.get('/signin', adminController.viewSignin);
router.post('/signin',  adminController.actionSignin);
// router.use(auth);
router.get('/logout', adminController.actionLogout);
router.get('/dashboard', adminController.viewDashboard);
// endpoint barang
router.get('/barang', adminController.viewBarang);
router.post('/barang', uploadSingle, adminController.addBarang);
router.put('/barang', uploadSingle, adminController.editBarang);
router.delete('/barang/:id', adminController.deletebarang);
// endpoint petani
router.get('/petani', adminController.viewPetani);
router.post('/petani', uploadMultiple, adminController.addPetani);
router.put('/petani', uploadMultiple, adminController.editPetani);
router.delete('/petani/:id', adminController.deletePetani);
// endpoint kategori
router.get('/kategori', adminController.viewKategori);
router.post('/kategori', uploadMultiple, adminController.addKategori);
router.put('/kategori', uploadMultiple, adminController.editKategori);
router.delete('/kategori/:id', adminController.deleteKategori);
// endpoint stok_barang
router.get('/stok_barang', adminController.viewStok);
router.post('/stok_barang', uploadSingle, adminController.addStok);
router.put('/stok_barang', uploadSingle, adminController.editStok);
router.delete('/stok_barang/:id', adminController.deleteStok);
// endpoint penjualan
router.get('/penjualan', adminController.viewPenjualan);
router.post('/penjualan', uploadSingle, adminController.addPenjualan);
router.put('/penjualan', uploadSingle, adminController.editPenjualan);
router.delete('/penjualan/:id', adminController.deletePenjualan);
// endpoint detail_penjualan
router.get('/detail_penjualan', adminController.viewDetail);
router.post('/detail_penjualan', uploadSingle, adminController.addDetail);
router.put('/detail_penjualan', uploadSingle, adminController.editDetail);
router.delete('/detail_penjualan/:id', adminController.deleteDetail);

module.exports = router;