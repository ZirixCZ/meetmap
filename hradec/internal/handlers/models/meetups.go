package models

type MeetupCreateReq struct {
	Name                string  `json:"name"`
	Description         *string `json:"description"`
	Type                string  `json:"type"`
	Date                string  `json:"date"`
	BeginTime           string  `json:"begin_time"`
	EndTime             string  `json:"end_time"`
	Point               Pin     `json:"point"`
	Public              bool    `json:"public"`
	MinAge              int64   `json:"min_age"`
	MaxAge              int64   `json:"max_age"`
	RequireVerification bool    `json:"require_verification"`
	Users               []int64 `json:"users"`
}

type MeetupUser struct {
	User   User   `json:"user"`
	Status string `json:"status"`
}

type Meetup struct {
	Id                  int64   `json:"id"`
	Name                string  `json:"name"`
	Description         *string `json:"description"`
	Type                string  `json:"type"`
	Date                string  `json:"date"`
	BeginTime           string  `json:"begin_time"`
	EndTime             string  `json:"end_time"`
	Point               Pin     `json:"point"`
	Public              bool    `json:"public"`
	MinAge              int64   `json:"min_age"`
	MaxAge              int64   `json:"max_age"`
	RequireVerification bool    `json:"require_verification"`
}

type AcceptMeetupInput struct {
	Id int64 `json:"id"`
}
