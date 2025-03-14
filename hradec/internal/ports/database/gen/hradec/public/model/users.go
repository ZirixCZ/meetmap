//
// Code generated by go-jet DO NOT EDIT.
//
// WARNING: Changes to this file may cause incorrect behavior
// and will be lost if the code is regenerated
//

package model

import (
	"time"
)

type Users struct {
	ID                int32 `sql:"primary_key"`
	PasswordHash      string
	Username          string
	ProfilePictureURL *string
	DisplayName       string
	CreatedAt         time.Time
	UpdatedAt         time.Time
	Email             string
	Age               int32
	AgeVerified       bool
}
