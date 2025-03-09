package database

import (
	"context"
	"database/sql"
	"fmt"
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
		Email:             user.Email,
		DisplayName:       user.DisplayName,
		Username:          user.Username,
		PasswordHash:      user.Hash,
		ProfilePictureURL: user.ProfileImageUrl,
		Age:               int32(user.Age),
	}
	stmt := table.Users.INSERT(
		table.Users.Email,
		table.Users.DisplayName,
		table.Users.Username,
		table.Users.PasswordHash,
		table.Users.ProfilePictureURL,
		table.Users.Age).
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

type UserRelationships struct {
	model.Users
	model.Fiendships
}

func (uds *UserDatabaseStore) GetUsersByUsernamePattern(ctx context.Context, usernamePattern string, callingUser domain.User) ([]domain.Relationship, error) {
	searchPattern := usernamePattern + "%"
	stmt := postgres.SELECT(
		table.Users.ID,
		table.Users.DisplayName,
		table.Users.Email,
		table.Users.Username,
		table.Users.ProfilePictureURL,
		table.Users.Age,
		table.Users.AgeVerified,
		table.Fiendships.Status,
	).FROM(table.Users.LEFT_JOIN(table.Fiendships, table.Users.ID.EQ(table.Fiendships.ToUser).AND(table.Fiendships.FromUser.EQ(postgres.Int(callingUser.ID))))).
		WHERE(table.Users.Username.LIKE(postgres.String(searchPattern)))

	// stmt := table.Users.SELECT(
	// 	table.Users.ID,
	// 	table.Users.DisplayName,
	// 	table.Users.Email,
	// 	table.Users.Username,
	// 	table.Users.ProfilePictureURL,
	// 	).WHERE(
	// 		table.Users.Username.LIKE(postgres.String(searchPattern)),
	// )

	dest := []UserRelationships{}
	err := stmt.QueryContext(ctx, uds.DB, &dest)
	if err != nil {
		return nil, err
	}

	result := []domain.Relationship{}
	for _, usr := range dest {
		if usr.Status == "" {
			usr.Status = "NONE"
		}
		usr := mapUserWithStatusFromDB(usr)
		result = append(result, usr)
	}
	return result, nil
}

func (udbs *UserDatabaseStore) AddFriend(ctx context.Context, from, to int64) error {
	friendshipModel := model.Fiendships{
		FromUser: int32(from),
		ToUser:   int32(to),
	}

	stmt := table.Fiendships.INSERT(
		table.Fiendships.FromUser,
		table.Fiendships.ToUser,
	).MODEL(friendshipModel)

	_, err := stmt.ExecContext(ctx, udbs.DB)
	if err != nil {
		return err
	}

	return nil
}

func (udbs *UserDatabaseStore) GetFriendRequests(ctx context.Context, userId int64) ([]domain.User, error) {
	stmt := postgres.SELECT(table.Users.AllColumns).
		FROM(table.Fiendships.INNER_JOIN(table.Users, table.Users.ID.EQ(table.Fiendships.FromUser))).
		WHERE(table.Fiendships.ToUser.EQ(postgres.Int(userId)).AND(table.Fiendships.Status.EQ(postgres.String("PENDING"))))

	dest := []model.Users{}
	err := stmt.QueryContext(ctx, udbs.DB, &dest)
	if err != nil {
		return nil, err
	}

	out, err := mapUsersFromDB(dest)
	if err != nil {
		return nil, err
	}

	return out, nil
}

func (udbs *UserDatabaseStore) ChangeFriendship(ctx context.Context, from, to int64, status string) error {
	stmt := table.Fiendships.UPDATE(table.Fiendships.Status).
		SET(postgres.String(status)).
		WHERE(table.Fiendships.FromUser.EQ(postgres.Int(to)).AND(table.Fiendships.ToUser.EQ(postgres.Int(from)).AND(table.Fiendships.Status.EQ(postgres.String("PENDING")))))

	fmt.Println(stmt.DebugSql())

	_, err := stmt.ExecContext(ctx, udbs.DB)
	if err != nil {
		return err
	}

	return nil
}

func (udbs *UserDatabaseStore) GetFriends(ctx context.Context, userId int64) ([]domain.User, error) {
	stmt := postgres.SELECT(table.Users.AllColumns).
		FROM(table.Fiendships.INNER_JOIN(table.Users,
			postgres.OR(
				table.Fiendships.FromUser.EQ(table.Users.ID).AND(table.Fiendships.ToUser.EQ(postgres.Int(userId))),
				table.Fiendships.ToUser.EQ(table.Users.ID).AND(table.Fiendships.FromUser.EQ(postgres.Int(userId))),
			).AND(table.Fiendships.Status.EQ(postgres.String("ACCEPTED")))))

	dest := []model.Users{}
	err := stmt.QueryContext(ctx, udbs.DB, &dest)
	if err != nil {
		return nil, err
	}

	out, err := mapUsersFromDB(dest)
	if err != nil {
		return nil, err
	}

	return out, nil
}

// type userInvites struct {
// 	model.Users
// 	model.Meetups
// 	model.UserMeetups
// }

// func (udbs *UserDatabaseStore) GetInvites(ctx context.Context, userId int64) error {
// 	stmt := table.UserMeetups.SELECT(table.UserMeetups.AllColumns, table.Meetups.AllColumns, table.Users.AllColumns).
// 		FROM(
// 			table.UserMeetups.LEFT_JOIN(
// 				table.Meetups,
// 				table.Meetups.ID.EQ(table.UserMeetups.MeetupID),
// 			).LEFT_JOIN(
// 				table.Users,
// 				table.Users.ID.EQ(table.Meetups.UserID),
// 			),
// 		).WHERE(table.UserMeetups.UserID.EQ(postgres.Int(userId)))

// 	dest := []userInvites{}

// 	err := stmt.QueryContext(ctx, udbs.DB, &dest)
// 	if err != nil {
// 		return err
// 	}

// 	return nil
// }

func mapUserWithStatusFromDB(usr UserRelationships) domain.Relationship {
	return domain.Relationship{
		User: domain.User{
			ID:              int64(usr.ID),
			Username:        usr.Username,
			DisplayName:     usr.DisplayName,
			Email:           usr.Email,
			HashedPassword:  usr.PasswordHash,
			ProfileImageUrl: usr.ProfilePictureURL,
			Age:             int64(usr.Age),
			AgeVerified:     usr.AgeVerified,
		},
		Status: usr.Status,
	}
}

func mapUserFromDB(usr model.Users) (*domain.User, error) {
	return &domain.User{
		ID:              int64(usr.ID),
		Username:        usr.Username,
		DisplayName:     usr.DisplayName,
		Email:           usr.Email,
		HashedPassword:  usr.PasswordHash,
		ProfileImageUrl: usr.ProfilePictureURL,
		Age:             int64(usr.Age),
		AgeVerified:     usr.AgeVerified,
	}, nil
}

func mapUsersFromDB(usrs []model.Users) ([]domain.User, error) {
	var out []domain.User

	for _, usr := range usrs {
		mapped, err := mapUserFromDB(usr)
		if err != nil {
			return nil, err
		}
		out = append(out, *mapped)
	}

	return out, nil
}
