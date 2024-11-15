package database

import (
	"context"
	"database/sql"
	"hradec/internal/domain"
	"hradec/internal/ports/database/gen/hradec/public/model"
	"hradec/internal/ports/database/gen/hradec/public/table"

	"github.com/go-jet/jet/v2/postgres"
)

func NewUserDatabaseStore(db *sql.DB) *UserDatabaseStore {
	return &UserDatabaseStore{
		DB: db,
	}
}

type UserDatabaseStore struct {
	DB *sql.DB
}

type userWithExtraData struct {
	model.Users
	RoleName  string
	GroupName string
}

// tests: OK
func (udbs *UserDatabaseStore) CreateUser(ctx context.Context, user domain.UserData, skipValidation bool) (*domain.User, error) {
	usrModel := model.Users{
		Email:        user.Email,
		DisplayName:  user.DisplayName,
		Username:     user.Username,
		PasswordHash: user.Hash,
	}
	stmt := table.Users.INSERT(
		table.Users.Email,
		table.Users.Username,
		table.Users.PasswordHash,
		table.Users.DisplayName).
		MODEL(usrModel).
		RETURNING(
			table.Users.AllColumns,
		)
	dest := []model.Users{}
	err := stmt.QueryContext(ctx, udbs.DB, &dest)
	if err != nil {
		return nil, err
	}
	return mapUserFromDB(dest[0])
}

// tests: OK
func (udbs *UserDatabaseStore) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	dest := []model.Users{}
	stmt := table.Users.SELECT(
		table.Users.AllColumns,
	).WHERE(table.Users.Email.EQ(postgres.String(email)))
	err := stmt.QueryContext(ctx, udbs.DB, &dest)
	if err != nil {
		return nil, err
	}
	if len(dest) == 0 {
		return nil, domain.UserNotFound
	}
	return mapUserFromDB(dest[0])
}

// tests: OK
func (udbs *UserDatabaseStore) GetUserById(ctx context.Context, id int64) (*domain.User, error) {
	dest := []model.Users{}
	stmt := table.Users.SELECT(
		table.Users.AllColumns,
	).WHERE(table.Users.ID.EQ(postgres.Int(id)))
	err := stmt.QueryContext(ctx, udbs.DB, &dest)
	if err != nil {
		return nil, err
	}
	if len(dest) == 0 {
		return nil, domain.UserNotFound
	}
	return mapUserFromDB(dest[0])
}

func (uds *UserDatabaseStore) GetUsersByUsernamePattern(ctx context.Context, usernamePattern string) ([]domain.User, error) {
	searchPattern := usernamePattern + "%"
	stmt := table.Users.SELECT(
		table.Users.ID,
		table.Users.DisplayName,
		table.Users.Email,
		table.Users.Username,
	).WHERE(
		table.Users.Username.LIKE(postgres.String(searchPattern)),
	)

	dest := []model.Users{}
	err := stmt.QueryContext(ctx, uds.DB, &dest)
	if err != nil {
		return nil, err
	}

	result := []domain.User{}
	for _, usr := range dest {
		usr, err := mapUserFromDB(usr)
		if err != nil {
			return nil, err
		}
		result = append(result, *usr)
	}
	return result, nil
}

type userInvites struct {
	model.Users
	model.Meetups
	model.UserMeetups
}

func (udbs *UserDatabaseStore) GetInvites(ctx context.Context, userId int64) error {
	stmt := table.UserMeetups.SELECT(table.UserMeetups.AllColumns, table.Meetups.AllColumns, table.Users.AllColumns).
		FROM(
			table.UserMeetups.LEFT_JOIN(
				table.Meetups,
				table.Meetups.ID.EQ(table.UserMeetups.MeetupID),
			).LEFT_JOIN(
				table.Users,
				table.Users.ID.EQ(table.Meetups.UserID),
			),
		).WHERE(table.UserMeetups.UserID.EQ(postgres.Int(userId)))

	dest := []userInvites{}

	err := stmt.QueryContext(ctx, udbs.DB, &dest)
	if err != nil {
		return err
	}

	return nil
}

func mapUserFromDB(usr model.Users) (*domain.User, error) {
	return &domain.User{
		ID:             int64(usr.ID),
		Username:       usr.Username,
		DisplayName:    usr.DisplayName,
		Email:          usr.Email,
		HashedPassword: usr.PasswordHash,
	}, nil
}
