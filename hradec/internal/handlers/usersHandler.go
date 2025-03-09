package handlers

import (
	"encoding/json"
	"hradec/internal/domain"
	"hradec/internal/handlers/models"
	"hradec/internal/middleware"
	"hradec/internal/usecases"
	"net/http"

	"go.uber.org/zap"
)

type UserHandler struct {
	userUsecase *usecases.UserUsecase
	authUsecase *usecases.AuthUsecase
}

func NewUserHandler(userusecase *usecases.UserUsecase, authUsecase *usecases.AuthUsecase) *UserHandler {
	return &UserHandler{
		userUsecase: userusecase,
		authUsecase: authUsecase,
	}
}

func (uu *UserHandler) CreateUser() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		// Decode the JSON body to the `Viewport` struct
		var userData models.UserData
		err := json.NewDecoder(r.Body).Decode(&userData)
		if err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}
		zap.L().Info("userData", zap.Any("userData", userData))

		defer r.Body.Close()

		usr, err := uu.userUsecase.CreateUser(ctx, mapModelUserDataToDomainUserData(userData), userData.Password)
		if err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}
		zap.L().Info("HIT", zap.Any("places", usr))
		// Convert the result to JSON and write to the response
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(mapDomainUserToModelUser(*usr))
		if err != nil {
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
		}

	}
}

func (uu *UserHandler) Login() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		// Decode the JSON body to the `Viewport` struct
		var creds models.LoginCreds
		err := json.NewDecoder(r.Body).Decode(&creds)
		if err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}
		zap.L().Info("userData", zap.Any("userData", creds))

		defer r.Body.Close()

		usr, err := uu.authUsecase.Login(ctx, mapModelUserCreds(creds))
		if err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}
		zap.L().Info("HIT", zap.Any("places", usr))
		// Convert the result to JSON and write to the response
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(models.LoginResp{
			Token: usr,
		})
		if err != nil {
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
		}

	}
}

func (uu *UserHandler) GetUsersByUsernamePattern() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		usernamePattern := r.URL.Query().Get("username")
		if usernamePattern == "" {
			http.Error(w, "username pattern is required", http.StatusBadRequest)
			return
		}

		user, ok := middleware.GetUser(ctx)
		if !ok {
			http.Error(w, "invalid user token or user not found lol", http.StatusBadRequest)
			return
		}

		// Call the usecase to get users by username pattern
		users, err := uu.userUsecase.GetByUsernameSimilar(ctx, usernamePattern, *user)
		if err != nil {
			http.Error(w, "failed to get users", http.StatusInternalServerError)
			return
		}

		// Map domain users to model users
		modelUsers := make([]models.Relationship, len(users))
		for i, u := range users {
			modelUsers[i] = mapDomainRelationshipToModelRelationship(u)
		}

		// Convert the result to JSON and write to the response
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(modelUsers)
		if err != nil {
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
		}
	}
}

func (uu *UserHandler) GetUserInfo() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		user, ok := middleware.GetUser(ctx)
		if !ok {
			http.Error(w, "invalid user token or user not found idk", http.StatusBadRequest)
			return
		}

		// Map domain users to model users
		modelUser := mapDomainUserToModelUser(*user)

		// Convert the result to JSON and write to the response
		w.Header().Set("Content-Type", "application/json")
		err := json.NewEncoder(w).Encode(modelUser)
		if err != nil {
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
		}
	}
}

func (uu *UserHandler) AddFriend() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		user, ok := middleware.GetUser(ctx)
		if !ok {
			http.Error(w, "invalid token", http.StatusBadRequest)
			return
		}

		var input models.RelationshipUser
		err := json.NewDecoder(r.Body).Decode(&input)
		if err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		if user.ID == input.ID {
			http.Error(w, "you cannot make yourself a friend, sorry, find more real friends", http.StatusBadRequest)
			return
		}

		err = uu.userUsecase.AddFriend(ctx, user.ID, input.ID)
		if err != nil {
			http.Error(w, "friendship error", http.StatusInternalServerError)
			return
		}
	}
}

type UserIdk struct {
	User models.User `json:"user"`
}

func (uu *UserHandler) GetFriendRequests() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		user, ok := middleware.GetUser(ctx)
		if !ok {
			http.Error(w, "invalid token", http.StatusBadRequest)
			return
		}

		users, err := uu.userUsecase.GetFriendRequests(ctx, user.ID)
		if err != nil {
			http.Error(w, "friend requests error", http.StatusInternalServerError)
			return
		}

		modelUsers := mapDomainUsersToUsersIdk(users)

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(modelUsers)
		if err != nil {
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
		}
	}
}

func (uu *UserHandler) AcceptFriend() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		user, ok := middleware.GetUser(ctx)
		if !ok {
			http.Error(w, "invalid token", http.StatusBadRequest)
			return
		}

		var input models.RelationshipUser
		err := json.NewDecoder(r.Body).Decode(&input)
		if err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		err = uu.userUsecase.ChangeFriendship(ctx, user.ID, input.ID, "ACCEPTED")
		if err != nil {
			http.Error(w, "error changin friendship", http.StatusInternalServerError)
			return
		}
	}
}

func (uu *UserHandler) DeclineFriend() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		user, ok := middleware.GetUser(ctx)
		if !ok {
			http.Error(w, "invalid token", http.StatusBadRequest)
			return
		}

		var input models.RelationshipUser
		err := json.NewDecoder(r.Body).Decode(&input)
		if err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		err = uu.userUsecase.ChangeFriendship(ctx, user.ID, input.ID, "DECLINED")
		if err != nil {
			http.Error(w, "error changin friendship", http.StatusInternalServerError)
			return
		}
	}
}

func (uu *UserHandler) GetFriends() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		user, ok := middleware.GetUser(ctx)
		if !ok {
			http.Error(w, "invalid token", http.StatusBadRequest)
			return
		}

		friends, err := uu.userUsecase.GetFriends(ctx, user.ID)
		if err != nil {
			http.Error(w, "you got no friends lol", http.StatusInternalServerError)
			return
		}

		modelUsers := mapDomainUsersToUsersIdk(friends)

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(modelUsers)
		if err != nil {
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
		}
	}
}

func mapModelUserCreds(usr models.LoginCreds) domain.LoginCreds {
	return domain.LoginCreds{
		Email:    usr.Email,
		Password: usr.Password,
	}
}

func mapModelUserDataToDomainUserData(usr models.UserData) domain.UserData {
	return domain.UserData{
		Username:        usr.Username,
		Email:           usr.Email,
		DisplayName:     usr.DisplayName,
		ProfileImageUrl: usr.ProfileImageUrl,
		Age:             usr.Age,
	}
}

func mapDomainRelationshipToModelRelationship(rltnshp domain.Relationship) models.Relationship {
	return models.Relationship{
		User:         mapDomainUserToModelUser(rltnshp.User),
		Relationship: rltnshp.Status,
	}
}

func mapDomainUsersToUsersIdk(usrs []domain.User) []UserIdk {
	var out []UserIdk

	for _, usr := range usrs {
		out = append(out, mapDomainUserToUserIdk(usr))
	}

	return out
}

func mapDomainUserToUserIdk(usr domain.User) UserIdk {
	return UserIdk{
		User: mapDomainUserToModelUser(usr),
	}
}

func mapDomainUserToModelUser(usr domain.User) models.User {
	return models.User{
		ID:              usr.ID,
		DisplayName:     usr.DisplayName,
		Email:           usr.Email,
		Username:        usr.Username,
		ProfileImageUrl: usr.ProfileImageUrl,
		Age:             usr.Age,
		AgeVerified:     usr.AgeVerified,
	}
}
