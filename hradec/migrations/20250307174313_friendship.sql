-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS fiendships (
    from_user INT NOT NULL,
    to_user INT NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'PENDING',

    PRIMARY KEY (from_user, to_user),

    CONSTRAINT fk_from_user_user_id
    FOREIGN KEY (from_user)
    REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    CONSTRAINT fk_to_user_user_id
    FOREIGN KEY (to_user)
    REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
