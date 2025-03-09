package main

//go:generate go run github.com/go-jet/jet/v2/cmd/jet -dsn=postgres://postgres:postgres@localhost:5434/hradec?sslmode=disable -path=./gen
import (
	"encoding/csv"
	"fmt"
	"os"
	"regexp"
	"scripts/populate/gen/hradec/public/model"
	"scripts/populate/gen/hradec/public/table"
	"strconv"
	"strings"

	"github.com/XSAM/otelsql"
	_ "github.com/lib/pq"
)

type Pin struct {
	Lat float64
	Lon float64
}

type Place struct {
	ID                string
	Type              string
	SubType           *string
	Name              string
	Description       *string
	Accessibility     int64
	AccessibilityNote *string
	Capacity          *int64
	CapacityNote      *string
	Phones            []string
	Email             *string
	Web               string
	Okres             string
	Obce              string
	Address           string
	Point             Pin
}

func run() error {
	dbConn, err := otelsql.Open("postgres", "postgres://postgres:postgres@localhost:5434/hradec?sslmode=disable")
	if err != nil {
		return err
	}

	err = dbConn.Ping()
	if err != nil {
		return err
	}

	places, err := getAllPlaces()
	if err != nil {
		return err
	}
	dbplaces := mapToDB(places)
	stmt := table.Places.INSERT(table.Places.AllColumns).MODELS(dbplaces)
	fmt.Println(stmt.DebugSql())
	r, err := stmt.Exec(dbConn)
	if err != nil {
		return err
	}
	rows, err := r.RowsAffected()
	if err != nil {
		return err
	}
	fmt.Println(rows)
	return nil
}

func mapToDB(places []Place) []model.Places {
	result := []model.Places{}
	for _, place := range places {
		// if place.Obce != "Hradec Králové" {
		// 	continue
		// }
		// Use PostGIS function to make a point
		fmt.Printf("ST_MakePoint(%f, %f)", place.Point.Lon, place.Point.Lat)
		var capacity32 *int32 = nil
		if place.Capacity != nil {
			capacity32 = toPtr(int32(*place.Capacity))
		}
		result = append(result, model.Places{
			ID:                place.ID,
			Type:              place.Type,
			Name:              place.Name,
			Description:       place.Description,
			Accessibility:     int32(place.Accessibility),
			AccessibilityNote: place.AccessibilityNote,
			Capacity:          capacity32,
			CapacityNote:      place.CapacityNote,
			Web:               place.Web,
			Okres:             place.Okres,
			Obce:              place.Obce,
			Address:           place.Address,
			Lat:               &place.Point.Lat,
			Lon:               &place.Point.Lon,

			// Point:             geom,
			// Point: toPtr(fmt.Sprintf("SRID=4326;POINT(15.850219 50.206973)", place.Point.Lon, place.Point.Lat)),

		})
	}
	return result
}

func main() {
	if err := run(); err != nil {
		panic(err)
	}
}

func getAllPlaces() ([]Place, error) {
	result := []Place{}

	places, err := parsePlaces("../../hradec/migrations/csvs/out_PAMATKY_Kulturní_místa___Cultural_places.csv",
		"PAMATKY",
		1, 0, toPtr(2), 3, 4, 5, 6, 7, 8, 9, 10, []int{11}, nil, nil, nil, nil, nil)
	if err != nil {
		return nil, err
	}
	result = append(result, places...)

	return result, nil

	// places, err := parsePlaces("../../hradec/migrations/csvs/Hudební_kluby_a_festival_parky_-7703215986117040335.csv",
	// 	"KLUBY_FESTIVALY", 0, 26, toPtr(3), 7, 22, 11, 15, 25, 24, 17, 18, nil, nil, toPtr(8), toPtr(4), toPtr(5), toPtr(6))
	// if err != nil {
	// 	return nil, err
	// }
	// result = append(result, places...)

	// places, err = parsePlaces("../../hradec/migrations/csvs/Kina_7325494378020973866.csv",
	// 	"KINA", 0, 25, nil, 3, 21, 10, 14, 24, 23, 16, 17, nil, nil, toPtr(4), toPtr(5), nil, nil)
	// if err != nil {
	// 	return nil, err
	// }

	// result = append(result, places...)
	// places, err = parsePlaces("../../hradec/migrations/csvs/Národní_kulturní_památky_bodové_objekty_6158076928879444772.csv",
	// 	"PAMATKY",
	// 	0, 22, toPtr(1), 0, 18, 7, 11, 21, 20, 13, 14, nil, nil, nil, nil, nil, nil)

	// if err != nil {
	// 	return nil, err
	// }
	// result = append(result, places...)
	// places, err = parsePlaces("../../hradec/migrations/csvs/Pivovary_-340792773380756746.csv",
	// 	"PIVOVARY",
	// 	0, 29, toPtr(5), 4, 19, 8, 12, 28, 27, 14, 15, []int{20, 21, 22}, toPtr(24), nil, toPtr(2), nil, nil)
	// if err != nil {
	// 	return nil, err
	// }
	// result = append(result, places...)
	// places, err = parsePlaces("../../hradec/migrations/csvs/Divadla_a_filharmonie_2818140482217729379.csv",
	// 	"DIVADLA_FILHARMONIE",
	// 	0, 27, toPtr(2), 6, 21, 10, 14, 26, 25, 16, 17, []int{22}, toPtr(23), toPtr(7), toPtr(3), toPtr(5), nil)
	// if err != nil {
	// 	return nil, err
	// }
	// result = append(result, places...)
	// places, err = parsePlaces("../../hradec/migrations/csvs/Muzea_a_galerie_-156929117348245312.csv",
	// 	"MUZEA_GALERIE",
	// 	0, 24, toPtr(6), 3, 20, 9, 13, 23, 22, 15, 16, nil, nil, toPtr(4), toPtr(5), nil, nil)
	// if err != nil {
	// 	return nil, err
	// }
	// result = append(result, places...)
	// places, err = parsePlaces("../../hradec/migrations/csvs/Technické_památky_-7149205952045496218.csv",
	// 	"PAMATKY",
	// 	0, 20, toPtr(1), 0, 15, 4, 8, 19, 18, 10, 11, []int{16}, nil, nil, nil, nil, nil)
	// if err != nil {
	// 	return nil, err
	// }
	// result = append(result, places...)
	// places, err = parsePlaces("../../hradec/migrations/csvs/Letecké_sporty_8959676097614550187.csv",
	// 	"SPORT",
	// 	0, 30, toPtr(5), 3, 19, 8, 12, 29, 28, 14, 15, []int{20, 21, 22, 23}, toPtr(25), nil, toPtr(2), nil, nil)
	// if err != nil {
	// 	return nil, err
	// }
	// result = append(result, places...)
	// places, err = parsePlaces("../../hradec/migrations/csvs/Ostatní_letní_sporty_-6176368377486830231.csv",
	// 	"SPORT",
	// 	0, 32, toPtr(5), 4, 19, 8, 12, 31, 30, 14, 15, []int{20, 21, 22, 23, 24}, toPtr(26), nil, toPtr(2), nil, nil)

	// if err != nil {
	// 	return nil, err
	// }
	// result = append(result, places...)
	// places, err = parsePlaces("../../hradec/migrations/csvs/Zámky_3381043052573979413.csv",
	// 	"PAMATKY",
	// 	0, 19, toPtr(1), 0, 15, 4, 8, 18, 17, 10, 11, nil, nil, nil, nil, nil, nil)
	// if err != nil {
	// 	return nil, err
	// }
	// result = append(result, places...)
	// return result, nil
}

func toPtr[T any](x T) *T {
	return &x
}

func parsePlaces(filepath, fileType string,
	nameIdx, idIdx int, // Music: 26, 0; Kino: 25, 0
	descriptionIdx *int, accessibilityIdx, // Music: 3; Kino: None, 3;
	webIdx, okresIdx, // Music: 22, 11; Kino: 21, 10
	obceIdx, latIdx, // Music: 15, 25; Kino: 14, 24
	lonIdx, streetIdx, // Music: 24, 17; Kino: 23, 16
	streetNumIdx int, // Music: 18; Kino: 17
	phoneIdxs []int, // Music: None, Kino: None
	emailIdx, accessibilityNoteIdx, subTypeIdx,
	capacityIdx, capacityNoteIdx *int, // music: None, 8, 4; Kino: None, 4, 5
) ([]Place, error) {
	openFile, err := os.Open(filepath)
	if err != nil {
		return nil, err
	}
	reader := csv.NewReader(openFile)
	rows, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}
	length := 0
	result := []Place{}
	for i, row := range rows {
		if len(row) != length && length != 0 {
			panic("unnormalized csv")
		}
		if i < 1 {
			for j, item := range row {
				fmt.Printf("%d: %s\n", j, item)
			}
		}
		if i > 0 {
			accessibility := int64(0)
			if row[accessibilityIdx] == "ano" || row[accessibilityIdx] == "ANO" || strings.Contains(row[accessibilityIdx], "Bez bariér") {
				accessibility = 1
			} else if row[accessibilityIdx] == "ČÁSTEČNĚ" || row[accessibilityIdx] == "částečně" {
				accessibility = 2
			} else if row[accessibilityIdx] == "ne" || row[accessibilityIdx] == "NE" {
				accessibility = 3
			}
			lat, err := strconv.ParseFloat(row[latIdx], 64)
			if err != nil {
				return nil, err
			}
			lon, err := strconv.ParseFloat(row[lonIdx], 64)
			if err != nil {
				return nil, err
			}

			var subtype *string = nil
			if subTypeIdx != nil {
				subtype = &row[*subTypeIdx]
			}

			var accessibilityNote *string = nil
			if accessibilityNoteIdx != nil {
				accessibilityNote = &row[*accessibilityNoteIdx]
			}
			var description *string = nil
			if descriptionIdx != nil {
				description = &row[*descriptionIdx]
			}
			var email *string = nil
			if emailIdx != nil {
				email = &row[*emailIdx]
			}
			var phones []string = nil
			if phoneIdxs != nil {
				phones = []string{}
				for _, idx := range phoneIdxs {
					normalizedPhone, valid := normalizeCzechPhone(row[idx])
					if valid {
						phones = append(phones, normalizedPhone)
					}
				}
			}
			var capacity *int64 = nil
			if capacityIdx != nil {
				if row[*capacityIdx] != "" {
					capacityInt, err := strconv.ParseInt(row[*capacityIdx], 10, 64)
					if err != nil {
						return nil, err
					}
					capacity = &capacityInt
				}
			}

			var capacityNote *string = nil
			if capacityNoteIdx != nil {
				capacityNote = &row[*capacityNoteIdx]
			}

			address := fmt.Sprintf("%s %s", row[streetIdx], row[streetNumIdx])

			result = append(result, Place{
				ID:                row[idIdx],
				Type:              fileType,
				SubType:           subtype,
				Name:              row[nameIdx],
				Description:       description,
				Accessibility:     accessibility,
				AccessibilityNote: accessibilityNote,
				Address:           address,
				Web:               row[webIdx],
				Phones:            phones,
				Email:             email,
				Okres:             row[okresIdx],
				Obce:              row[obceIdx],
				Capacity:          capacity,
				CapacityNote:      capacityNote,
				Point: Pin{
					Lat: lat,
					Lon: lon,
				},
			})
		}
	}
	return result, nil
}

func normalizeCzechPhone(phone string) (string, bool) {
	// Remove any non-numeric characters except the leading "+"
	phone = regexp.MustCompile(`[^\d+]`).ReplaceAllString(phone, "")

	// Check if the phone number starts with a valid Czech code (+420 or just 420)
	if strings.HasPrefix(phone, "+420") {
		phone = phone
	} else if strings.HasPrefix(phone, "420") {
		phone = "+" + phone
	} else if len(phone) == 9 {
		// Assuming local 9-digit Czech numbers without country code
		phone = "+420" + phone
	} else {
		// Invalid number, return false
		return "", false
	}

	// Validate if the phone number has the correct format and length after normalization
	if matched, _ := regexp.MatchString(`^\+420\d{9}$`, phone); matched {
		return phone, true
	}

	// If it doesn't match the expected format, return false
	return "", false
}
