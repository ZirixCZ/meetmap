package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"hradec/internal/domain"
	"hradec/internal/ports/database/gen/hradec/public/model"
	"hradec/internal/ports/database/gen/hradec/public/table"

	"github.com/go-jet/jet/v2/postgres"
)

type MeetupDatabaseStore struct {
	db *sql.DB
}

func NewMeetupDatabaseStore(db *sql.DB) *MeetupDatabaseStore {
	return &MeetupDatabaseStore{
		db: db,
	}
}

func (mdbs *MeetupDatabaseStore) CreateMeetup(ctx context.Context, input domain.MeetupCreateReq, createdBy int64) (*domain.Meetup, error) {
	tx, err := mdbs.db.Begin()
	if err != nil {
		return nil, err
	}

	data := model.Meetups{
		Name:        input.Name,
		Description: input.Description,
		Type:        input.Type,
		Date:        input.Date,
		BeginTime:   input.BeginTime,
		EndTime:     input.EndTime,
		Lat:         &input.Point.Lat,
		Lon:         &input.Point.Lon,
		// Public:              input.Public,
		Public:              true,
		MinAge:              int32(input.MinAge),
		MaxAge:              int32(input.MaxAge),
		RequireVerification: input.RequireVerification,
		CreatedBy:           int32(createdBy),
	}

	stmt := table.Meetups.INSERT(
		table.Meetups.Name,
		table.Meetups.Description,
		table.Meetups.Type,
		table.Meetups.Date,
		table.Meetups.BeginTime,
		table.Meetups.EndTime,
		table.Meetups.Lat,
		table.Meetups.Lon,
		table.Meetups.Public,
		table.Meetups.MinAge,
		table.Meetups.MaxAge,
		table.Meetups.RequireVerification,
		table.Meetups.CreatedBy,
	).MODEL(data).RETURNING(table.Meetups.AllColumns)

	dest := []model.Meetups{}
	err = stmt.QueryContext(ctx, tx, &dest)
	if err != nil {
		return nil, err
	}
	if len(dest) == 0 {
		return nil, errors.New("no meetup for u")
	}

	var userData []model.UserMeetups
	for _, user := range input.Users {
		userData = append(userData, model.UserMeetups{
			UserID:   int32(user),
			MeetupID: dest[0].ID,
			State:    "PENDING",
		})
	}

	if len(userData) > 0 {
		usersStmt := table.UserMeetups.INSERT(
			table.UserMeetups.MeetupID,
			table.UserMeetups.UserID,
			table.UserMeetups.State,
		).MODELS(userData)

		_, err = usersStmt.ExecContext(ctx, tx)
		if err != nil {
			return nil, err
		}
	}

	tx.Commit()

	return mapMeetupFromDB(dest[0]), nil
}

func (mdbs *MeetupDatabaseStore) GetMeetups(ctx context.Context, user domain.User) ([]*domain.Meetup, error) {
	stmt := postgres.SELECT(
		table.Meetups.AllColumns,
	).FROM(table.Meetups.LEFT_JOIN(table.UserMeetups, table.UserMeetups.MeetupID.EQ(table.Meetups.ID))).WHERE(postgres.OR(
		table.Meetups.CreatedBy.EQ(postgres.Int(user.ID)),
		table.Meetups.Public.EQ(postgres.Bool(true)).AND(
			postgres.Int(user.Age).BETWEEN(table.Meetups.MinAge, table.Meetups.MaxAge).AND(
				postgres.OR(
					postgres.Bool(user.AgeVerified),
					postgres.NOT(table.Meetups.RequireVerification),
				),
			),
		),
		table.Meetups.Public.EQ(postgres.Bool(false)).AND(table.UserMeetups.UserID.EQ(postgres.Int(user.ID))),
	)).GROUP_BY(table.Meetups.ID)

	fmt.Println(stmt.DebugSql())

	dest := []model.Meetups{}
	err := stmt.QueryContext(ctx, mdbs.db, &dest)
	if err != nil {
		return nil, err
	}

	return mapMeetupsFromDB(dest), nil
}

func (mdbs *MeetupDatabaseStore) AcceptMeetup(ctx context.Context, userId, meetupId int64) error {
	stmt := table.UserMeetups.UPDATE(table.UserMeetups.State).
		SET(postgres.String("ACCEPTED")).
		WHERE(table.UserMeetups.MeetupID.EQ(postgres.Int(meetupId)).AND(table.UserMeetups.UserID.EQ(postgres.Int(userId))))

	_, err := stmt.ExecContext(ctx, mdbs.db)
	if err != nil {
		return err
	}

	return nil
}

func mapMeetupsFromDB(meetups []model.Meetups) []*domain.Meetup {
	var out []*domain.Meetup

	for _, meetup := range meetups {
		out = append(out, mapMeetupFromDB(meetup))
	}

	return out
}

func mapMeetupFromDB(meetup model.Meetups) *domain.Meetup {
	pin := domain.Pin{
		Lat: *meetup.Lat,
		Lon: *meetup.Lon,
	}

	return &domain.Meetup{
		ID:                  int64(meetup.ID),
		Name:                meetup.Name,
		Description:         meetup.Description,
		Type:                meetup.Type,
		Date:                meetup.Date,
		BeginTime:           meetup.BeginTime,
		EndTime:             meetup.EndTime,
		Point:               pin,
		Public:              meetup.Public,
		MinAge:              int64(meetup.MinAge),
		MaxAge:              int64(meetup.MaxAge),
		RequireVerification: meetup.RequireVerification,
	}
}
