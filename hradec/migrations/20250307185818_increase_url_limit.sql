-- +goose Up
-- +goose StatementBegin
ALTER TABLE users
ALTER COLUMN profile_picture_url
SET DATA TYPE VARCHAR(4096)
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
