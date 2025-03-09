package handlers

import (
	"encoding/json"
	"hradec/internal/domain"
	"hradec/internal/handlers/models"
	"hradec/internal/middleware"
	"hradec/internal/usecases"
	"net/http"
	"time"
)

type MeetupHandler struct {
	meetupUsecase *usecases.MeetupUsecase
}

func NewMeetupHandler(meetupUsecase *usecases.MeetupUsecase) *MeetupHandler {
	return &MeetupHandler{
		meetupUsecase: meetupUsecase,
	}
}

func (mh *MeetupHandler) CreateMeetup() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		user, ok := middleware.GetUser(ctx)
		if !ok {
			http.Error(w, "invalid token", http.StatusBadRequest)
			return
		}

		var input models.MeetupCreateReq
		err := json.NewDecoder(r.Body).Decode(&input)
		if err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		mappedInput, err := mapModelMeetupInputToDomainMeetupInput(input)
		if err != nil {
			http.Error(w, "error mapping meetup", http.StatusInternalServerError)
			return
		}

		meetup, err := mh.meetupUsecase.CreateMeetup(ctx, *mappedInput, user.ID)
		if err != nil {
			http.Error(w, "no meetup for u :(", http.StatusInternalServerError)
			return
		}

		modelMeetup := mapDomainMeetupToModelMeetup(meetup)

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(modelMeetup)
		if err != nil {
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
			return
		}
	}
}

func (mh *MeetupHandler) GetMeetups() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		user, ok := middleware.GetUser(ctx)
		if !ok {
			http.Error(w, "invalid token", http.StatusBadRequest)
			return
		}

		meetups, err := mh.meetupUsecase.GetMeetups(ctx, *user)
		if err != nil {
			http.Error(w, "nobody wants to meet up", http.StatusInternalServerError)
			return
		}

		modelMeetups := mapDomainMeetupsToModelMeetups(meetups)

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(modelMeetups)
		if err != nil {
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
			return
		}
	}
}

func (mh *MeetupHandler) AcceptMeetup() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		user, ok := middleware.GetUser(ctx)
		if !ok {
			http.Error(w, "error getting user", http.StatusBadRequest)
		}

		var input models.AcceptMeetupInput
		err := json.NewDecoder(r.Body).Decode(&input)
		if err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		err = mh.meetupUsecase.AcceptMeetup(ctx, *user, input.Id)
		if err != nil {
			http.Error(w, "error accepting meetup, nothing for u", http.StatusInternalServerError)
		}
	}
}

func mapModelMeetupInputToDomainMeetupInput(mtupInput models.MeetupCreateReq) (*domain.MeetupCreateReq, error) {
	dateLayout := "2006-01-02"
	timeLayout := "15:04:05"

	date, err := time.Parse(dateLayout, mtupInput.Date)
	if err != nil {
		return nil, err
	}
	beginTime, err := time.Parse(timeLayout, mtupInput.BeginTime)
	if err != nil {
		return nil, err
	}
	endTime, err := time.Parse(timeLayout, mtupInput.EndTime)
	if err != nil {
		return nil, err
	}

	return &domain.MeetupCreateReq{
		Name:                mtupInput.Name,
		Description:         mtupInput.Description,
		Type:                mtupInput.Type,
		Date:                date,
		BeginTime:           beginTime,
		EndTime:             endTime,
		Point:               domain.Pin(mtupInput.Point),
		Public:              mtupInput.Public,
		MinAge:              mtupInput.MinAge,
		MaxAge:              mtupInput.MaxAge,
		RequireVerification: mtupInput.RequireVerification,
		Users:               mtupInput.Users,
	}, nil
}

func mapDomainMeetupsToModelMeetups(mtups []*domain.Meetup) []*models.Meetup {
	var out []*models.Meetup

	for _, meetup := range mtups {
		out = append(out, mapDomainMeetupToModelMeetup(meetup))
	}

	return out
}

func mapDomainMeetupToModelMeetup(mtup *domain.Meetup) *models.Meetup {
	dateLayout := "2006-01-02"
	timeLayout := "15:04:05"

	return &models.Meetup{
		Id:                  mtup.ID,
		Name:                mtup.Name,
		Description:         mtup.Description,
		Type:                mtup.Type,
		Date:                mtup.Date.Format(dateLayout),
		BeginTime:           mtup.BeginTime.Format(timeLayout),
		EndTime:             mtup.EndTime.Format(timeLayout),
		Point:               models.Pin(mtup.Point),
		Public:              mtup.Public,
		MinAge:              mtup.MinAge,
		MaxAge:              mtup.MaxAge,
		RequireVerification: mtup.RequireVerification,
	}
}
