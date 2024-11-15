-- +goose Up
-- +goose StatementBegin
CREATE SEQUENCE meetups_id_seq
START WITH 40000
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

CREATE TABLE IF NOT EXISTS meetups (
    id INT NOT NULL PRIMARY KEY DEFAULT nextval('meetups_id_seq'),
    place_id varchar(64) NOT NULL,
    time TIMESTAMP NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (place_id) REFERENCES places(id)
);

CREATE TABLE IF NOT EXISTS user_meetups (
    user_id INT NOT NULL,
    meetup_id INT NOT NULL,
    state VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, meetup_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (meetup_id) REFERENCES meetups(id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
