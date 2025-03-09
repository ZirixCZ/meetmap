package models

type UserData struct {
	Username        string  `json:"username"`
	Email           string  `json:"email"`
	DisplayName     string  `json:"display_name"`
	Password        string  `json:"password"`
	ProfileImageUrl *string `json:"profile_image_url"`
	Age             int64   `json:"age"`
}

type User struct {
	ID              int64   `json:"id"`
	DisplayName     string  `json:"display_name"`
	Email           string  `json:"email"`
	Username        string  `json:"username"`
	ProfileImageUrl *string `json:"profile_image_url"`
	Age             int64   `json:"age"`
	AgeVerified     bool    `json:"age_verified"`
}

type Relationship struct {
	User         User   `json:"user"`
	Relationship string `json:"relationship"`
}

type LoginCreds struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResp struct {
	Token string `json:"token"`
}

type RelationshipUser struct {
	ID int64 `json:"id"`
}
