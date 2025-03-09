-- +goose Up
-- +goose StatementBegin
ALTER TABLE meetups
ADD IF NOT EXISTS created_by INT NOT NULL,

ADD CONSTRAINT fk_meetups_created_by
FOREIGN KEY (created_by)
REFERENCES users (id)
ON DELETE CASCADE
ON UPDATE CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
