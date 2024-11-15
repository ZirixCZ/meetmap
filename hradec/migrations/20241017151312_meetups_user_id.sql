-- +goose Up
-- +goose StatementBegin
ALTER TABLE meetups ADD COLUMN user_id INT NOT NULL;
ALTER TABLE meetups ADD FOREIGN KEY (user_id) REFERENCES users(id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
