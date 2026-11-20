
const API = "http://localhost:5000/api";

let daftarAlat = [];
let daftarKategori = [];
let daftarPeminjaman = [];

async function request(endpoint, options = {}) {
    const response = await fetch(API + endpoint, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || data.message || "Terjadi kesalahan");
    }

    return data;
}

function aman(teks) {
    return String(teks ?? "").replace(/[&<>"']/g, function (karakter) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[karakter];
    });
}

function formatTanggal(tanggal) {
    if (!tanggal) return "-";

    const [tahun, bulan, hari] = String(tanggal).slice(0, 10).split("-");

    return `${hari}-${bulan}-${tahun}`;
}

async function tampilAlat() {
    try {
        daftarAlat = await request("/alat");

        const tabel = document.getElementById("tabelAlat");

        if (daftarAlat.length === 0) {
            tabel.innerHTML = `
                <tr>
                    <td colspan="7" class="p-6 text-center text-slate-400">
                        Belum ada data alat.
                    </td>
                </tr>
            `;
        } else {
            tabel.innerHTML = daftarAlat.map(function (alat) {
                return `
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                        <td class="p-3">${aman(alat.id_alat)}</td>
                        <td class="p-3">${aman(alat.id_kategori)}</td>
                        <td class="p-3 font-semibold">${aman(alat.nama_alat)}</td>
                        <td class="p-3">${aman(alat.kondisi)}</td>
                        <td class="p-3">${aman(alat.stok)}</td>
                        <td class="p-3">${aman(alat.lokasi)}</td>
                        <td class="p-3">
                            <div class="flex gap-3">
                                <button class="text-[#315e46] font-semibold" data-action="edit-alat" data-id="${alat.id_alat}">Edit</button>
                                <button class="text-red-500 font-semibold" data-action="hapus-alat" data-id="${alat.id_alat}">Hapus</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        tampilPilihanAlat();
        tampilPilihanEditAlat();

    } catch (error) {
        alert(error.message);
    }
}

async function tampilKategori() {
    try {
        daftarKategori = await request("/kategori_alat");

        const tabel = document.getElementById("tabelKategori");

        if (daftarKategori.length === 0) {
            tabel.innerHTML = `
                <tr>
                    <td colspan="4" class="p-6 text-center text-slate-400">
                        Belum ada kategori.
                    </td>
                </tr>
            `;
        } else {
            tabel.innerHTML = daftarKategori.map(function (kategori) {
                return `
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                        <td class="p-3">${aman(kategori.id_kategori)}</td>
                        <td class="p-3 font-semibold">${aman(kategori.nama_kategori)}</td>
                        <td class="p-3">${aman(kategori.deskripsi || "-")}</td>
                        <td class="p-3">
                            <div class="flex gap-3">
                                <button class="text-[#315e46] font-semibold" data-action="edit-kategori" data-id="${kategori.id_kategori}">Edit</button>
                                <button class="text-red-500 font-semibold" data-action="hapus-kategori" data-id="${kategori.id_kategori}">Hapus</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        tampilPilihanKategori();
        tampilPilihanEditKategori();

    } catch (error) {
        alert(error.message);
    }
}

async function tampilPeminjaman() {
    try {
        daftarPeminjaman = await request("/peminjaman");

        const tabel = document.getElementById("tabelPeminjaman");

        if (daftarPeminjaman.length === 0) {
            tabel.innerHTML = `
                <tr>
                    <td colspan="9" class="p-6 text-center text-slate-400">
                        Belum ada data peminjaman.
                    </td>
                </tr>
            `;
            return;
        }

        tabel.innerHTML = daftarPeminjaman.map(function (pinjam) {
            const status = pinjam.status === "Dikembalikan"
                ? `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-semibold">Dikembalikan</span>`
                : `<span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-semibold">Dipinjam</span>`;

            const aksi = pinjam.status === "Dipinjam"
                ? `<button class="bg-[#e8f0e9] text-[#285640] px-3 py-2 rounded-md font-semibold" data-action="kembalikan" data-id="${pinjam.id_peminjaman}">Kembalikan</button>`
                : `<button class="text-red-500 font-semibold" data-action="hapus-peminjaman" data-id="${pinjam.id_peminjaman}">Hapus</button>`;

            return `
                <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="p-3">${aman(pinjam.id_peminjaman)}</td>
                    <td class="p-3">${aman(pinjam.id_alat)}</td>
                    <td class="p-3 font-semibold">${aman(pinjam.nama_peminjam)}</td>
                    <td class="p-3">${aman(pinjam.kelas)}</td>
                    <td class="p-3">${formatTanggal(pinjam.tanggal_pinjam)}</td>
                    <td class="p-3">${formatTanggal(pinjam.tanggal_kembali)}</td>
                    <td class="p-3">${aman(pinjam.jumlah)}</td>
                    <td class="p-3">${status}</td>
                    <td class="p-3">${aksi}</td>
                </tr>
            `;
        }).join("");

    } catch (error) {
        alert(error.message);
    }
}

function tampilPilihanAlat() {
    const pilihan = document.getElementById("pilihAlat");

    pilihan.innerHTML = `<option value="">Pilih alat</option>`;

    daftarAlat.forEach(function (alat) {
        if (Number(alat.stok) > 0 && alat.kondisi === "Baik") {
            pilihan.innerHTML += `
                <option value="${alat.id_alat}">
                    ${aman(alat.nama_alat)} - Stok ${aman(alat.stok)}
                </option>
            `;
        }
    });
}

function tampilPilihanKategori() {
    const pilihan = document.getElementById("kategoriAlat");

    pilihan.innerHTML = `<option value="">Pilih kategori</option>`;

    daftarKategori.forEach(function (kategori) {
        pilihan.innerHTML += `
            <option value="${kategori.id_kategori}">
                ${aman(kategori.nama_kategori)}
            </option>
        `;
    });
}

function tampilPilihanEditAlat() {
    const pilihan = document.getElementById("pilihEditAlat");
    const nilaiLama = pilihan.value;

    pilihan.innerHTML = `<option value="">Pilih alat yang akan diedit</option>`;

    daftarAlat.forEach(function (alat) {
        pilihan.innerHTML += `
            <option value="${alat.id_alat}">
                ${aman(alat.nama_alat)}
            </option>
        `;
    });

    pilihan.value = nilaiLama;
}

function tampilPilihanEditKategori() {
    const pilihan = document.getElementById("pilihEditKategori");
    const nilaiLama = pilihan.value;

    pilihan.innerHTML = `<option value="">Pilih kategori yang akan diedit</option>`;

    daftarKategori.forEach(function (kategori) {
        pilihan.innerHTML += `
            <option value="${kategori.id_kategori}">
                ${aman(kategori.nama_kategori)}
            </option>
        `;
    });

    pilihan.value = nilaiLama;
}

document.getElementById("pilihEditAlat").addEventListener("change", function () {
    const alat = daftarAlat.find(item => item.id_alat == this.value);

    if (!alat) {
        resetEditAlat();
        return;
    }

    document.getElementById("editIdAlat").value = alat.id_alat;
    document.getElementById("editNamaAlat").value = alat.nama_alat;
    document.getElementById("editKategoriAlat").value = alat.id_kategori;
    document.getElementById("editKondisi").value = alat.kondisi;
    document.getElementById("editStok").value = alat.stok;
    document.getElementById("editLokasi").value = alat.lokasi;
});

document.getElementById("pilihEditKategori").addEventListener("change", function () {
    const kategori = daftarKategori.find(item => item.id_kategori == this.value);

    if (!kategori) {
        resetEditKategori();
        return;
    }

    document.getElementById("editNamaKategori").value = kategori.nama_kategori;
    document.getElementById("editDeskripsiKategori").value = kategori.deskripsi || "";
});

function resetEditAlat() {
    document.getElementById("editAlatForm").reset();
    document.getElementById("editIdAlat").value = "";
}

function resetEditKategori() {
    document.getElementById("editKategoriForm").reset();
}

document.getElementById("alatForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const data = {
        nama_alat: document.getElementById("nama_alat").value.trim(),
        id_kategori: document.getElementById("kategoriAlat").value,
        kondisi: document.getElementById("kondisi").value,
        stok: Number(document.getElementById("stok").value),
        lokasi: document.getElementById("lokasi").value.trim()
    };

    try {
        await request("/alat", {
            method: "POST",
            body: JSON.stringify(data)
        });

        alert("Alat berhasil ditambahkan.");

        this.reset();
        await tampilAlat();

    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("editAlatForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = document.getElementById("editIdAlat").value;

    if (!id) {
        alert("Pilih alat terlebih dahulu.");
        return;
    }

    const data = {
        nama_alat: document.getElementById("editNamaAlat").value.trim(),
        id_kategori: document.getElementById("editKategoriAlat").value,
        kondisi: document.getElementById("editKondisi").value,
        stok: Number(document.getElementById("editStok").value),
        lokasi: document.getElementById("editLokasi").value.trim()
    };

    try {
        await request(`/alat/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data)
        });

        alert("Data alat berhasil diperbarui.");

        resetEditAlat();
        await tampilAlat();

    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("kategoriForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const data = {
        nama_kategori: document.getElementById("nama_kategori").value.trim(),
        deskripsi: document.getElementById("deskripsiKategori").value.trim()
    };

    try {
        await request("/kategori", {
            method: "POST",
            body: JSON.stringify(data)
        });

        alert("Kategori berhasil ditambahkan.");

        this.reset();
        await tampilKategori();

    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("editKategoriForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = document.getElementById("pilihEditKategori").value;

    if (!id) {
        alert("Pilih kategori terlebih dahulu.");
        return;
    }

    const data = {
        nama_kategori: document.getElementById("editNamaKategori").value.trim(),
        deskripsi: document.getElementById("editDeskripsiKategori").value.trim()
    };

    try {
        await request(`/kategori/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data)
        });

        alert("Kategori berhasil diperbarui.");

        resetEditKategori();
        await tampilKategori();
        await tampilAlat();

    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("peminjamanForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const data = {
        nama_peminjam: document.getElementById("nama_peminjam").value.trim(),
        kelas: document.getElementById("kelas").value.trim(),
        id_alat: document.getElementById("pilihAlat").value,
        jumlah: Number(document.getElementById("jumlahPinjam").value),
        tanggal_pinjam: document.getElementById("tanggalPinjam").value,
        tanggal_kembali: document.getElementById("tanggalKembali").value
    };

    const alat = daftarAlat.find(item => item.id_alat == data.id_alat);

    if (!alat) {
        alert("Silakan pilih alat terlebih dahulu.");
        return;
    }

    if (data.jumlah < 1 || data.jumlah > Number(alat.stok)) {
        alert("Jumlah alat tidak sesuai dengan stok.");
        return;
    }

    if (!data.tanggal_pinjam || !data.tanggal_kembali) {
        alert("Tanggal pinjam dan tanggal kembali harus diisi.");
        return;
    }

    if (data.tanggal_kembali < data.tanggal_pinjam) {
        alert("Tanggal kembali tidak boleh sebelum tanggal pinjam.");
        return;
    }

    try {
        await request("/peminjaman", {
            method: "POST",
            body: JSON.stringify(data)
        });

        alert("Peminjaman berhasil disimpan.");

        this.reset();

        await tampilPeminjaman();

    } catch (error) {
        alert(error.message);
    }
});

async function hapusAlat(id) {
    if (!confirm("Yakin ingin menghapus alat ini?")) return;

    try {
        await request(`/alat/${id}`, {
            method: "DELETE"
        });

        alert("Alat berhasil dihapus.");
        await tampilAlat();

    } catch (error) {
        alert(error.message);
    }
}

async function hapusKategori(id) {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;

    try {
        await request(`/kategori/${id}`, {
            method: "DELETE"
        });

        alert("Kategori berhasil dihapus.");

        await tampilKategori();
        await tampilAlat();

    } catch (error) {
        alert(error.message);
    }
}

async function kembalikanAlat(id) {
    if (!confirm("Apakah alat ini sudah dikembalikan?")) return;

    try {
        await request(`/peminjaman/${id}`, {
            method: "PATCH",
            body: JSON.stringify({
                status: "Dikembalikan"
            })
        });

        alert("Pengembalian berhasil dicatat.");

        await tampilPeminjaman();

    } catch (error) {
        alert(error.message);
    }
}

async function hapusPeminjaman(id) {
    if (!confirm("Yakin ingin menghapus riwayat ini?")) return;

    try {
        await request(`/peminjaman/${id}`, {
            method: "DELETE"
        });

        alert("Riwayat berhasil dihapus.");
        await tampilPeminjaman();

    } catch (error) {
        alert(error.message);
    }
}

document.addEventListener("click", function (event) {
    const tombol = event.target.closest("[data-action]");

    if (!tombol) return;

    const id = tombol.dataset.id;
    const aksi = tombol.dataset.action;

    if (aksi === "edit-alat") {
        document.getElementById("pilihEditAlat").value = id;
        document.getElementById("pilihEditAlat").dispatchEvent(new Event("change"));

        document.getElementById("editAlatForm").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    if (aksi === "hapus-alat") hapusAlat(id);

    if (aksi === "edit-kategori") {
        document.getElementById("pilihEditKategori").value = id;
        document.getElementById("pilihEditKategori").dispatchEvent(new Event("change"));

        document.getElementById("editKategoriForm").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    if (aksi === "hapus-kategori") hapusKategori(id);
    if (aksi === "kembalikan") kembalikanAlat(id);
    if (aksi === "hapus-peminjaman") hapusPeminjaman(id);
});

async function mulaiAplikasi() {
    await tampilKategori();
    await tampilAlat();
    await tampilPeminjaman();
}

mulaiAplikasi();
