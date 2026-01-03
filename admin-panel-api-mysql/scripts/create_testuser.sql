-- 1. Створюємо користувача в таблиці User
INSERT INTO User (login, email, password_hash, account_status, created_at)
VALUES ('test_deletion2', 'delete_me2@example.com', 'dummy_hash_123', 'active', NOW());

-- Зберігаємо ID нового юзера у змінну, щоб використати далі
SET @new_user_id = LAST_INSERT_ID();

-- 2. Створюємо профіль для нього (Table Profile)
INSERT INTO Profile (user_id, first_name, birth_date, city, country, gender, bio_text, bio_status)
VALUES (@new_user_id, 'Тестовий Користувач', '1999-12-31', 'Київ', 'Україна', 'Чоловік', 'Цей профіль створено спеціально для тестування функції видалення (Soft Delete).', 'approved');

-- 3. Додаємо фото (Table User_Photo), щоб перевірити, чи воно видалиться
INSERT INTO User_Photo (user_id, photo_url, is_main, moderation_status)
VALUES (@new_user_id, 'https://via.placeholder.com/150', 1, 'approved');

-- 4. Додаємо повідомлення від цього юзера (Table Message), щоб перевірити анонімізацію тексту
-- (Припускаємо, що recipient_user_id=1 існує, якщо ні - заміни на існуючий ID)
INSERT INTO Message (sender_user_id, recipient_user_id, message_text, sent_at)
VALUES (@new_user_id, 1, 'Привіт! Це повідомлення має бути замінено на заглушку після видалення.', NOW());

-- 5. (Опціонально) Створюємо скаргу НА цього юзера (Table Complaint)
-- Щоб перевірити, чи закриється вона автоматично (якщо ти додав таку логіку)
INSERT INTO Complaint (reporter_user_id, target_user_id, complaint_type_id, description, status)
VALUES (1, @new_user_id, 1, 'Скаржусь на тестового юзера', 'new');

-- Виводимо ID створеного юзера, щоб ти знав, кого шукати
SELECT @new_user_id as Created_User_ID;