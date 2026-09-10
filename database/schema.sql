-- Hangzhou Cultural Tourism Ticketing DB
-- MySQL 8.x schema for the course project.

CREATE DATABASE IF NOT EXISTS hangzhou_cultural_tourism
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE hangzhou_cultural_tourism;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS vw_slot_availability;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS booking_orders;
DROP TABLE IF EXISTS booking_slots;
DROP TABLE IF EXISTS ticket_types;
DROP TABLE IF EXISTS scenic_spots;
DROP TABLE IF EXISTS user_accounts;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE user_accounts (
  id VARCHAR(40) PRIMARY KEY,
  username VARCHAR(40) NOT NULL UNIQUE,
  display_name VARCHAR(80) NOT NULL,
  role ENUM('管理员', '普通用户') NOT NULL DEFAULT '普通用户',
  status ENUM('启用', '停用') NOT NULL DEFAULT '启用',
  password_hash VARCHAR(128) NOT NULL,
  phone_masked VARCHAR(30) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  avatar_color VARCHAR(32) NOT NULL DEFAULT '#0a6e5c',
  CONSTRAINT chk_user_phone_masked CHECK (CHAR_LENGTH(phone_masked) >= 4)
) ENGINE=InnoDB;

CREATE TABLE scenic_spots (
  id VARCHAR(60) PRIMARY KEY,
  name_zh VARCHAR(120) NOT NULL,
  name_en VARCHAR(120) NOT NULL,
  area VARCHAR(80) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  address VARCHAR(180) NOT NULL,
  opening_hours VARCHAR(120) NOT NULL,
  tags JSON NOT NULL,
  reservation_required BOOLEAN NOT NULL DEFAULT FALSE,
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  image_url VARCHAR(255) NOT NULL DEFAULT '',
  image_position VARCHAR(32) NOT NULL DEFAULT '50% 50%',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_scenic_spots_area_category (area, category),
  INDEX idx_scenic_spots_featured (featured)
) ENGINE=InnoDB;

CREATE TABLE ticket_types (
  id VARCHAR(60) PRIMARY KEY,
  scenic_spot_id VARCHAR(60) NOT NULL,
  name VARCHAR(80) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  description TEXT NULL,
  available_for VARCHAR(160) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ticket_spot
    FOREIGN KEY (scenic_spot_id) REFERENCES scenic_spots(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT uq_ticket_spot_name UNIQUE (scenic_spot_id, name),
  CONSTRAINT chk_ticket_price CHECK (price >= 0),
  INDEX idx_ticket_spot (scenic_spot_id)
) ENGINE=InnoDB;

CREATE TABLE booking_slots (
  id VARCHAR(80) PRIMARY KEY,
  scenic_spot_id VARCHAR(60) NOT NULL,
  visit_date DATE NOT NULL,
  time_range VARCHAR(30) NOT NULL,
  capacity INT NOT NULL,
  base_booked INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_slot_spot
    FOREIGN KEY (scenic_spot_id) REFERENCES scenic_spots(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT uq_slot_spot_date_time UNIQUE (scenic_spot_id, visit_date, time_range),
  CONSTRAINT chk_slot_capacity CHECK (capacity > 0),
  CONSTRAINT chk_slot_base_booked CHECK (base_booked >= 0 AND base_booked <= capacity),
  INDEX idx_slot_lookup (scenic_spot_id, visit_date)
) ENGINE=InnoDB;

CREATE TABLE booking_orders (
  id VARCHAR(80) PRIMARY KEY,
  scenic_spot_id VARCHAR(60) NOT NULL,
  slot_id VARCHAR(80) NOT NULL,
  user_id VARCHAR(40) NULL,
  city_pass_id VARCHAR(60) NULL,
  ticket_name VARCHAR(80) NULL,
  visitor_count INT NOT NULL,
  visitor_name VARCHAR(80) NOT NULL,
  contact_phone VARCHAR(40) NOT NULL,
  contact_email VARCHAR(120) NULL,
  masked_id_number VARCHAR(40) NOT NULL,
  payment_method ENUM('free', 'alipay', 'wechat', 'unionpay') NOT NULL,
  payment_status ENUM('免费预约', '支付完成') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status ENUM('待出行', '已完成', '已取消') NOT NULL DEFAULT '待出行',
  qr_code_text VARCHAR(120) NOT NULL UNIQUE,
  cancellation_reason VARCHAR(255) NULL,
  refund_status ENUM('无需退款', '待处理', '退款中', '已退款') NOT NULL DEFAULT '无需退款',
  invoice_status ENUM('可申请', '开票中', '已开具') NOT NULL DEFAULT '可申请',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_spot
    FOREIGN KEY (scenic_spot_id) REFERENCES scenic_spots(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_order_slot
    FOREIGN KEY (slot_id) REFERENCES booking_slots(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_order_user
    FOREIGN KEY (user_id) REFERENCES user_accounts(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT chk_order_visitor_count CHECK (visitor_count BETWEEN 1 AND 6),
  CONSTRAINT chk_order_amount CHECK (amount >= 0),
  INDEX idx_order_status_date (status, created_at),
  INDEX idx_order_spot_slot (scenic_spot_id, slot_id)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id VARCHAR(80) PRIMARY KEY,
  actor VARCHAR(40) NOT NULL,
  role VARCHAR(20) NOT NULL,
  action VARCHAR(80) NOT NULL,
  target_table VARCHAR(60) NOT NULL,
  target_id VARCHAR(80) NOT NULL,
  detail VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_actor_time (actor, created_at),
  INDEX idx_audit_target (target_table, target_id)
) ENGINE=InnoDB;

CREATE VIEW vw_slot_availability AS
SELECT
  s.id AS slot_id,
  s.scenic_spot_id,
  p.name_zh AS scenic_spot_name,
  s.visit_date,
  s.time_range,
  s.capacity,
  s.base_booked,
  COALESCE(SUM(CASE WHEN o.status IN ('待出行', '已完成') THEN o.visitor_count ELSE 0 END), 0) AS order_booked,
  GREATEST(
    s.capacity
    - s.base_booked
    - COALESCE(SUM(CASE WHEN o.status IN ('待出行', '已完成') THEN o.visitor_count ELSE 0 END), 0),
    0
  ) AS remaining
FROM booking_slots s
JOIN scenic_spots p ON p.id = s.scenic_spot_id
LEFT JOIN booking_orders o ON o.slot_id = s.id
GROUP BY
  s.id,
  s.scenic_spot_id,
  p.name_zh,
  s.visit_date,
  s.time_range,
  s.capacity,
  s.base_booked;

INSERT INTO user_accounts
  (id, username, display_name, role, status, password_hash, phone_masked, created_at, last_login_at)
VALUES
  ('user-admin', 'admin', '景区运营管理员', '管理员', '启用', 'sha256-demo:8c6976e5b5410415', '138****2026', '2026-04-01 09:00:00', '2026-06-09 08:42:00'),
  ('user-operator', 'operator', '票务核销员', '管理员', '启用', 'sha256-demo:4c1029697ee358c2', '137****0616', '2026-04-08 14:20:00', '2026-06-08 17:10:00'),
  ('user-traveler', 'traveler', '普通游客账号', '普通用户', '启用', 'sha256-demo:ba3253876aed6bc2', '136****0909', '2026-04-16 19:32:00', '2026-06-01 12:05:00');

INSERT INTO scenic_spots
  (id, name_zh, name_en, area, category, description, address, opening_hours, tags, reservation_required, paid, featured)
VALUES
  ('west-lake', '西湖风景名胜区', 'West Lake', '西湖区', '湖山风景', '杭州最具代表性的湖山景观，适合慢行、游船和城市文化游。', '杭州市西湖区龙井路1号', '全天开放', JSON_ARRAY('世界遗产', '湖景', '经典'), TRUE, FALSE, TRUE),
  ('lingyin-feilaifeng', '灵隐飞来峰', 'Lingyin Feilai Feng', '西湖区', '寺院石刻', '集寺院、山林和石刻造像于一体的文化景区。', '杭州市西湖区法云弄1号', '07:00-18:00', JSON_ARRAY('寺院', '石刻', '山林'), TRUE, TRUE, TRUE),
  ('liangzhu-ancient-city', '良渚古城遗址公园', 'Liangzhu Ancient City', '余杭区', '遗址公园', '展示良渚文明城址、水利系统和玉文化的重要遗址。', '杭州市余杭区凤都路', '09:00-17:00', JSON_ARRAY('世界遗产', '考古', '亲子'), TRUE, TRUE, TRUE);

INSERT INTO ticket_types
  (id, scenic_spot_id, name, price, description, available_for)
VALUES
  ('west-lake-free', 'west-lake', '免费入园登记', 0, '西湖开放区域免费登记，用于生成出行凭证。', '所有游客'),
  ('lingyin-adult', 'lingyin-feilaifeng', '成人票', 45, '灵隐飞来峰景区成人票。', '18周岁以上游客'),
  ('liangzhu-adult', 'liangzhu-ancient-city', '成人票', 60, '良渚古城遗址公园成人票。', '18周岁以上游客');

INSERT INTO booking_slots
  (id, scenic_spot_id, visit_date, time_range, capacity, base_booked)
VALUES
  ('west-lake-20260616-am', 'west-lake', '2026-06-16', '08:30-10:30', 120, 32),
  ('lingyin-20260616-am', 'lingyin-feilaifeng', '2026-06-16', '09:00-11:00', 80, 22),
  ('liangzhu-20260616-pm', 'liangzhu-ancient-city', '2026-06-16', '14:00-16:00', 70, 18);

INSERT INTO booking_orders
  (id, scenic_spot_id, slot_id, user_id, ticket_name, visitor_count, visitor_name, contact_phone, contact_email, masked_id_number, payment_method, payment_status, amount, status, qr_code_text)
VALUES
  ('HZ-20260609-0001', 'west-lake', 'west-lake-20260616-am', 'user-traveler', '免费入园登记', 2, '李然', '13688002110', 'liran.family@example.com', '3301********0211', 'free', '免费预约', 0, '待出行', 'VERIFY-HZ-20260609-0001');

INSERT INTO audit_logs
  (id, actor, role, action, target_table, target_id, detail, created_at)
VALUES
  ('audit-20260609-001', 'admin', '管理员', '初始化数据', 'database', 'hangzhou_cultural_tourism', '创建课程设计数据库并写入种子数据。', '2026-06-09 08:42:00');
