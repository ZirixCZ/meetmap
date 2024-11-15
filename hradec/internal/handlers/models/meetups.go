package models

type MeetupCreateReq struct {
	Name    string  `json:"name"`
	UserIds []int64 `json:"user_ids"`
	PlaceId string  `json:"place_id"`
	Time    int64   `json:"time"`
}

type MeetupUser struct {
	User   User   `json:"user"`
	Status string `json:"status"`
}

type Meetup struct {
	Name  string     `json:"name"`
	Users MeetupUser `json:"users"`
	Place Place      `json:"place"`
	Time  int64      `json:"time"`
}
