package database

import (
	"context"
	"database/sql"
	"errors"
	"hradec/internal/domain"
	"hradec/internal/ports/database/gen/hradec/public/model"
	"hradec/internal/ports/database/gen/hradec/public/table"
	// "github.com/go-jet/jet/v2/postgres"
)

type MeetupDatabaseStore struct {
	db *sql.DB
}

func NewMeetupDatabaseStore(db *sql.DB) *MeetupDatabaseStore {
	return &MeetupDatabaseStore{
		db: db,
	}
}

func (mdbs *MeetupDatabaseStore) CreateMeetup(ctx context.Context, meetup domain.MeetupCreateReq) error {
	insertModel := model.Meetups{
		PlaceID: meetup.PlaceId,
		Name:    meetup.Name,
		Time:    meetup.Time,
	}
	stmt := table.Meetups.INSERT(
		table.Meetups.Name,
		table.Meetups.PlaceID,
		table.Meetups.Time,
	).MODEL(insertModel).RETURNING(table.Meetups.AllColumns)

	dest := []model.Meetups{}
	err := stmt.QueryContext(ctx, mdbs.db, &dest)
	if err != nil {
		return err
	}
	if len(dest) == 0 {
		return errors.New("FUKCKCKCKCKCKCK ERROR INSERTING MEETUP")
	}
	meetupID := dest[0].ID
	insertModels := []model.UserMeetups{}
	for _, id := range meetup.UserIds {
		insertModels = append(insertModels, model.UserMeetups{
			UserID:   int32(id),
			MeetupID: meetupID,
			State:    "PENDING",
		})
	}
	stmt = table.UserMeetups.INSERT(table.UserMeetups.AllColumns).MODELS(insertModels)
	_, err = stmt.ExecContext(ctx, mdbs.db)
	if err != nil {
		return err
	}
	return nil
}
