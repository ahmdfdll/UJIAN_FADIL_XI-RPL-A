
const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/alat", async (req, res) => {
    try {
        const q = `
            SELECT alat.id_alat, alat.id_kategori, kategori_alat.nama_kategori,
            alat.nama_alat, alat.kondisi, alat.stok, alat.lokasi
            FROM alat
            JOIN kategori_alat ON alat.id_kategori = kategori_alat.id_kategori
            ORDER BY alat.id_alat ASC
        `;
        const result = await pool.query(q);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal mengambil data alat" });
    }
});

app.get("/api/kategori_alat", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM kategori_alat ORDER BY id_kategori ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal mengambil kategori" });
    }
});

app.get("/api/peminjaman", async (req, res) => {
    try {
        const q = `
            SELECT peminjaman.*, alat.nama_alat
            FROM peminjaman
            JOIN alat ON peminjaman.id_alat = alat.id_alat
            ORDER BY peminjaman.id_peminjaman DESC
        `;
        const result = await pool.query(q);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal mengambil peminjaman" });
    }
});

app.post("/api/alat", async (req, res) => {
    try {
        const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;

        const q = `
            INSERT INTO alat (id_kategori, nama_alat, kondisi, stok, lokasi)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;

        const result = await pool.query(q, [
            id_kategori, nama_alat, kondisi, stok, lokasi
        ]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Alat gagal ditambahkan" });
    }
});

app.post("/api/kategori", async (req, res) => {
    try {
        const { nama_kategori, deskripsi } = req.body;

        const q = `
            INSERT INTO kategori_alat (nama_kategori, deskripsi)
            VALUES ($1, $2) RETURNING *
        `;

        const result = await pool.query(q, [nama_kategori, deskripsi]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Kategori gagal ditambahkan" });
    }
});

app.post("/api/peminjaman", async (req, res) => {
    try {
        const {
            id_alat,
            nama_peminjam,
            kelas,
            tanggal_pinjam,
            tanggal_kembali,
            jumlah
        } = req.body;

        if (tanggal_kembali < tanggal_pinjam) {
            return res.status(400).json({
                error: "Tanggal kembali tidak boleh sebelum tanggal pinjam"
            });
        }

        const q = `
            INSERT INTO peminjaman
            (id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'Dipinjam')
            RETURNING *
        `;

        const result = await pool.query(q, [
            id_alat,
            nama_peminjam,
            kelas,
            tanggal_pinjam,
            tanggal_kembali,
            jumlah
        ]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Peminjaman gagal ditambahkan" });
    }
});

app.patch("/api/alat/:id", async (req, res) => {
    try {
        const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;

        const q = `
            UPDATE alat SET
            id_kategori = COALESCE($1, id_kategori),
            nama_alat = COALESCE($2, nama_alat),
            kondisi = COALESCE($3, kondisi),
            stok = COALESCE($4, stok),
            lokasi = COALESCE($5, lokasi)
            WHERE id_alat = $6 RETURNING *
        `;

        const result = await pool.query(q, [
            id_kategori, nama_alat, kondisi, stok, lokasi, req.params.id
        ]);

        if (!result.rows.length) {
            return res.status(404).json({ error: "Alat tidak ditemukan" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Alat gagal diperbarui" });
    }
});

app.patch("/api/kategori/:id", async (req, res) => {
    try {
        const { nama_kategori, deskripsi } = req.body;

        const q = `
            UPDATE kategori_alat SET
            nama_kategori = COALESCE($1, nama_kategori),
            deskripsi = COALESCE($2, deskripsi)
            WHERE id_kategori = $3 RETURNING *
        `;

        const result = await pool.query(q, [
            nama_kategori, deskripsi, req.params.id
        ]);

        if (!result.rows.length) {
            return res.status(404).json({ error: "Kategori tidak ditemukan" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Kategori gagal diperbarui" });
    }
});

app.patch("/api/peminjaman/:id", async (req, res) => {
    try {
        const q = `
            UPDATE peminjaman SET status = $1
            WHERE id_peminjaman = $2 RETURNING *
        `;

        const result = await pool.query(q, [
            req.body.status, req.params.id
        ]);

        if (!result.rows.length) {
            return res.status(404).json({ error: "Peminjaman tidak ditemukan" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Status gagal diperbarui" });
    }
});

app.delete("/api/alat/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM alat WHERE id_alat = $1 RETURNING *",
            [req.params.id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: "Alat tidak ditemukan" });
        }

        res.json({ message: "Alat berhasil dihapus" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Alat tidak dapat dihapus" });
    }
});

app.delete("/api/kategori/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM kategori_alat WHERE id_kategori = $1 RETURNING *",
            [req.params.id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: "Kategori tidak ditemukan" });
        }

        res.json({ message: "Kategori berhasil dihapus" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Kategori tidak dapat dihapus" });
    }
});

app.delete("/api/peminjaman/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM peminjaman WHERE id_peminjaman = $1 RETURNING *",
            [req.params.id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: "Data tidak ditemukan" });
        }

        res.json({ message: "Peminjaman berhasil dihapus" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Peminjaman gagal dihapus" });
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
