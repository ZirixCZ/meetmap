package usecases

import (
	"context"
	"hradec/internal/domain"
	"hradec/internal/ports"

	"github.com/pkg/errors"
)

type MeetupUsecase struct {
	meetupStore ports.MeetupDatabaseStore
}

func NewMeetupUsecase(meetupStore ports.MeetupDatabaseStore) *MeetupUsecase {
	return &MeetupUsecase{
		meetupStore: meetupStore,
	}
}

func (mu *MeetupUsecase) CreateMeetup(ctx context.Context, input domain.MeetupCreateReq, userId int64) (*domain.Meetup, error) {
	return mu.meetupStore.CreateMeetup(ctx, input, userId)
}

func (mu *MeetupUsecase) GetMeetups(ctx context.Context, user domain.User) ([]*domain.Meetup, error) {
	return mu.meetupStore.GetMeetups(ctx, user)
}

func (mu *MeetupUsecase) AcceptMeetup(ctx context.Context, user domain.User, meetupId int64) error {
	// check if a valid meetup is found
	meetups, err := mu.GetMeetups(ctx, user)
	if err != nil {
		return err
	}

	for _, meetup := range meetups {
		if meetup.ID == meetupId {
			return mu.meetupStore.AcceptMeetup(ctx, user.ID, meetupId)
		}
	}

	return errors.New("couldnt find a valid meetup")
}
