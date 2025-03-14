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

type Meetups struct {
	ID                  int32 `sql:"primary_key"`
	Name                string
	Description         *string
	Date                time.Time
	BeginTime           time.Time
	EndTime             time.Time
	Point               *string
	Lat                 *float64
	Lon                 *float64
	Public              bool
	MinAge              int32
	MaxAge              int32
	RequireVerification bool
	CreatedBy           int32
	Type                string
}
