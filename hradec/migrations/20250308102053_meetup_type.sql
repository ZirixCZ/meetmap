-- +goose Up
-- +goose StatementBegin
ALTER TABLE meetups 
ADD IF NOT EXISTS type VARCHAR(255) NOT NULL DEFAULT 'OTHER';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
