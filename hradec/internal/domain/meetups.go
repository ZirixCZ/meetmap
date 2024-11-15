package domain

import "time"

type MeetupCreateReq struct {
	Name    string
	UserIds []int64
	PlaceId string
	Time    time.Time
}

type MeetupUser struct {
	User   User
	Status string
}

type Meetup struct {
	Name  string
	Users MeetupUser
	Place Place
	Time  int64
}
