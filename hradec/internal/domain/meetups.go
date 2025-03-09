package domain

import "time"

type MeetupCreateReq struct {
	Name                string
	Description         *string
	Type                string
	Date                time.Time
	BeginTime           time.Time
	EndTime             time.Time
	Point               Pin
	Public              bool
	MinAge              int64
	MaxAge              int64
	RequireVerification bool
	Users               []int64
}

type MeetupUser struct {
	User   User
	Status string
}

type Meetup struct {
	ID                  int64
	Name                string
	Description         *string
	Type                string
	Date                time.Time
	BeginTime           time.Time
	EndTime             time.Time
	Point               Pin
	Public              bool
	MinAge              int64
	MaxAge              int64
	RequireVerification bool
}
