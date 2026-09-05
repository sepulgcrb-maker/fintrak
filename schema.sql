-- =============================================================================
-- SKEMA BASIS DATA SQL (PostgreSQL & MySQL Compatible)
-- Aplikasi: Sistem Akuntansi & Manajemen Keuangan
-- Termasuk Tabel Baru: ASET TETAP (Fixed Assets), Piutang, Utang, Jurnal, dll.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABEL BARU: ASET TETAP & DEPRESIASI (fixed_assets)
-- Menyimpan aktiva tetap berwujud, nilai perolehan, masa manfaat, dan akumulasi penyusutan.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fixed_assets (
    id VARCHAR(36) PRIMARY KEY,
    asset_code VARCHAR(50) NOT NULL UNIQUE,          -- Contoh: AST-2026-001
    name VARCHAR(255) NOT NULL,                      -- Nama aset (misal: Laptop MacBook Pro, Mobil Avanza)
    category VARCHAR(50) NOT NULL CHECK (
        category IN ('equipment', 'vehicles', 'machinery', 'furniture', 'building', 'other')
    ),
    purchase_date DATE NOT NULL,                     -- Tanggal perolehan
    acquisition_cost NUMERIC(15, 2) NOT NULL DEFAULT 0, -- Harga beli perolehan
    salvage_value NUMERIC(15, 2) NOT NULL DEFAULT 0,    -- Estimasi nilai residu / sisa
    useful_life_years INT NOT NULL DEFAULT 4 CHECK (useful_life_years > 0), -- Masa manfaat (Tahun)
    depreciation_method VARCHAR(30) NOT NULL DEFAULT 'straight_line' CHECK (
        depreciation_method IN ('straight_line', 'manual')
    ),
    accumulated_depreciation NUMERIC(15, 2) NOT NULL DEFAULT 0, -- Akumulasi beban penyusutan
    location VARCHAR(100),                           -- Lokasi penempatan aset (misal: Kantor Pusat, Gudang)
    pic VARCHAR(100),                                -- Nama staf penanggung jawab
    notes TEXT,                                      -- Catatan nomor seri, spesifikasi teknis, dll.
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'maintenance', 'disposed')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks untuk pencarian cepat aset tetap
CREATE INDEX IF NOT EXISTS idx_fixed_assets_category ON fixed_assets(category);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_status ON fixed_assets(status);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_code ON fixed_assets(asset_code);

-- -----------------------------------------------------------------------------
-- 2. TABEL REKENING & AKUN KAS (accounts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50),
    type VARCHAR(30) NOT NULL CHECK (type IN ('bank', 'wallet', 'cash', 'business')),
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    color VARCHAR(20) DEFAULT '#10b981',
    icon VARCHAR(50) DEFAULT 'wallet',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. TABEL TRANSAKSI KAS & BANK (transactions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    receipt_number VARCHAR(50),
    user_id VARCHAR(36),
    account_id VARCHAR(36) REFERENCES accounts(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (
        status IN ('completed', 'pending', 'scheduled', 'overdue', 'cancelled')
    ),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_time VARCHAR(10) NOT NULL DEFAULT '12:00',
    recipient VARCHAR(100),
    notes TEXT,
    is_scheduled BOOLEAN DEFAULT FALSE,
    reminder_days_before INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);

-- -----------------------------------------------------------------------------
-- 4. TABEL PIUTANG USAHA (receivables)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS receivables (
    id VARCHAR(36) PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (
        status IN ('unpaid', 'partial', 'paid', 'overdue')
    ),
    product_or_service VARCHAR(255),
    branch VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_receivables_status ON receivables(status);
CREATE INDEX IF NOT EXISTS idx_receivables_due_date ON receivables(due_date);

-- -----------------------------------------------------------------------------
-- 5. TABEL UTANG USAHA (payables)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payables (
    id VARCHAR(36) PRIMARY KEY,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    vendor_name VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (
        status IN ('unpaid', 'partial', 'paid', 'overdue')
    ),
    category VARCHAR(100),
    department VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payables_status ON payables(status);
CREATE INDEX IF NOT EXISTS idx_payables_due_date ON payables(due_date);

-- -----------------------------------------------------------------------------
-- 6. TABEL JURNAL UMUM HEADER & LINE ITEMS (journal_entries & journal_lines)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS journal_entries (
    id VARCHAR(36) PRIMARY KEY,
    entry_number VARCHAR(50) NOT NULL UNIQUE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    reference VARCHAR(100),
    is_auto BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journal_lines (
    id VARCHAR(36) PRIMARY KEY,
    journal_entry_id VARCHAR(36) NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    debit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    credit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account_code ON journal_lines(account_code);

-- -----------------------------------------------------------------------------
-- 7. TABEL REKONSILIASI BANK (bank_reconciliations)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bank_reconciliations (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(36) REFERENCES transactions(id) ON DELETE SET NULL,
    account_id VARCHAR(36) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    statement_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    is_matched BOOLEAN DEFAULT FALSE,
    reconciled_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 8. TABEL PERIODE TUTUP BUKU (closing_periods)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS closing_periods (
    id VARCHAR(36) PRIMARY KEY,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('monthly', 'yearly')),
    period_name VARCHAR(50) NOT NULL,
    closed_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_by VARCHAR(100) NOT NULL,
    is_locked BOOLEAN DEFAULT TRUE,
    net_income NUMERIC(15, 2) NOT NULL DEFAULT 0,
    notes TEXT
);

-- -----------------------------------------------------------------------------
-- 9. TABEL RIWAYAT AUDIT TRAIL (audit_trails)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_trails (
    id VARCHAR(36) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(100) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    details TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- CONTOH DATA AWAL (SEED DATA UNTUK TABEL ASET TETAP)
-- -----------------------------------------------------------------------------
INSERT INTO fixed_assets (
    id, asset_code, name, category, purchase_date, 
    acquisition_cost, salvage_value, useful_life_years, 
    depreciation_method, accumulated_depreciation, location, pic, notes, status
) VALUES 
(
    'ast-001', 'AST-2024-001', 'MacBook Pro M2 Max (Desain & Dev)', 'equipment', '2024-01-15',
    28000000.00, 3000000.00, 4, 'straight_line', 13541666.00, 'Studio Utama Lt. 2', 'Ahmad Dani', 'Serial: C02G9988HJK1', 'active'
),
(
    'ast-002', 'AST-2023-002', 'Toyota Avanza Veloz 1.5 AT (Operasional)', 'vehicles', '2023-05-10',
    240000000.00, 50000000.00, 8, 'straight_line', 79166667.00, 'Parkir Kantor Pusat', 'Budi Santoso', 'Plat B 1234 ABC', 'active'
),
(
    'ast-003', 'AST-2024-003', 'Mesin Genset Silent 10 kVA', 'machinery', '2024-06-01',
    45000000.00, 5000000.00, 8, 'straight_line', 10416667.00, 'Gudang & Utilitas', 'Agus Prayogo', 'Perawatan berkala tiap 3 bulan', 'active'
),
(
    'ast-004', 'AST-2024-004', 'Meja & Kursi Ergonomis Kantor (1 Set)', 'furniture', '2024-02-10',
    18000000.00, 1000000.00, 4, 'straight_line', 8854167.00, 'Ruang Kerja Tim', 'Siti Rahma', 'Kondisi mulus', 'active'
)
ON CONFLICT (id) DO NOTHING;
