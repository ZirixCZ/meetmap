package ports

import (
	"context"
	"hradec/internal/domain"
)

type PlaceDatabaseStore interface {
	GetPlacesByViewport(ctx context.Context, viewPort domain.Viewport) ([]domain.Place, error)
}

type MeetupDatabaseStore interface {
	CreateMeetup(ctx context.Context, input domain.MeetupCreateReq, createdBy int64) (*domain.Meetup, error)
	GetMeetups(ctx context.Context, user domain.User) ([]*domain.Meetup, error)
	AcceptMeetup(ctx context.Context, userId, meetupId int64) error
}

type UserDatabaseStore interface {
	CreateUser(ctx context.Context, user domain.UserData, skipValidation bool) (*domain.User, error)
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	GetUserById(ctx context.Context, id int64) (*domain.User, error)
	GetUsersByUsernamePattern(ctx context.Context, usernamePattern string, callingUser domain.User) ([]domain.Relationship, error)
	AddFriend(ctx context.Context, from, to int64) error
	GetFriendRequests(ctx context.Context, userId int64) ([]domain.User, error)
	ChangeFriendship(ctx context.Context, from, to int64, status string) error
	GetFriends(ctx context.Context, userId int64) ([]domain.User, error)
}

type TokenGeneratorAuthInterface interface {
	CreateUserJWT(ctx context.Context, usr domain.User) (string, error)
	ValidateUserJWT(ctx context.Context, token string) (int64, error)
}

type AuthUsecaseInterface interface {
	Login(ctx context.Context, creds domain.LoginCreds) (string, error)
	Authenticate(ctx context.Context, token string) (*domain.User, error)
}
