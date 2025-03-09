package domain

type UserData struct {
	Username        string
	Email           string
	DisplayName     string
	Hash            string
	ProfileImageUrl *string
	Age             int64
}

type User struct {
	ID              int64
	DisplayName     string
	Email           string
	Username        string
	HashedPassword  string
	ProfileImageUrl *string
	Age             int64
	AgeVerified     bool
}

type LoginCreds struct {
	Email    string
	Password string
}

type Relationship struct {
	User   User
	Status string
}
