//
// Code generated by go-jet DO NOT EDIT.
//
// WARNING: Changes to this file may cause incorrect behavior
// and will be lost if the code is regenerated
//

package table

import (
	"github.com/go-jet/jet/v2/postgres"
)

var Fiendships = newFiendshipsTable("public", "fiendships", "")

type fiendshipsTable struct {
	postgres.Table

	// Columns
	FromUser postgres.ColumnInteger
	ToUser   postgres.ColumnInteger
	Status   postgres.ColumnString

	AllColumns     postgres.ColumnList
	MutableColumns postgres.ColumnList
}

type FiendshipsTable struct {
	fiendshipsTable

	EXCLUDED fiendshipsTable
}

// AS creates new FiendshipsTable with assigned alias
func (a FiendshipsTable) AS(alias string) *FiendshipsTable {
	return newFiendshipsTable(a.SchemaName(), a.TableName(), alias)
}

// Schema creates new FiendshipsTable with assigned schema name
func (a FiendshipsTable) FromSchema(schemaName string) *FiendshipsTable {
	return newFiendshipsTable(schemaName, a.TableName(), a.Alias())
}

// WithPrefix creates new FiendshipsTable with assigned table prefix
func (a FiendshipsTable) WithPrefix(prefix string) *FiendshipsTable {
	return newFiendshipsTable(a.SchemaName(), prefix+a.TableName(), a.TableName())
}

// WithSuffix creates new FiendshipsTable with assigned table suffix
func (a FiendshipsTable) WithSuffix(suffix string) *FiendshipsTable {
	return newFiendshipsTable(a.SchemaName(), a.TableName()+suffix, a.TableName())
}

func newFiendshipsTable(schemaName, tableName, alias string) *FiendshipsTable {
	return &FiendshipsTable{
		fiendshipsTable: newFiendshipsTableImpl(schemaName, tableName, alias),
		EXCLUDED:        newFiendshipsTableImpl("", "excluded", ""),
	}
}

func newFiendshipsTableImpl(schemaName, tableName, alias string) fiendshipsTable {
	var (
		FromUserColumn = postgres.IntegerColumn("from_user")
		ToUserColumn   = postgres.IntegerColumn("to_user")
		StatusColumn   = postgres.StringColumn("status")
		allColumns     = postgres.ColumnList{FromUserColumn, ToUserColumn, StatusColumn}
		mutableColumns = postgres.ColumnList{StatusColumn}
	)

	return fiendshipsTable{
		Table: postgres.NewTable(schemaName, tableName, alias, allColumns...),

		//Columns
		FromUser: FromUserColumn,
		ToUser:   ToUserColumn,
		Status:   StatusColumn,

		AllColumns:     allColumns,
		MutableColumns: mutableColumns,
	}
}
